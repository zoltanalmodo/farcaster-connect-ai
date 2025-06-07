// lib/openaiTool.ts

type SuggestionToolInput = {
  messages: { sender: string; text: string }[];
  context?: {
    aboutThem?: string;
    myIntentions?: string;
  };
};

export const openaiSuggestTool = {
  name: 'suggest',
  description: 'Generate message suggestions using OpenAI based on intent and relationship context.',
  run: async ({ messages, context }: SuggestionToolInput) => {
    const intent = context?.myIntentions || 'none';
    const about = context?.aboutThem || 'none';

    const systemPrompt = `You are CastCompass AI. Help the user send messages based on their intent: "${intent}" and relationship context: "${about}".`;

    const userMessages = messages.map((m) => `${m.sender}: ${m.text}`).join('\n');

    const prompt = `${systemPrompt}\n\nConversation:\n${userMessages}\n\nRespond with 1–3 reply suggestions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const json = await response.json();

    const raw = json?.choices?.[0]?.message?.content || '';
    const suggestions = raw.split('\n').map((s: string) => s.trim()).filter(Boolean);


    return {
      suggestions,
    };
  },
};
