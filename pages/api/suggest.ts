// pages/api/suggest.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure it's in .env.local
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'No message provided' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    })

    const suggestion = response.choices[0].message?.content
    res.status(200).json({ suggestion })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate suggestion' })
  }
}
