const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DriveService = require('./lib/drive-service');
const AIService = require('./lib/ai-service');
const GitHubService = require('./lib/github-service');
const { extractText } = require('./lib/utils');

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || '';

const DATA_DIR = path.join(__dirname, '../src/data');
const METADATA_PATH = path.join(DATA_DIR, 'cv-metadata.json');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function main() {
    console.log('🚀 Starting Refactored CV Update Process...');

    try {
        validateConfig();

        const drive = new DriveService(GOOGLE_API_KEY, DRIVE_FOLDER_ID);
        const ai = new AIService(GROQ_API_KEY);
        const github = new GitHubService('alfarabusalihu', process.env.GITHUB_TOKEN);

        // 1. Google Drive Sync
        const files = await drive.listFiles();
        const cvFile = files.find(f => f.mimeType === 'application/pdf');
        const imgFile = files.find(f => f.mimeType.startsWith('image/'));

        const metadata = loadMetadata();

        if (cvFile && cvFile.modifiedTime !== metadata.cvModifiedTime) {
            console.log('📄 CV change detected. Downloading and analyzing...');
            const cvPath = await drive.download(cvFile.id, path.join(PUBLIC_DIR, 'cv.pdf'));
            const text = await extractText(cvPath);

            if (text.length > 500) {
                const skills = await ai.analyzeSkills(text);
                fs.writeFileSync(path.join(DATA_DIR, 'generated-skills.json'), JSON.stringify(skills, null, 2));
                metadata.cvModifiedTime = cvFile.modifiedTime;
            }
        }

        if (imgFile && imgFile.modifiedTime !== metadata.imgModifiedTime) {
            console.log('� Profile image change detected. Updating...');
            await drive.download(imgFile.id, path.join(PUBLIC_DIR, 'profile.jpg'));
            metadata.imgModifiedTime = imgFile.modifiedTime;
        }

        // 2. GitHub Project Sync
        const repos = await github.fetchRepos();
        const portfolioRepos = repos.filter(r => r.topics?.includes('portfolio'));

        let currentProjects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));

        for (const repo of portfolioRepos) {
            const existing = currentProjects.find(p => p.link.toLowerCase() === repo.html_url.toLowerCase());
            if (!existing || repo.updated_at > metadata.lastSync) {
                console.log(`📡 Syncing project: ${repo.name}`);
                const analysis = await ai.analyzeProject(repo);

                const newProject = {
                    title: repo.name.replace(/-/g, ' ').toUpperCase(),
                    description: analysis.description,
                    link: repo.html_url,
                    websiteLink: repo.homepage || "",
                    tags: repo.topics || [],
                    isAutoSync: true
                };

                if (existing) {
                    Object.assign(existing, newProject);
                } else {
                    currentProjects.push({ ...newProject, image: `/projects/${repo.name}.jpg` });
                }
            }
        }

        fs.writeFileSync(PROJECTS_PATH, JSON.stringify(currentProjects, null, 2));
        metadata.lastSync = new Date().toISOString();
        saveMetadata(metadata);

        console.log('✨ All systems synced successfully!');

    } catch (error) {
        console.error('❌ Sync Failed:', error.message);
        process.exit(1);
    }
}

function validateConfig() {
    const missing = [];
    if (!GROQ_API_KEY) missing.push('GROQ_API_KEY');
    if (!GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY (or NEXT_PUBLIC_GOOGLE_API_KEY)');
    if (!DRIVE_FOLDER_ID) missing.push('DRIVE_FOLDER_ID (or NEXT_PUBLIC_DRIVE_FOLDER_ID)');

    if (missing.length > 0) {
        throw new Error(`Missing environment credentials: ${missing.join(', ')}. Check GitHub Secrets or .env file.`);
    }
}

function loadMetadata() {
    try {
        return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    } catch {
        return { cvModifiedTime: '', imgModifiedTime: '', lastSync: '' };
    }
}

function saveMetadata(data) {
    fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
}

main();
