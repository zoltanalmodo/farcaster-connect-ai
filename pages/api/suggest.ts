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
      model: 'gpt-3.5-turbo', // ✅ changed from gpt-4
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `You are an assistant that helps users craft thoughtful messages based on relationship goals and recent chats.
Return 1–3 message suggestions. Each should include a short reason (tone, intention, etc.).
Respond in JSON format:
{ "suggestions": [ { "text": "message", "reason": "why it's good" }, ... ] }`,
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