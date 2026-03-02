const { MongoClient } = require('mongodb');

class MongoDBService {
    constructor(uri) {
        this.uri = uri;
        this.client = new MongoClient(uri);
        this.dbName = 'portfolio_db';
    }

    async connect() {
        if (!this.client.connectLine) {
            await this.client.connect();
        }
        return this.client.db(this.dbName);
    }

    /**
     * Stores a file buffer in MongoDB.
     * @param {string} fileName - unique name (e.g. 'cv.pdf')
     * @param {Buffer} buffer - file data
     * @param {string} contentType - mime type
     */
    async uploadFile(fileName, buffer, contentType) {
        const db = await this.connect();
        const collection = db.collection('assets');

        console.log(`📤 Uploading ${fileName} to MongoDB...`);

        await collection.updateOne(
            { fileName },
            {
                $set: {
                    fileName,
                    data: buffer,
                    contentType,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log(`✅ ${fileName} stored successfully.`);
    }

    async close() {
        await this.client.close();
    }
}

module.exports = MongoDBService;
