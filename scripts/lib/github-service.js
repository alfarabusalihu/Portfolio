const { getHttps } = require('./utils');

class GitHubService {
    constructor(username, token = null) {
        this.username = username;
        this.token = token;
    }

    async fetchRepos() {
        console.log('🐙 Fetching projects from GitHub...');
        const url = `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`;
        const options = {
            headers: {
                'User-Agent': 'Node.js',
                'Accept': 'application/vnd.github.v3+json'
            }
        };
        if (this.token) options.headers['Authorization'] = `token ${this.token}`;

        const data = await getHttps(url, options);
        const repos = JSON.parse(data);

        // Fetch languages for each repo in parallel
        const reposWithLanguages = await Promise.all(
            repos.map(async (repo) => {
                try {
                    const langData = await getHttps(repo.languages_url, options);
                    repo.languages = Object.keys(JSON.parse(langData));
                } catch {
                    repo.languages = [];
                }
                return repo;
            })
        );

        return reposWithLanguages;
    }
}

module.exports = GitHubService;
