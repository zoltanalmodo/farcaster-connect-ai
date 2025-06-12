// pages/api/refine-agent.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { aiObservationsAboutThem, aiObservationsAboutMe } = req.body;

  if (!aiObservationsAboutThem || !aiObservationsAboutMe) {
    return res.status(400).json({ error: 'Missing observations.' });
  }

  const prompt = `
You are a helpful assistant that gives communication advice and tone settings for a messaging AI.
Based on the following observations, do two things:

1. Suggest how the user should behave in this relationship (as a short paragraph).
2. Suggest AI tone settings as values between 0.0 and 1.0 for:
   - Warmth
   - Formality
   - Humor
   - Empathy

Observations About Them:
${aiObservationsAboutThem}

Observations About Me In This Relationship:
${aiObservationsAboutMe}

Format your response as a JSON object like this:
{
  "suggestedBehavior": "string",
  "suggestedTone": {
    "warmth": 0.7,
    "formality": 0.4,
    "humor": 0.9,
    "empathy": 0.6
  }
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('❌ Error in /api/refine-agent:', err);
    return res.status(500).json({ error: 'Failed to generate refinement suggestions.' });
  }
}
