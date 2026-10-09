require('dotenv').config();
const https = require('https');

async function testVoice() {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

    if (!ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not set');
        process.exit(1);
    }

    console.log(`\n🎤 Testing ElevenLabs voice: ${VOICE_ID}\n`);

    const payload = JSON.stringify({
        text: 'This is a test narration for Movie-bluff project.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
        },
    });

    const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = Buffer.alloc(0);

            res.on('data', chunk => {
                data = Buffer.concat([data, chunk]);
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ SUCCESS! Voice works (${data.length} bytes of audio generated)`);
                    console.log(`   Status: ${res.statusCode}`);
                    console.log(`   Voice ID: ${VOICE_ID}`);
                    resolve(data);
                } else {
                    const errorBody = data.toString();
                    console.error(`❌ FAILED with status ${res.statusCode}`);
                    console.error(`   Response: ${errorBody}`);
                    console.error(`\n💡 This voice requires a paid plan. Try these free voices instead:`);
                    console.error(`   - pNInz6obpgDQGcFmaJgB (Adam - deep male)`);
                    console.error(`   - EXAVITQu4vr4xnSDxMaL (Bella - soft female)`);
                    console.error(`   - jsCqWAovK2LkecY7zXl4 (Freya - expressive female)`);
                    reject(new Error(`ElevenLabs error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', error => {
            console.error(`❌ Request failed: ${error.message}`);
            reject(new Error(`ElevenLabs request failed: ${error.message}`));
        });

        req.write(payload);
        req.end();
    });
}

testVoice().catch(() => process.exit(1));
