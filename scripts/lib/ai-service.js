const https = require('https');
const url = require('url');

class AIService {
    constructor(workerUrl) {
        this.workerUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
    }

    // ── Step 1: Parse raw PDF text → clean structured JSON ───────────────
    async parseCvToJson(rawText) {
        console.log('📋 Parsing CV text into structured JSON...');
        const prompt = `The following text was extracted from a PDF CV using a text parser. Because the PDF uses a multi-column layout, the text is scrambled — section labels may be separated from their values, and lines may be out of order.

Your job is to reconstruct the original CV structure into clean JSON. Read ALL the text carefully and piece together what belongs together.

Return ONLY this JSON structure:
{
  "name": "full name",
  "title": "job title or role",
  "contact": {
    "email": "",
    "phone": "",
    "portfolio": "",
    "github": "",
    "linkedin": ""
  },
  "summary": "personal statement text",
  "skills": {
    "programming": ["JavaScript", "TypeScript"],
    "frontend": ["Next.js", "React"],
    "backend": ["Node.js", "Express.js"],
    "databases": ["PostgreSQL", "MongoDB"],
    "cloudDevOps": ["AWS", "Docker"],
    "aiIntegration": ["LLMs", "Vector Databases"],
    "toolsWorkflow": ["Git", "Jira"]
  },
  "experience": [
    {
      "role": "",
      "company": "",
      "period": "",
      "bullets": [],
      "stacks": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "period": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "bullets": [],
      "link": ""
    }
  ]
}

Rules:
- Use ONLY information present in the text. Do NOT invent or infer anything.
- For skills: map each skill EXACTLY as written to the correct category based on context clues in the text.
- If a category has no skills mentioned, use an empty array.
- Return ONLY valid JSON, no explanation.

SCRAMBLED CV TEXT:
${rawText.slice(0, 10000)}`;

        return this._callWorker('analyze-cv', prompt);
    }

    // ── Step 2: Convert structured CV JSON → portfolio skills format ──────
    async analyzeSkills(rawText) {
        console.log('🤖 Step 1: Parsing CV structure...');
        const cvJson = await this.parseCvToJson(rawText);

        console.log('📊 Parsed CV skills section:');
        console.log(JSON.stringify(cvJson.skills, null, 2));

        console.log('🤖 Step 2: Converting to portfolio skills format...');

        // Flatten all skills from the structured CV into a single list
        const allSkills = Object.entries(cvJson.skills || {})
            .flatMap(([category, items]) =>
                (items || []).map(name => ({ name: name.trim(), category }))
            )
            .filter(s => s.name.length > 0);

        console.log('📝 All skills found in CV:', allSkills.map(s => s.name).join(', '));

        const prompt = `Given this list of technical skills extracted from a CV, categorize each one into either "stacks" (languages, frameworks, libraries) or "tools" (databases, DevOps, cloud, design tools, workflow tools).

Skills to categorize:
${JSON.stringify(allSkills, null, 2)}

For each skill, assign an "icon" from this EXACT list of valid Lucide React icon names. Pick the closest match:
- Languages/General: Code, Code2, Terminal, Braces, Hash
- JavaScript: Braces
- TypeScript: FileCode
- Go: Cpu
- Python: Code
- React: Atom
- Next.js: Globe
- Angular: Triangle
- Node.js: Server
- Express.js: Server
- Tailwind CSS: Paintbrush
- Ant Design: Layout
- ShadCN: Layers
- HTML: FileCode2
- CSS: Paintbrush2
- Vue: Triangle
- Docker: Container
- Terraform: Cloud
- AWS: Cloud
- Git: GitBranch
- GitHub: Github
- Jira: Trello
- Figma: Figma
- PostgreSQL: Database
- MongoDB: Database
- MySQL: Database
- Amazon DynamoDB: Database
- SQLite: Database
- Redis: Database
- LLMs: BrainCircuit
- Vector Databases: Database
- Prompt Engineering: MessageSquare
- API Integration: Plug
- REST API: Plug
- GraphQL: Share2
- Kubernetes: Box
- CI/CD: GitMerge
- Linux: Terminal
- Zap (default fallback)

Return ONLY this JSON:
{
  "stacks": [{"name": "exact name from input", "icon": "LucideIconName"}],
  "tools": [{"name": "exact name from input", "icon": "LucideIconName"}]
}

Rules:
- Include EVERY skill from the input list — do NOT drop any
- Use the EXACT name as provided in the input
- Do NOT add any skills not in the input list
- Do NOT duplicate items
- Return ONLY valid JSON`;

        const result = await this._callWorker('analyze-cv', prompt);

        console.log('✅ Final skills:');
        console.log('  Stacks:', result.stacks?.map(s => s.name).join(', '));
        console.log('  Tools:', result.tools?.map(t => t.name).join(', '));

        return result;
    }

    // ── Project analysis ─────────────────────────────────────────────────
    async analyzeProject(repo) {
        const prompt = `Analyze this GitHub repo and return a JSON object with two fields.
NAME: ${repo.name}
DESCRIPTION: ${repo.description || 'none'}
LANGUAGES: ${repo.languages?.join(', ') || 'none'}
TOPICS: ${repo.topics?.filter(t => t !== 'portfolio').join(', ') || 'none'}

Output ONLY JSON:
{
  "description": "One concise sentence describing what this project does.",
  "tags": ["Tag1", "Tag2", "Tag3"]
}

For "description": write a short factual sentence. Do NOT use "You are" or roleplay language.
For "tags": use the actual frameworks and tools from the languages/topics. Return 3-6 tags max. Do NOT include "portfolio" as a tag.`;

        return this._callWorker('analyze-project', prompt);
    }

    // ── Generate narration script with Google Gemini ────────────────────
    async generateNarrationScript(repo) {
        const prompt = `Generate a short, natural voice narration script for this GitHub project.

NAME: ${repo.name}
DESCRIPTION: ${repo.description || 'none'}
TOPICS: ${repo.topics?.filter(t => t !== 'portfolio').join(', ') || 'none'}
LANGUAGES: ${repo.languages?.join(', ') || 'none'}

Output ONLY the script text (no JSON, no markdown, no explanations):
Hi, I'm Tess, let me tell you about [PROJECT]...

Requirements:
- Start with "Hi, I'm Tess, let me tell you about [PROJECT NAME]"
- 100-150 words
- Natural conversational tone
- Mention 2-3 key technologies
- End positively`;

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_API_KEY not configured for script generation');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 500 },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('No response from Gemini');
        }

        const script = data.candidates[0].content.parts[0].text;
        return script.trim();
    }

    // ── Call Cloudflare Worker ───────────────────────────────────────────
    async _callWorker(task, data) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({ task, data });

            const parsed = new URL(this.workerUrl);
            const options = {
                hostname: parsed.hostname,
                path: parsed.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', chunk => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const parsed = JSON.parse(responseData);
                            resolve(parsed);
                        } else {
                            reject(new Error(`Worker error: ${res.statusCode} - ${responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse worker response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Worker request failed: ${error.message}`));
            });

            req.write(payload);
            req.end();
        });
    }
}

module.exports = AIService;
