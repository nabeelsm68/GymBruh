const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const fs = require('fs');

const envPath = path.resolve('.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (err) { }

if (!apiKey) { console.log("No API Key"); process.exit(1); }

async function test() {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log("Testing gemini-2.0-flash...");
    try {
        const result = await model.generateContent("Hi");
        console.log("Success! Response: " + result.response.text());
    } catch (e) {
        console.log("Error details:");
        console.log(e.toString());
        if (e.response) {
            console.log("Response body: " + JSON.stringify(e.response, null, 2));
        }
    }
}

test();
