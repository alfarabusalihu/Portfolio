const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DriveService = require('./lib/drive-service');
const AIService = require('./lib/ai-service');
const GitHubService = require('./lib/github-service');
const { MongoClient } = require('mongodb');
const { extractText } = require('./lib/utils');

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || '';
const MONGO_URI = process.env.MONGO_URI ?? '';

const PUBLIC_DIR = path.join(__dirname, '../public');

async function replace(db, type, data) {
    await db.collection('portfolio').deleteOne({ _type: type });
    await db.collection('portfolio').insertOne({ _type: type, data, updatedAt: new Date() });
}

async function loadMetadata(db) {
    const doc = await db.collection('portfolio').findOne({ _type: 'metadata' });
    return doc?.data ?? { cvFileId: '', imgFileId: '', lastSync: '' };
}

async function main() {
    console.log('🚀 Starting CV Update Process...');
    validateConfig();

    const mongo = new MongoClient(MONGO_URI);
    await mongo.connect();
    const db = mongo.db();
    console.log('✅ Connected to MongoDB');

    try {
        const drive = new DriveService(GOOGLE_API_KEY, DRIVE_FOLDER_ID);
        const ai = new AIService(GROQ_API_KEY);
        const github = new GitHubService('alfarabusalihu', process.env.GITHUB_PAT || process.env.NEXT_PUBLIC_GITHUB_ACTIONS_TOKEN);

        // ── 1. Google Drive Sync ──────────────────────────────────────────
        const files = await drive.listFiles();
        const cvFile = files.find(f => f.mimeType === 'application/pdf');
        const imgFile = files.find(f => f.mimeType.startsWith('image/'));

        const metadata = await loadMetadata(db);

        if (cvFile && cvFile.id !== metadata.cvFileId) {
            console.log('📄 New CV detected. Downloading and analyzing...');
            const cvPath = await drive.download(cvFile.id, path.join(PUBLIC_DIR, 'cv.pdf'));
            const text = await extractText(cvPath);

            if (text.length > 500) {
                // Analyze skills with Groq
                const skills = await ai.analyzeSkills(text);
                await replace(db, 'skills', skills);
                console.log('✅ Skills saved to MongoDB');

                // Replace CV binary in MongoDB assets collection (delete old, insert new)
                const cvBuffer = fs.readFileSync(cvPath);
                await db.collection('assets').deleteOne({ fileName: 'cv.pdf' });
                await db.collection('assets').insertOne({
                    fileName: 'cv.pdf',
                    data: cvBuffer,
                    contentType: 'application/pdf',
                    updatedAt: new Date()
                });
                console.log('✅ CV PDF saved to MongoDB');

                metadata.cvFileId = cvFile.id;
            } else {
                console.warn('⚠️ CV text too short — skipping analysis');
            }
        } else {
            console.log('✅ CV unchanged');
        }

        if (imgFile && imgFile.id !== metadata.imgFileId) {
            console.log('🖼️ New profile image detected. Updating...');
            await drive.download(imgFile.id, path.join(PUBLIC_DIR, 'profile.jpg'));
            metadata.imgFileId = imgFile.id;
            console.log('✅ Profile image updated');
        } else {
            console.log('✅ Profile image unchanged');
        }

        // ── 2. GitHub Projects Sync ───────────────────────────────────────
        try {
            const repos = await github.fetchRepos();
            const portfolioRepos = repos.filter(r => r.topics?.includes('portfolio'));
            console.log(`📡 Found ${portfolioRepos.length} portfolio repos`);

            const existingDoc = await db.collection('portfolio').findOne({ _type: 'projects' });
            let currentProjects = existingDoc?.data ?? [];

            for (const repo of portfolioRepos) {
                const existing = currentProjects.find(
                    p => p.link.toLowerCase() === repo.html_url.toLowerCase()
                );
                if (!existing || repo.updated_at > metadata.lastSync) {
                    console.log(`📡 Syncing project: ${repo.name}`);
                    const analysis = await ai.analyzeProject(repo);
                    const newProject = {
                        title: repo.name.replace(/-/g, ' ').toUpperCase(),
                        description: analysis.description,
                        link: repo.html_url,
                        websiteLink: repo.homepage || '',
                        tags: analysis.tags || [],
                        isAutoSync: true,
                        image: `/projects/${repo.name}.jpg`,
                    };
                    if (existing) {
                        Object.assign(existing, newProject);
                    } else {
                        currentProjects.push(newProject);
                    }
                }
            }

            await replace(db, 'projects', currentProjects);
            console.log('✅ Projects saved to MongoDB');
        } catch (ghErr) {
            console.warn(`⚠️ GitHub sync skipped: ${ghErr.message}`);
            console.warn('   CV and skills were still saved. Projects will sync on next run.');
        }

        // ── 3. Save metadata ──────────────────────────────────────────────
        metadata.lastSync = new Date().toISOString();
        await replace(db, 'metadata', metadata);
        console.log('✅ Metadata saved to MongoDB');

        console.log('✨ All systems synced successfully!');
    } finally {
        await mongo.close();
    }
}

function validateConfig() {
    const missing = [];
    if (!GROQ_API_KEY) missing.push('GROQ_API_KEY');
    if (!GOOGLE_API_KEY) missing.push('GOOGLE_API_KEY');
    if (!DRIVE_FOLDER_ID) missing.push('DRIVE_FOLDER_ID');
    if (!MONGO_URI) missing.push('MONGO_URI');
    if (missing.length > 0) {
        throw new Error(`Missing credentials: ${missing.join(', ')}`);
    }
}

main().catch(e => {
    console.error('❌ Sync Failed:', e.message);
    process.exit(1);
});
