import { useState } from 'react';

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const fetchSuggestion = async () => {
    setLoading(true);
    setSuggestion('');

    const prompt = `Suggest a thoughtful message, a small crypto gift idea, and a shared activity for two Farcaster users who are into NFTs, climbing, and music.`;

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setSuggestion(data.reply || 'No response from AI');
    setLoading(false);
  };

  return (
    <div className="suggestion-box">
      <div className="suggestion-title">AI Suggestions</div>
      <div className="suggestion-button">
        <button onClick={fetchSuggestion} disabled={loading}>
          {loading ? 'Thinking...' : 'Get Suggestion'}
        </button>
      </div>
      <div className="suggestion-output">{suggestion}</div>
    </div>
  );
}
