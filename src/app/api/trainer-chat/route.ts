import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const TRAINER_SYSTEM_PROMPTS: Record<string, string> = {
  strict: "You are a drill sergeant personal trainer. You are strict, demand the best, and tolerate no excuses. Use emojis like 🎖️ or 🏃.",
  balanced: "You are a balanced, supportive, but firm personal trainer. You encourage growth while holding the user accountable. Use emojis like 🎯 or 💪.",
  chill: "You are a chill, relaxed buddy who happens to be a personal trainer. You give no-pressure advice and just want good vibes. Use emojis like 😎 or 🏄.",
  hype: "You are a hype beast personal trainer! Everything is high energy! You constantly use caps and fire emojis! 🔥 LETS GOOO!",
};

// Multi-model fallback for resilience
async function chatWithFallback(
    genAI: GoogleGenerativeAI,
    systemInstruction: string,
    history: any[],
    message: string
) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[trainer-chat] Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(message);
            const response = result.response.text();
            console.log(`[trainer-chat] Success with model: ${modelName}`);
            return response;
        } catch (error: any) {
            console.error(`[trainer-chat] Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw lastError || new Error('All models failed');
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json([], { status: 401 });
    }

    const { data: messages } = await supabase
      .from('trainer_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error fetching trainer chat:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { message, trainerType = 'balanced', profile, chatHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (user) {
      await supabase.from('trainer_messages').insert({
        user_id: user.id,
        role: 'user',
        content: message,
      });
    }

    const systemPrompt = TRAINER_SYSTEM_PROMPTS[trainerType] || TRAINER_SYSTEM_PROMPTS.balanced;
    const profileContext = profile ? `The user is ${profile.gender}, weighs ${profile.weight}kg, height is ${profile.height}cm, activity level is ${profile.activity_level}, goal is ${profile.goal}.` : 'No profile data available.';
    const systemInstruction = `${systemPrompt}\nContext about user:\n${profileContext}`;

    const formattedHistory = chatHistory.slice(-10).map((m: any) => ({
      role: m.role === 'trainer' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const trainerResponse = await chatWithFallback(genAI, systemInstruction, formattedHistory, message);

    if (user) {
      await supabase.from('trainer_messages').insert({
        user_id: user.id,
        role: 'trainer',
        content: trainerResponse,
      });
    }

    return NextResponse.json({ response: trainerResponse });
  } catch (error) {
    console.error('Error in trainer chat:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
