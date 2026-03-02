const { getHttps, downloadFile } = require('./utils');
const fs = require('fs');

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

        await downloadFile(url, tempPath);

        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        fs.renameSync(tempPath, destPath);
        return destPath;
    }
}

module.exports = DriveService;
