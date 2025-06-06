// pages/api/suggest.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ensure in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            "You are an assistant that helps generate conversation replies. You are helpful, insightful, and mindful of relationship dynamics. Return 1–3 brief replies with a short explanation of tone/intention for each.",
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const aiReply = response.choices[0].message?.content;

    // Try to parse multiple suggestions from one message (if in list format)
    let suggestions: { text: string; reason: string }[] = [];

    const regex = /(\d+)[\).\s-]+(.+?)\s*-\s*(.*?)(?=\n\d|$)/gs;
    let match;
    while ((match = regex.exec(aiReply || '')) !== null) {
      suggestions.push({
        text: match[2].trim(),
        reason: match[3].trim(),
      });
    }

    // fallback if parsing failed
    if (suggestions.length === 0 && aiReply) {
      suggestions.push({ text: aiReply.trim(), reason: 'General response' });
    }

    res.status(200).json({ suggestions });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
