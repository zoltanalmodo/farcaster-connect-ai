// lib/openaiTool.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type SuggestionToolInput = {
  messages: { sender: string; text: string }[];
  context?: {
    aboutThem?: string;
    myIntentions?: string;
  };
};

export const openaiSuggestTool = {
  name: 'suggest',
  description: 'Suggests relationship-aware messages.',
  run: async ({ messages, context }: SuggestionToolInput) => {
    const systemPrompt = `
You are a thoughtful assistant helping users send emotionally intelligent messages.

Context:
- About them: ${context?.aboutThem}
- Intentions: ${context?.myIntentions}

Return 3 message suggestions in JSON format:
[
  { "text": "...", "explanation": "..." }
]
    `.trim();

    const userInput = messages.map((m) => `${m.sender}: ${m.text}`).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      temperature: 0.8,
    });

    const raw = response.choices[0].message?.content ?? '[]';

    try {
      return { output: JSON.parse(raw) };
    } catch (err) {
      console.error('❌ Failed to parse OpenAI response:', raw);
      return { output: [] };
    }
  },
};
