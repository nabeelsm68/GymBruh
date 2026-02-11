import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { profile, planType } = await request.json();

        if (!profile) {
            return NextResponse.json({ error: 'No profile data provided' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const allergyInfo = profile.allergies?.length > 0
            ? `Food allergies: ${profile.allergies.join(', ')}`
            : 'No food allergies';

        const injuryInfo = profile.injuries
            ? `Physical limitations/injuries: ${profile.injuries}`
            : 'No injuries or limitations';

        const medicalInfo = profile.medical_conditions
            ? `Medical conditions: ${profile.medical_conditions}`
            : 'No medical conditions';

        const prompt = planType === 'workout'
            ? `Create a personalized 7-day workout plan. Respond ONLY with valid JSON, no markdown.

User Profile:
- Goal: ${profile.goal || 'general fitness'}
- Activity Level: ${profile.activity_level || 3}/5
- Age: ${profile.age || 'not specified'}
- Gender: ${profile.gender || 'not specified'}
- ${injuryInfo}
- ${medicalInfo}

Respond as JSON:
{
  "plan_name": "Plan title",
  "description": "1-line description",
  "days": [
    {
      "day": "Monday",
      "focus": "e.g., Upper Body",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "duration_min": null,
          "notes": "Optional form tip"
        }
      ],
      "rest_note": null
    }
  ]
}

Rules:
- Adapt for injuries/conditions
- Include warm-up and cool-down
- Mix cardio and strength
- Include 1-2 rest days
- Be specific with exercise names`
            : `Create a personalized 7-day meal plan. Respond ONLY with valid JSON, no markdown.

User Profile:
- Goal: ${profile.goal || 'general fitness'}
- Diet: ${profile.diet_preference || 'no preference'}
- ${allergyInfo}
- ${medicalInfo}
- Activity Level: ${profile.activity_level || 3}/5
- Weight: ${profile.weight_kg || 'not specified'}kg
- Height: ${profile.height_cm || 'not specified'}cm

Respond as JSON:
{
  "plan_name": "Plan title",
  "daily_calories": <number>,
  "description": "1-line description",
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "Breakfast",
          "name": "Meal name",
          "calories": <number>,
          "protein": <number>,
          "carbs": <number>,
          "fats": <number>,
          "ingredients": ["ingredient 1", "ingredient 2"]
        }
      ]
    }
  ]
}

Rules:
- Respect allergies STRICTLY — do NOT include allergenic ingredients
- Follow diet preference
- Include 4 meals: Breakfast, Lunch, Snack, Dinner
- Keep portions realistic
- Be specific with Indian and international dishes`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let jsonStr = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Plan generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate plan' },
            { status: 500 }
        );
    }
}
