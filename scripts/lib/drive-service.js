const { getHttps, downloadFile } = require('./utils');
const fs = require('fs');
const path = require('path');
const os = require('os');

class DriveService {
    constructor(apiKey, folderId) {
        this.apiKey = apiKey;
        this.folderId = folderId;
    }

    async listFiles() {
        console.log('🔍 Scanning Google Drive...');
        const query = `'${this.folderId}' in parents and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&key=${this.apiKey}&fields=files(id, name, mimeType, modifiedTime)`;

        const data = await getHttps(url);
        return JSON.parse(data).files || [];
    }

    async download(fileId, destPath) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`;
        const tempPath = destPath + '.tmp';

        // Ensure directory exists
        const dir = path.dirname(tempPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await downloadFile(url, tempPath);

        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        fs.renameSync(tempPath, destPath);
        return destPath;
    }

    async getCVFromDrive() {
        try {
            // List files in folder
            const files = await this.listFiles();
            
            // Find CV file (PDF or text)
            const cvFile = files.find(f => 
                f.name.toLowerCase().includes('cv') || 
                f.name.toLowerCase().includes('resume') ||
                f.name.toLowerCase().endsWith('.pdf') ||
                f.name.toLowerCase().endsWith('.txt')
            );

            if (!cvFile) {
                throw new Error('No CV file found in Google Drive folder');
            }

            // Download CV - use OS temp directory
            const tempDir = os.tmpdir();
            const tempPath = path.join(tempDir, `cv-${Date.now()}`);
            
            await this.download(cvFile.id, tempPath);
            
            let cvText;
            let cvBuffer;
            
            // If PDF, parse it; otherwise read as text
            if (cvFile.name.toLowerCase().endsWith('.pdf')) {
                const pdfParse = require('pdf-parse');
                cvBuffer = fs.readFileSync(tempPath);
                const data = await pdfParse(cvBuffer);
                cvText = data.text;
            } else {
                cvText = fs.readFileSync(tempPath, 'utf-8');
                cvBuffer = Buffer.from(cvText, 'utf-8');
            }
            
            fs.unlinkSync(tempPath);
            
            // Return text, buffer, AND metadata
            return { 
                text: cvText, 
                buffer: cvBuffer,
                fileId: cvFile.id,
                modifiedTime: cvFile.modifiedTime,
                fileName: cvFile.name
            };
        } catch (error) {
            throw new Error(`Failed to fetch CV from Google Drive: ${error.message}`);
        }
    }
}

module.exports = DriveService;
