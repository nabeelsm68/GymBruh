const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (err) { }

if (!apiKey) { console.log("No API Key"); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('--- MODELS ---');
                json.models.forEach(m => console.log(m.name.replace('models/', '')));
            } else {
                console.log('No models found.');
            }
        } catch (e) {
            console.log('Error parsing: ' + e.message);
        }
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
