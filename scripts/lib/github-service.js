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
        return JSON.parse(data);
    }
}

module.exports = GitHubService;
