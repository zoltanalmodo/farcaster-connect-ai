// pages/api/suggest-refinements.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../lib/openaiTool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { aiObservationsAboutThem, aiObservationsAboutMe } = req.body;

  if (!aiObservationsAboutThem || !aiObservationsAboutMe) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `
You are an emotionally intelligent assistant.

Your task is to:
1. Suggest how the user should behave in this relationship.
2. Suggest ideal AI tone settings: warmth, formality, humor, empathy (0.0 to 1.0).

Input:
- Observations about them: ${aiObservationsAboutThem}
- Observations about the user: ${aiObservationsAboutMe}

Respond in this exact JSON format:
{
  "suggestBehavior": "Short paragraph here.",
  "suggestTone": {
    "warmth": 0.5,
    "formality": 0.4,
    "humor": 0.6,
    "empathy": 0.8
  }
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.8,
      messages: [
        { role: 'system', content: prompt.trim() },
      ],
    });

    const raw = completion.choices[0].message?.content || '';
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('❌ Failed in suggest-refinements:', err);
    return res.status(500).json({ error: 'OpenAI refinement error', detail: err.message });
  }
}
