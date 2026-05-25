const { postHttps } = require('./utils');

class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    // ── Step 1: Parse raw PDF text → clean structured JSON ───────────────
    // The PDF uses a two-column layout so pdf-parse scrambles the text.
    // This step asks the AI to reconstruct the structure before any skill
    // extraction happens, giving us accurate source data.
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

        return this._queryGroq(prompt);
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

        const result = await this._queryGroq(prompt);

        console.log('✅ Final skills:');
        console.log('  Stacks:', result.stacks?.map(s => s.name).join(', '));
        console.log('  Tools:', result.tools?.map(t => t.name).join(', '));

        return result;
    }

    // ── Project analysis (unchanged) ─────────────────────────────────────
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

        return this._queryGroq(prompt);
    }

    // ── Groq API call ─────────────────────────────────────────────────────
    async _queryGroq(prompt) {
        const body = JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        const res = await postHttps('api.groq.com', '/openai/v1/chat/completions', body, this.apiKey);
        return JSON.parse(JSON.parse(res).choices[0].message.content);
    }
}

module.exports = AIService;
