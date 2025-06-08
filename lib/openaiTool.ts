// lib/openaiTool.ts

import OpenAI from 'openai';

// ✅ Export OpenAI client (for suggest-agent.ts)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type SuggestionToolInput = {
  messages: { sender: string; text: string }[];
  context?: {
    aboutThem?: string;
    myIntentions?: string;
  };
};

// ✅ Existing tool-based approach for legacy use
export const openaiSuggestTool = {
  name: 'suggest',
  description: 'Generate message suggestions using OpenAI based on intent and relationship context.',
  run: async ({ messages, context }: SuggestionToolInput) => {
    const intent = context?.myIntentions || 'none';
    const about = context?.aboutThem || 'none';

    const systemPrompt = `
You are a warm, emotionally intelligent AI assistant helping a user craft thoughtful messages.

Your goal: based on the user's relationship context (aboutThem: "${about}") and goals ("${intent}"),
generate 3 distinct suggestions for how they could respond.

Each suggestion must be an object with:
- "text": the suggested message
- "explanation": 1 sentence about why it fits the situation

Format your response as a JSON array like:
[
  { "text": "Hey! That sounds great.", "explanation": "Friendly and casual tone to show interest." },
  ...
]
`;

    const userContent = `
Conversation:
${messages.map((m) => `${m.sender}: ${m.text}`).join('\n')}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.9,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.4,
      n: 1,
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: userContent.trim() },
      ],
    });

    const raw = completion.choices[0].message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse AI JSON:', raw);
      parsed = raw
        .split('\n')
        .map((line) => ({ text: line.trim(), explanation: '' }))
        .filter((s) => s.text);
    }

    return {
      suggestions: parsed,
    };
  },
};
