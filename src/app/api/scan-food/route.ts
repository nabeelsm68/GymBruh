import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Multi-model fallback for resilience (mirrors generate-plan)
async function analyzeWithFallback(
    genAI: GoogleGenerativeAI,
    prompt: string,
    imageData: { mimeType: string; data: string }
) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[scan-food] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([
                { text: prompt },
                { inlineData: imageData },
            ]);
            const response = result.response;
            console.log(`[scan-food] Success with model: ${modelName}`);
            return response.text();
        } catch (error: any) {
            console.error(`[scan-food] Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error('All models failed');
}

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured. Add GEMINI_API_KEY to .env.local' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Extract base64 data
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

        const prompt = `You are an expert nutritionist AI. Analyze this food image and provide detailed nutritional information.

Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{
  "food_name": "Name of the food (be specific, e.g. 'Lay's Classic Potato Chips' not just 'chips')",
  "food_items": ["item1", "item2"],
  "serving_size": "estimated serving size (e.g. '1 packet (28g)', '1 plate', '1 bowl')",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "fiber": <number in grams>,
  "sugar": <number in grams>,
  "sodium": <number in mg>,
  "category": "<homemade or outside>",
  "health_score": <number 1-10, where 10 is healthiest>,
  "health_verdict": "<one-line verdict like 'High in sodium and fat — enjoy in moderation' or 'Great balanced meal!'>" ,
  "healthy_recipe": "<If category is outside, provide a step-by-step healthy homemade recipe with numbered steps like '1. Step one\\n2. Step two\\n3. Step three'. Keep it 4-6 clear steps. If homemade, set to null>",
  "confidence": "<high, medium, or low>"
}

Rules:
- Estimate macros for a single standard serving
- "homemade" = looks home-cooked, simple ingredients
- "outside" = looks like restaurant/fast food/packaged food/branded products
- If you can read a brand name or packaging, use it for more accurate estimates
- If outside food, provide a healthier homemade alternative recipe
- Keep macro numbers realistic based on actual nutritional data
- health_score: 1-3 = unhealthy, 4-6 = moderate, 7-10 = healthy
- Return ONLY the JSON object, no extra text or markdown`;

        const responseText = await analyzeWithFallback(genAI, prompt, {
            mimeType,
            data: base64Data,
        });

        // Parse JSON from response (handle potential markdown wrapping)
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        try {
            const data = JSON.parse(jsonStr);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error('[scan-food] JSON parse error:', parseError);
            console.error('[scan-food] Raw response:', responseText);
            return NextResponse.json(
                { error: 'Failed to parse AI response. Please try again.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('[scan-food] Error:', error.message || error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze food image. AI service might be busy — try again.' },
            { status: 500 }
        );
    }
}
