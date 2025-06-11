import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../lib/openaiTool'; // Your raw OpenAI client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    messages,
    aboutThem,
    myIntentions,
    instruction,
    toneSettings,
    numSuggestions,
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  if (!instruction || typeof instruction !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid AI instruction' });
  }

  const chatHistory = messages
    .map((m: any) => `- ${m.sender}: ${m.text}`)
    .join('\n');

  // ✅ DEBUG LOGS TO VERIFY TONE SETTINGS + SUGGESTION COUNT
  console.log('🧠 AI Suggestion Request', {
    toneSettings,
    numSuggestions,
    instruction,
    aboutThem,
    myIntentions,
    messages,
  });

  const userPrompt = `
Chat history:
${chatHistory}

About them: ${aboutThem || 'N/A'}
Your intentions: ${myIntentions || 'N/A'}
`;

  const formatRequirement = `
Respond with exactly ${numSuggestions || 5} distinct message suggestions in this format:

[
  {
    "text": "Your suggestion here",
    "explanation": "Why this message works"
  },
  ...
]
`;

  const fullPrompt = instruction.trim() + '\n\n' + formatRequirement;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.9,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.4,
      n: 1,
      messages: [
        { role: 'system', content: fullPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = completion.choices[0].message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('🛑 Failed to parse OpenAI JSON:', raw);
      return res.status(500).json({ error: 'Invalid JSON from AI', raw });
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('❌ OpenAI request failed:', err);
    res.status(500).json({ error: 'OpenAI request failed', details: err.message });
  }
}
