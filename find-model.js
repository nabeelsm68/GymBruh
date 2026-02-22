const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Get API Key
const envPath = path.resolve('.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (err) { }

if (!apiKey) { console.log("No API Key"); process.exit(1); }

async function findWorkingModel() {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Hardcoded list of potential models to check since listModels might be flaky or version dependent
    const candidates = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro-001',
        'gemini-1.0-pro',
        'gemini-pro',
        'text-bison-001'
    ];

    console.log("Testing models...");

    for (const modelName of candidates) {
        process.stdout.write(`Trying ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS! Response: ${result.response.text()}`);
            console.log(`!!! USE THIS MODEL: ${modelName} !!!`);
            return;
        } catch (e) {
            console.log(`❌ Failed: ${e.message.split('\n')[0]}`);
        }
    }
    console.log("All common model names failed.");
}

findWorkingModel();
