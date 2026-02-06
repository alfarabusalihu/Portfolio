const fs = require('fs');
const path = require('path');

async function testPDFExtraction() {
    try {
        console.log('Testing PDF extraction...');
        const pdfPath = path.join(__dirname, '../public/cv.pdf');

        if (!fs.existsSync(pdfPath)) {
            console.log('ERROR: cv.pdf not found at', pdfPath);
            return;
        }

        console.log('PDF file found. Reading...');
        const dataBuffer = fs.readFileSync(pdfPath);
        console.log(`File size: ${dataBuffer.length} bytes`);

        console.log('Parsing PDF...');
        // Try default export
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(dataBuffer);

        console.log(`SUCCESS! Extracted ${data.text.length} characters`);
        console.log('First 500 characters:');
        console.log(data.text.slice(0, 500));

    } catch (error) {
        console.log('FAILED:', error.message);
    }
}

testPDFExtraction();
