import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Manual env loading
const envPath = path.resolve('.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (err) {
    console.error('Error reading .env.local:', err.message);
}

async function test() {
    if (!apiKey) {
        console.error('No API key found in .env.local');
        return;
    }
    console.log('API Key found:', apiKey.substring(0, 5) + '...');

    try {
        console.log('Testing gemini-2.0-flash...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Hello, world!');
        console.log('Response (2.0-flash):', result.response.text());
    } catch (error) {
        console.error('Error with gemini-2.0-flash:', error.message);

        // Try fallback
        try {
            console.log('Retrying with gemini-1.5-flash...');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent('Hello, world!');
            console.log('Response (1.5-flash):', result.response.text());
        } catch (err) {
            console.error('Error with gemini-1.5-flash:', err.message);

            // Try gemini-pro
            try {
                console.log('Retrying with gemini-pro...');
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                const result = await model.generateContent('Hello, world!');
                console.log('Response (gemini-pro):', result.response.text());
            } catch (err2) {
                console.error('Error with gemini-pro:', err2.message);
            }
        }
    }
}

test();
