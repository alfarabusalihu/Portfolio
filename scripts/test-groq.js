require('dotenv').config();

const GROQ_API_KEY = process.env.groq_key;

async function testGroq() {
    try {
        console.log('Testing Groq API...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Say "Hello World"' }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const txt = await response.text();
            console.log('Error response:', txt);
            return;
        }

        const json = await response.json();
        console.log('SUCCESS! Response:', json.choices[0].message.content);

    } catch (error) {
        console.log('FAILED:', error.message);
    }
}

testGroq();
