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

async function list() {
    if (!apiKey) return console.log('No API Key');
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try the model directly.
        // Actually, for the JS SDK, we iterate.
        // But simpler: let's try 'gemini-1.5-flash' again and capture its EXACT error in log.

        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success 1.5-flash:", result.response.text());
    } catch (e) {
        console.log("Error 1.5-flash:", e.message);
    }
}
list();
