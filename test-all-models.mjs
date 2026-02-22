import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (err) { }

if (!apiKey) { console.log("No API Key"); process.exit(1); }

const models = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testAll() {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of models) {
        console.log(`Trying model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ SUCCESS with ${modelName}`);
            return; // Found a working one
        } catch (e) {
            console.log(`❌ FAILED ${modelName}: ${e.message.split('\n')[0]}`); // Print first line of error
        }
    }
    console.log("All models failed.");
}

testAll();
