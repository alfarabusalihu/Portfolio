const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * Generic GET request
 */
function getHttps(url, options = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(new Error(`GET Error: ${res.statusCode} - ${data}`)));
        }).on('error', reject);
    });
}

/**
 * Generic POST request
 */
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
            res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(new Error(`POST Error: ${res.statusCode} - ${data}`)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode)) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) return reject(new Error(`Download Error: ${res.statusCode}`));
            const writer = fs.createWriteStream(destPath);
            res.pipe(writer);
            writer.on('finish', () => writer.close(resolve));
            writer.on('error', e => { fs.unlink(destPath, () => { }); reject(e); });
        }).on('error', reject);
    });
}

/**
 * Extract text from PDF
 */
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

module.exports = { getHttps, postHttps, downloadFile, extractText };
