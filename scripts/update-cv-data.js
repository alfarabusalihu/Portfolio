const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.groq_key;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.drive_api_key;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || process.env.drive_folder_id;

const DATA_DIR = path.join(__dirname, '../src/data');
const METADATA_PATH = path.join(DATA_DIR, 'cv-metadata.json');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

const GITHUB_USERNAME = 'alfarabusalihu';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Initialize directories
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/**
 * Main execution flow
 */
async function main() {
    console.log('🚀 Starting CV Update Process...');
    try {
        validateConfig();
        cleanupOldFiles();

        const files = await listDriveFiles();
        const cvFile = files.find(f => f.mimeType === 'application/pdf');
        const imgFile = files.find(f => f.mimeType.startsWith('image/'));

        // Smart Update Check
        const metadata = loadMetadata();
        const hasCvChanged = cvFile && cvFile.modifiedTime !== metadata.cvModifiedTime;
        const hasImgChanged = imgFile && imgFile.modifiedTime !== metadata.imgModifiedTime;

        if (!hasCvChanged && !hasImgChanged) {
            console.log('⏭️  No changes detected in Google Drive files. Skipping update.');
            return;
        }

        let cvPath = path.join(PUBLIC_DIR, 'cv.pdf');
        if (cvFile && hasCvChanged) {
            console.log(`✅ Selected CV: ${cvFile.name} (Changed)`);
            cvPath = await downloadDriveFile(cvFile.id, cvPath);
        }

        if (imgFile && hasImgChanged) {
            console.log(`✅ Selected Profile Pic: ${imgFile.name} (Changed)`);
            await downloadDriveFile(imgFile.id, path.join(PUBLIC_DIR, 'profile.jpg'));
        }

        if (cvFile && hasCvChanged) {
            const text = await extractText(cvPath);
            if (text && text.length > 100) {
                const skillsData = await analyzeWithRetry(text, analyzeSkills);

                if (validateSkillsData(skillsData)) {
                    fs.writeFileSync(
                        path.join(DATA_DIR, 'generated-skills.json'),
                        JSON.stringify(skillsData, null, 2)
                    );

                    // Update metadata for Drive
                    const currentMeta = loadMetadata();
                    saveMetadata({
                        ...currentMeta,
                        cvModifiedTime: cvFile ? cvFile.modifiedTime : currentMeta.cvModifiedTime,
                        imgModifiedTime: imgFile ? imgFile.modifiedTime : currentMeta.imgModifiedTime
                    });

                    console.log('✨ SUCCESS: Skills updated.');
                }
            } else {
                console.warn('⚠️  Minimal text extracted. Skipping skill update.');
            }
        }

        // --- NEW: GitHub Project Sync ---
        await syncProjects();

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        process.exit(1);
    }
}

/**
 * AI Analysis with Retry Logic
 */
async function analyzeWithRetry(input, analyzerFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await analyzerFn(input);
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`⚠️  AI Analysis attempt ${i + 1} failed. Retrying...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

/**
 * Validation Logic
 */
function validateConfig() {
    if (!GROQ_API_KEY || !GOOGLE_API_KEY || !DRIVE_FOLDER_ID) {
        throw new Error('Missing environment variables in .env (GROQ_API_KEY, GOOGLE_API_KEY, or DRIVE_FOLDER_ID)');
    }
}

function validateSkillsData(data) {
    if (!data || typeof data !== 'object') return false;
    const hasStacks = Array.isArray(data.stacks) && data.stacks.length > 0;
    const hasTools = Array.isArray(data.tools) && data.tools.length > 0;

    if (!hasStacks || !hasTools) {
        console.warn('⚠️  AI returned empty lists. Aborting save to protect data.');
        return false;
    }
    return true;
}

/**
 * Drive & File Helpers
 */
async function listDriveFiles() {
    console.log('🔍 Scanning Google Drive...');
    const query = `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&key=${GOOGLE_API_KEY}&fields=files(id, name, mimeType, modifiedTime)`;

    const data = await getHttps(url);
    const json = JSON.parse(data);
    return json.files || [];
}

/**
 * Metadata Persistence
 */
function loadMetadata() {
    try {
        if (fs.existsSync(METADATA_PATH)) {
            return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
        }
    } catch (e) {
        console.warn('⚠️  Could not load metadata, forcing full update.');
    }
    return { cvModifiedTime: '', imgModifiedTime: '', lastProjectCount: 0 };
}

function saveMetadata(data) {
    try {
        fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2));
        console.log('📝 Metadata updated.');
    } catch (e) {
        console.error('❌ Failed to save metadata:', e.message);
    }
}

async function downloadDriveFile(fileId, destPath) {
    const tempPath = destPath + '.tmp';
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;

    await performDownload(url, tempPath);

    try {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        fs.renameSync(tempPath, destPath);
        return destPath;
    } catch (error) {
        if (error.code === 'EBUSY') {
            console.warn(`⚠️  ${path.basename(destPath)} is locked. AI will use the latest temp download.`);
            return tempPath;
        }
        throw error;
    }
}

function cleanupOldFiles() {
    const files = fs.readdirSync(PUBLIC_DIR);
    files.forEach(file => {
        if (/^cv_.*\.pdf$/.test(file) || /^profile_.*\.jpg$/.test(file) || file.endsWith('.tmp')) {
            try { fs.unlinkSync(path.join(PUBLIC_DIR, file)); } catch (e) { }
        }
    });
}

/**
 * AI Extraction Core
 */
async function analyzeSkills(text) {
    console.log('🤖 Analyzing skills with Groq AI...');
    const prompt = `You are a professional technical recruiter. 
Analyze the CV text and extract technical skills.
Output ONLY JSON in this format: 
{
  "stacks": [{"name": "React", "icon": "React"}],
  "tools": [{"name": "Docker", "icon": "Docker"}]
}
"icon" MUST be a valid PascalCase Lucide icon name.

CV TEXT:
${text.slice(0, 10000)}`;

    const postData = JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' }
    });

    const response = await postHttps('api.groq.com', '/openai/v1/chat/completions', postData, GROQ_API_KEY);
    return JSON.parse(JSON.parse(response).choices[0].message.content);
}

/**
 * Projects Sync Core
 */
async function syncProjects() {
    console.log('🐙 Fetching projects from GitHub...');
    try {
        const repos = await fetchGitHubRepos();
        const portfolioRepos = repos.filter(r => r.topics && r.topics.includes('portfolio'));

        if (portfolioRepos.length === 0) {
            console.log('ℹ️  No repos with "portfolio" topic found. Add the "portfolio" topic to your repos on GitHub to sync them.');
            return;
        }

        // Load existing projects
        let existingProjects = [];
        if (fs.existsSync(PROJECTS_PATH)) {
            existingProjects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
        }

        if (portfolioRepos.length === metadata.lastProjectCount && !hasCvChanged) {
            console.log('⏭️  No new portfolio repositories detected. Skipping project sync.');
            return;
        }

        console.log(`📡 Found ${portfolioRepos.length} portfolio project(s) on GitHub. Syncing...`);

        for (const repo of portfolioRepos) {
            // Check if already exists (by link)
            const exists = existingProjects.some(p => p.link === repo.html_url);
            if (exists) {
                console.log(`   - ${repo.name} already exists. Skipping analysis.`);
                continue;
            }

            console.log(`   - Analyzing NEW project: ${repo.name}...`);
            const projectData = await analyzeWithRetry(repo, analyzeProject);
            if (projectData) {
                existingProjects.push({
                    title: repo.name.replace(/-/g, ' ').toUpperCase(),
                    description: projectData.description || repo.description,
                    image: `/projects/${repo.name}.jpg`, // Standard naming convention
                    link: repo.html_url,
                    websiteLink: repo.homepage || "",
                    tags: projectData.tags || repo.topics || [],
                    complexityScore: projectData.complexityScore || 5,
                    architecture: projectData.architecture || 'Unknown',
                    difficulty: projectData.difficulty || 'Medium',
                    isAutoSync: true
                });
            }
        }

        fs.writeFileSync(PROJECTS_PATH, JSON.stringify(existingProjects, null, 2));

        // Update metadata with count to avoid re-scanning
        saveMetadata({
            ...metadata,
            lastProjectCount: portfolioRepos.length
        });

        console.log(`✨ SUCCESS: Synced projects in projects.json`);
    } catch (e) {
        console.error('❌ GitHub Sync Error:', e.message);
    }
}

async function fetchGitHubRepos() {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
    const options = {
        headers: {
            'User-Agent': 'Node.js',
            'Accept': 'application/vnd.github.v3+json'
        }
    };
    if (GITHUB_TOKEN) options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(data)) : reject(new Error(`GitHub Error: ${res.statusCode}`)));
        }).on('error', reject);
    });
}

async function analyzeProject(repo) {
    const prompt = `You are a Senior Architect. Analyze this GitHub repository and generate technical metadata.
REPO: ${repo.name}
DESCRIPTION: ${repo.description}
TOPICS: ${repo.topics?.join(', ')}

Output ONLY JSON in this format:
{
  "description": "Short recruiter-friendly summary (2 lines)",
  "tags": ["React", "Go", "Redis"],
  "complexityScore": 1-10 integer,
  "architecture": "Monolith/Serverless/etc",
  "difficulty": "Easy/Medium/Hard"
}`;

    const postData = JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' }
    });

    const response = await postHttps('api.groq.com', '/openai/v1/chat/completions', postData, GROQ_API_KEY);
    return JSON.parse(JSON.parse(response).choices[0].message.content);
}

async function extractText(pdfPath) {
    try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(fs.readFileSync(pdfPath));
        return data.text;
    } catch (error) {
        console.error('PDF Parse Error:', error.message);
        return '';
    }
}

/**
 * Generic Network Helpers
 */
function getHttps(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(new Error(`API Error: ${res.statusCode}`)));
        }).on('error', reject);
    });
}

function postHttps(hostname, path, body, apiKey) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname, path, method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(new Error(`Post Error: ${res.statusCode} - ${data}`)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function performDownload(url, destPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode)) return performDownload(res.headers.location, destPath).then(resolve).catch(reject);
            if (res.statusCode !== 200) return reject(new Error(`Download Error: ${res.statusCode}`));
            const writer = fs.createWriteStream(destPath);
            res.pipe(writer);
            writer.on('finish', () => writer.close(resolve));
            writer.on('error', e => { fs.unlink(destPath, () => { }); reject(e); });
        }).on('error', reject);
    });
}

main();
