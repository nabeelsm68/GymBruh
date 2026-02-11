import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Extract base64 data
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';

        const prompt = `Analyze this food image and provide nutritional information. Respond ONLY with valid JSON in this exact format, no markdown:
{
  "food_name": "Name of the food",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "category": "<homemade or outside>",
  "healthy_recipe": "<If category is outside, provide a simple healthy homemade version recipe in 3-4 lines. If homemade, set to null>",
  "confidence": "<high, medium, or low>"
}

Rules:
- Estimate macros for a single standard serving
- "homemade" = looks home-cooked, simple ingredients
- "outside" = looks like restaurant/fast food/packaged food
- If outside food, provide a healthier homemade alternative recipe
- Keep macro numbers realistic
- Return ONLY the JSON object, no extra text`;

        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
        ]);

        const responseText = result.response.text();

        // Parse JSON from response (handle potential markdown wrapping)
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Food scan error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze food image' },
            { status: 500 }
        );
    }
}
