import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

// Helper function to try multiple models
async function generateWithFallback(genAI: GoogleGenerativeAI, prompt: string) {
  // Valid models for this key based on testing
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with model: ${modelName} `);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error(`Model ${modelName} failed: `, error.message);
      lastError = error;
    }
  }
  throw lastError || new Error('All models failed');
}

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

    const allergyInfo = profile.allergies?.length > 0
      ? `Food allergies(MUST AVOID): ${profile.allergies.join(', ')} `
      : 'No food allergies';

    const injuryInfo = profile.injuries
      ? `Physical limitations / injuries(MUST AVOID / MODIFY): ${profile.injuries} `
      : 'No injuries or limitations';

    const medicalInfo = profile.medical_conditions
      ? `Medical conditions(CONSIDER): ${profile.medical_conditions} `
      : 'No medical conditions';

    const vibeStyle = profile.vibe === 'strict' ? 'Strict, no-nonsense, high discipline'
      : profile.vibe === 'hype' ? 'High energy, enthusiastic, hyping up'
        : profile.vibe === 'chill' ? 'Relaxed, flexible, encouraging'
          : 'Balanced, professional, supportive';

    const userContext = `User: ${profile.name || 'Guest'}
Age: ${profile.age || 'N/A'}, Gender: ${profile.gender || 'N/A'}
Height: ${profile.height_cm || 'N/A'} cm, Weight: ${profile.weight_kg || 'N/A'} kg
Goal: ${profile.goal ? profile.goal.replace('_', ' ') : 'General Fitness'}
        Activity Level: ${profile.activity_level || 3}/5
        Diet Preference: ${profile.diet_preference || 'None'}
        ${allergyInfo}
        ${injuryInfo}
        ${medicalInfo}
        Coach Persona: ${vibeStyle} `;

    let prompt = '';

    if (planType === 'workout') {
      prompt = `Create a highly personalized 7 - day workout plan for this user.
  ${userContext}

            Requirements:
  - Tone: ${vibeStyle}
- Custom Plan Name: Creative and motivating title
  - Description: 1 - 2 sentence motivating summary
    - Structure: 7 days including rest days
      - Exercises: Specific names, sets, reps(or duration)
        - Warmup / Cooldown: implicit but ensure volume is appropriate
          - Injuries: STRICTLY modify exercises to accommodate "${profile.injuries || 'none'}"

            Respond ONLY with valid JSON(no markdown formatting).JSON Structure:
{
  "plan_name": "string",
    "description": "string",
      "days": [
        {
          "day": "Monday",
          "focus": "string (e.g., Push / Legs / Cardio)",
          "exercises": [
            {
              "name": "string",
              "sets": number,
              "reps": "string",
              "duration_min": number | null,
              "notes": "string (form cues or motivation)"
            }
          ],
          "rest_note": "string | null (if rest day, short recovery tip)"
        }
      ]
} `;
    } else {
      prompt = `Create a highly personalized 7 - day meal plan for this user.
  ${userContext}

            Requirements:
  - Tone: ${vibeStyle}
- Custom Plan Name: Creative and tasty title
  - Description: 1 - 2 sentence summary
    - Calories / Macros: Estimate reasonable targets based on stats / goal
      - Diet: STRICTLY follow "${profile.diet_preference || 'no preference'}"
        - Allergies: STRICTLY AVOID "${profile.allergies?.join(', ') || 'none'}"
          - Cuisine: Mix of simple healthy meals and interesting dishes.If diet is Indian / Asian, include culturally relevant dishes.

            Respond ONLY with valid JSON(no markdown formatting).JSON Structure:
{
  "plan_name": "string",
    "description": "string",
      "daily_calories": number,
        "days": [
          {
            "day": "Monday",
            "meals": [
              {
                "type": "Breakfast",
                "name": "string",
                "calories": number,
                "protein": number,
                "carbs": number,
                "fats": number,
                "ingredients": ["string"]
              }
            ]
          }
        ]
}
            Include 3 - 4 meals per day(Breakfast, Lunch, Dinner, Snack).`;
    }

    const responseText = await generateWithFallback(genAI, prompt);

    // Robust JSON extraction
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    try {
      const data = JSON.parse(jsonStr);

      // Save plan to database for authenticated users
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from('plans').insert({
            user_id: user.id,
            type: planType,
            content: data,
          });

          // Increment plan generation count on profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('plan_generation_count')
            .eq('id', user.id)
            .single();

          const currentCount = profileData?.plan_generation_count || 0;
          await supabase
            .from('profiles')
            .update({ plan_generation_count: currentCount + 1 })
            .eq('id', user.id);
        }
      } catch (dbError) {
        // Don't fail the request if DB save fails (guest mode or DB issue)
        console.error('Plan save error (non-critical):', dbError);
      }

      return NextResponse.json(data);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate plan. AI service might be busy.' },
      { status: 500 }
    );
  }
}
