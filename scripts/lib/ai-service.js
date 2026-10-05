const https = require('https');

class AIService {
    constructor(geminiApiKeyCV, geminiApiKeyAudio) {
        this.geminiApiKeyCV = geminiApiKeyCV || process.env.GEMINI_API_KEY_CV;
        this.geminiApiKeyAudio = geminiApiKeyAudio || process.env.GEMINI_API_KEY_AUDIO;
        
        if (!this.geminiApiKeyCV) {
            throw new Error('GEMINI_API_KEY_CV required for CV analysis');
        }
        if (!this.geminiApiKeyAudio) {
            throw new Error('GEMINI_API_KEY_AUDIO required for audio generation');
        }
    }

    // ── Analyze skills from CV ─────────────────────────────────────────
    async analyzeSkills(rawText) {
        console.log('🤖 Extracting skills from CV...');
        
        const prompt = `Extract technical skills from this CV and return ONLY this JSON:
{
  "stacks": ["skill1", "skill2", "skill3"],
  "tools": ["tool1", "tool2", "tool3"]
}

Instructions:
- stacks: programming languages and frameworks (JavaScript, React, TypeScript, Next.js, Python, etc.)
- tools: databases, DevOps, cloud (PostgreSQL, Docker, AWS, Git, etc.)
- Return valid JSON only, no markdown, no explanations

CV TEXT:
${rawText}`;

        const result = await this._callGemini(prompt, { maxOutputTokens: 2000, keyType: 'cv' });

        // Ensure we have the correct structure
        if (!result.stacks) result.stacks = [];
        if (!result.tools) result.tools = [];

        console.log('✅ Skills extracted:');
        console.log('  Stacks:', result.stacks?.join(', ') || '(none)');
        console.log('  Tools:', result.tools?.join(', ') || '(none)');

        return result;
    }

    // ── Analyze projects one by one ──────────────────────────────────
    async analyzeAllProjects(repos) {
        console.log(`🤖 Analyzing ${repos.length} projects individually with Gemini...`);
        
        const results = [];
        const errors = [];
        
        for (let i = 0; i < repos.length; i++) {
            const repo = repos[i];
            console.log(`   [${i + 1}/${repos.length}] Analyzing: ${repo.name}`);
            
            try {
                const analyzed = await this.analyzeSingleProject(repo);
                results.push(analyzed);
                console.log(`   ✅ ${repo.name}`);
                
                // Add delay between requests to avoid rate limits (except for last request)
                if (i < repos.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                }
            } catch (error) {
                console.error(`   ❌ ${repo.name}: ${error.message}`);
                errors.push({
                    repo: repo.name,
                    error: error.message,
                });
                // Continue with next project instead of throwing
            }
        }
        
        console.log(`✅ Analyzed ${results.length}/${repos.length} projects successfully`);
        if (errors.length > 0) {
            console.log(`⚠️  ${errors.length} projects failed:`);
            errors.forEach(e => console.log(`     - ${e.repo}: ${e.error}`));
        }
        
        return { results, errors };
    }

    // ── Analyze single project ──────────────────────────────────────
    async analyzeSingleProject(repo) {
        const prompt = `You must return ONLY valid JSON, nothing else.

Analyze this GitHub repository:
Repository: ${repo.name}
Description: ${repo.description || 'No description'}
Topics: ${repo.topics?.join(', ') || 'none'}
URL: ${repo.html_url}
Homepage: ${repo.homepage || 'none'}

Return this exact JSON structure:
{
  "name": "${repo.name}",
  "description": "brief professional summary in 15-25 words",
  "stacks": ["tech1", "tech2", "tech3"],
  "link": "${repo.html_url}",
  "websiteLink": ${repo.homepage ? `"${repo.homepage}"` : 'null'}
}

Rules:
- description must be concise and professional
- stacks should list 3-5 main technologies
- websiteLink should be the homepage URL or null
- Return ONLY the JSON object, no markdown formatting, no explanations`;

        const result = await this._callGemini(prompt, { 
            maxOutputTokens: 500, 
            keyType: 'cv',
            jsonMode: true 
        });
        
        // Validate structure
        if (!result.name || !result.link) {
            throw new Error('Invalid response structure from Gemini');
        }
        
        return result;
    }

    // ── Generate narration script ──────────────────────────────────────
    async generateNarrationScript(project) {
        const prompt = `Generate a voice narration script for this GitHub project.

Project:
- Name: ${project.title}
- Description: ${project.description || 'none'}
- Technologies: ${project.tags?.join(', ') || 'none'}

Requirements:
- Start with: "Hi, I'm Tess, let me tell you about ${project.title}..."
- 100-150 words
- Natural conversational tone
- Mention 2-3 key technologies from the tags list
- End positively
- Return ONLY the script text, no markdown or explanation`;

        const result = await this._callGemini(prompt, { maxOutputTokens: 500, keyType: 'audio', textOnly: true });
        return result; // Return the plain text script
    }

    // ── Call Google Gemini API ─────────────────────────────────────────
    async _callGemini(prompt, options = {}) {
        const maxOutputTokens = options.maxOutputTokens || 2000;
        const keyType = options.keyType || 'cv';
        const jsonMode = options.jsonMode || false;
        const textOnly = options.textOnly || false; // New option for plain text responses
        
        // Select the appropriate API key
        const apiKey = keyType === 'audio' ? this.geminiApiKeyAudio : this.geminiApiKeyCV;
        
        return new Promise((resolve, reject) => {
            const generationConfig = {
                temperature: 0.1,
                maxOutputTokens: maxOutputTokens
            };
            
            // Enable JSON mode if requested
            if (jsonMode) {
                generationConfig.response_mime_type = 'application/json';
            }
            
            const payload = JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: generationConfig
            });

            const urlPath = `/v1/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
            const options_req = {
                hostname: 'generativelanguage.googleapis.com',
                path: urlPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const req = https.request(options_req, (res) => {
                let responseData = '';

                res.on('data', chunk => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const parsed = JSON.parse(responseData);
                            
                            // Extract text from Gemini response
                            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            
                            if (!text) {
                                console.error('⚠️  Empty response from Gemini');
                                throw new Error('Empty response from Gemini');
                            }
                            
                            // If textOnly mode, return the plain text directly
                            if (textOnly) {
                                resolve(text.trim());
                                return;
                            }
                            
                            // If JSON mode is enabled, response should be pure JSON
                            if (jsonMode) {
                                try {
                                    const result = JSON.parse(text);
                                    resolve(result);
                                    return;
                                } catch (jsonError) {
                                    console.error('⚠️  JSON mode response is not valid JSON:', text.substring(0, 200));
                                    throw new Error(`JSON mode failed: ${jsonError.message}`);
                                }
                            }
                            
                            // Try to parse as JSON
                            let result;
                            try {
                                result = JSON.parse(text);
                            } catch (firstError) {
                                // Remove markdown code blocks
                                let cleanText = text
                                    .replace(/^```json\n?/, '')
                                    .replace(/\n?```$/, '')
                                    .trim();
                                
                                // Extract JSON between first { and last }
                                const startIdx = cleanText.indexOf('{');
                                const endIdx = cleanText.lastIndexOf('}');
                                
                                if (startIdx === -1 || endIdx === -1) {
                                    // Try array
                                    const arrayStart = cleanText.indexOf('[');
                                    const arrayEnd = cleanText.lastIndexOf(']');
                                    
                                    if (arrayStart === -1 || arrayEnd === -1) {
                                        console.error('⚠️  No JSON found in response:', text.substring(0, 200));
                                        throw new Error('No JSON found in response');
                                    }
                                    
                                    let jsonStr = cleanText.substring(arrayStart, arrayEnd + 1);
                                    result = this._parseAndFixJSON(jsonStr);
                                } else {
                                    let jsonStr = cleanText.substring(startIdx, endIdx + 1);
                                    result = this._parseAndFixJSON(jsonStr);
                                }
                            }
                            
                            resolve(result);
                        } else if (res.statusCode === 429) {
                            reject(new Error('Gemini API error: 429 (rate limit exceeded)'));
                        } else {
                            reject(new Error(`Gemini API error: ${res.statusCode}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse Gemini response: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Gemini request failed: ${error.message}`));
            });

            req.write(payload);
            req.end();
        });
    }

    // ── Parse and fix incomplete JSON ──────────────────────────────────
    _parseAndFixJSON(jsonStr) {
        // Remove common formatting issues
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
        jsonStr = jsonStr.replace(/[\r\n]+/g, ' ');  // Normalize whitespace
        jsonStr = jsonStr.replace(/:\s*'/g, ': "');  // Convert single quotes to double quotes for values
        jsonStr = jsonStr.replace(/'\s*([,}\]])/g, '"$1');  // Close quoted values with double quotes

        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // Try to fix common issues
            console.log('⚠️  JSON parse error, attempting fixes...');
            console.log('   Error at position', e.message);
            
            // Remove unescaped quotes inside strings
            jsonStr = jsonStr.replace(/: "([^"]*)"([^"]*)"([^"]*?)"/g, ': "$1$2$3"');
            
            // For arrays, truncate to last complete object
            if (jsonStr.trim().startsWith('[')) {
                let lastCompleteIdx = -1;
                let depth = 0;
                
                for (let i = 0; i < jsonStr.length; i++) {
                    if (jsonStr[i] === '{') depth++;
                    if (jsonStr[i] === '}') {
                        depth--;
                        if (depth === 0) lastCompleteIdx = i;
                    }
                }
                
                if (lastCompleteIdx > 0) {
                    jsonStr = jsonStr.substring(0, lastCompleteIdx + 1) + ']';
                    try {
                        return JSON.parse(jsonStr);
                    } catch (e2) {
                        console.log('   Still invalid after truncation');
                    }
                }
            }
            
            throw new Error(`JSON parse failed at position ${e.message.match(/\d+/) || 'unknown'}: ${e.message}`);
        }
    }
}

module.exports = AIService;
