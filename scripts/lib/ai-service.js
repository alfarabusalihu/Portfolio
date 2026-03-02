const { postHttps } = require('./utils');

class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async analyzeSkills(text) {
        console.log('🤖 Analyzing skills with Groq AI...');
        const prompt = `Analyze this CV text and extract technical skills. Output ONLY JSON:
{ "stacks": [{"name": "React", "icon": "React"}], "tools": [{"name": "Docker", "icon": "Docker"}] }
"icon" MUST be a valid PascalCase Lucide icon name.
CV TEXT: ${text.slice(0, 8000)}`;

        return this._queryGroq(prompt);
    }

    async analyzeProject(repo) {
        const prompt = `Analyze this GitHub repo and generate a professional 2nd person bio.
NAME: ${repo.name}, DESC: ${repo.description}, TOPICS: ${repo.topics?.join(', ')}
Output ONLY JSON: { "description": "Concise 2-line summary." }`;

        return this._queryGroq(prompt);
    }

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
