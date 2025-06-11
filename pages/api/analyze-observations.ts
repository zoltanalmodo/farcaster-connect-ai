import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../lib/openaiTool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  const formattedMessages = messages
    .map((m: any) => `- ${m.sender.toUpperCase()}: ${m.content}`)
    .join('\n');

  const prompt = `
You are an assistant that analyzes a conversation between two people.

Here is the chat history:
${formattedMessages}

TASK 1 — Observations about THEM (the other person):
From their tone, habits, and patterns, write a short paragraph describing THEM.

TASK 2 — Observations about ME:
Based on how I communicate in this conversation, write a short paragraph describing ME in this relationship.

Respond in this JSON format:
{
  "aboutThemAI": "observation about them",
  "aboutMeAI": "observation about me"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = completion.choices[0].message?.content || '';

    try {
      const parsed = JSON.parse(raw);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error('Failed to parse AI JSON:', raw);
      return res.status(500).json({ error: 'Invalid JSON from AI', raw });
    }
  } catch (err: any) {
    console.error('AI request failed:', err);
    return res.status(500).json({ error: 'OpenAI error', details: err.message });
  }
}
