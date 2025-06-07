// pages/api/suggest.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.9,
      top_p: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.4,
      n: 1,
      messages: [
        {
          role: 'system',
          content: `
You are a warm, emotionally intelligent AI assistant helping a user craft thoughtful messages for someone they care about.

Your task is to generate 3 *distinct* message suggestions based on the conversation and relationship context.
Each suggestion should include:
- A short, thoughtful message (tone can be playful, caring, casual, or witty).
- A brief reason why this message works (explaining tone, intention, or impact).

Respond strictly in this JSON format:
{
  "suggestions": [
    { "text": "Message one here", "reason": "Why it works" },
    { "text": "Message two here", "reason": "Why it works" },
    { "text": "Message three here", "reason": "Why it works" }
  ]
}
Make sure each message is meaningfully different from the others.
`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const raw = completion.choices[0].message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse OpenAI JSON:', raw);
      return res.status(500).json({ error: 'Invalid JSON from AI', raw });
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('OpenAI request failed:', err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
