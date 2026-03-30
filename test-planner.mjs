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

const profile = {
    name: "Test User",
    age: 30,
    gender: "male",
    height_cm: 180,
    weight_kg: 80,
    goal: "build_muscle",
    activity_level: 3,
    diet_preference: "vegetarian",
    allergies: ["Peanuts"],
    injuries: "Bad knee",
    medical_conditions: "",
    vibe: "strict"
};

async function testPlan(type) {
    if (!apiKey) {
        console.error('No API key found in .env.local');
        return;
    }

    console.log(`Testing ${type} plan generation with gemini-2.5-flash...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Replicating the prompt logic from route.ts for testing
    const allergyInfo = profile.allergies?.length > 0
        ? `Food allergies (MUST AVOID): ${profile.allergies.join(', ')}`
        : 'No food allergies';

    const injuryInfo = profile.injuries
        ? `Physical limitations/injuries (MUST AVOID/MODIFY): ${profile.injuries}`
        : 'No injuries or limitations';

    const medicalInfo = profile.medical_conditions
        ? `Medical conditions (CONSIDER): ${profile.medical_conditions}`
        : 'No medical conditions';

    const vibeStyle = 'Strict, no-nonsense, high discipline';

    const userContext = `User: ${profile.name}
  Age: ${profile.age}, Gender: ${profile.gender}
  Height: ${profile.height_cm}cm, Weight: ${profile.weight_kg}kg
  Goal: Build Muscle
  Activity Level: 3/5
  Diet Preference: Vegetarian
  ${allergyInfo}
  ${injuryInfo}
  ${medicalInfo}
  Coach Persona: ${vibeStyle}`;

    let prompt = '';
    if (type === 'workout') {
        prompt = `Create a highly personalized 7-day workout plan for this user.
      ${userContext}
      Requirements:
      - Tone: ${vibeStyle}
      - Custom Plan Name: Creative and motivating title
      - Description: 1-2 sentence motivating summary
      - Structure: 7 days including rest days
      - Exercises: Specific names, sets, reps (or duration)
      - Warmup/Cooldown: implicit but ensure volume is appropriate
      - Injuries: STRICTLY modify exercises to accommodate "${profile.injuries}"
      Respond ONLY with valid JSON...`;
        // ... truncated for brevity in test, just checking if model responds 
    } else {
        prompt = `Create a highly personalized 7-day meal plan... ${userContext} ... Respond ONLY with valid JSON...`;
    }

    try {
        const result = await model.generateContent(prompt);
        console.log(`${type} plan generated successfully!`);
        console.log('Preview:', result.response.text().substring(0, 200) + '...');
    } catch (error) {
        console.error(`Error generating ${type} plan:`, error.toString());
        if (error.response) {
            console.error('Error response:', JSON.stringify(error.response, null, 2));
        }
    }
}

async function run() {
    await testPlan('diet');
    await testPlan('workout');
}

run();
