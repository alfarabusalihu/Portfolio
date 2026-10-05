const { getHttps } = require('./utils');
const crypto = require('crypto');

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

        return repos;
    }

    /**
     * Get hash of repository README content (for change detection)
     */
    async getReadmeHash(repoName) {
        try {
            const url = `https://api.github.com/repos/${this.username}/${repoName}/readme`;
            const options = {
                headers: {
                    'User-Agent': 'Node.js',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };
            if (this.token) options.headers['Authorization'] = `token ${this.token}`;

            const data = await getHttps(url, options);
            const readme = JSON.parse(data);
            
            // Create hash from README content
            const content = Buffer.from(readme.content, 'base64').toString('utf-8');
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            // README doesn't exist or can't be accessed
            return null;
        }
    }

    /**
     * Check if a repository has had significant changes
     * Returns true if:
     * - README hash has changed (content updates)
     * - Repository was updated after the last narration generation
     */
    async hasSignificantRepoChange(repoTitle, storedReadmeHash, lastGeneratedAt) {
        try {
            // Convert title to repo name (e.g., "PORTFOLIO" -> "portfolio")
            const repoName = repoTitle.toLowerCase().replace(/\s+/g, '-');
            
            // Get current README hash
            const currentHash = await this.getReadmeHash(repoName);
            
            // If we can't get current hash or there's no stored hash, consider it unchanged
            if (!currentHash || !storedReadmeHash) {
                return false;
            }
            
            // Check if README content has changed
            if (currentHash !== storedReadmeHash) {
                console.log(`   ℹ️  ${repoTitle}: README content changed`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log(`   ⚠️  Could not check changes for ${repoTitle}: ${error.message}`);
            return false; // Don't regenerate on error
        }
    }
}

module.exports = GitHubService;
