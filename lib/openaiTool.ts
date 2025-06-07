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
  description: 'Generate message suggestions using OpenAI.',
  run: async ({ messages, context }: SuggestionToolInput) => {
    const systemPrompt = `You are CastCompass AI. Help the user send messages based on their intent: ${context?.myIntentions || 'none'} and relationship info: ${context?.aboutThem || 'none'}.`;

    const userMessages = messages.map((m) => `${m.sender}: ${m.text}`).join('\n');

    const prompt = `${systemPrompt}\n\n${userMessages}\n\nRespond with 1-3 reply suggestions.`;

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

    return {
      suggestions: json.choices?.[0]?.message?.content?.split('\n').filter(Boolean) || [],
    };
  },
};
