import { useState } from 'react';

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    // Example placeholder context — replace with real chat + notes
    const context = `
Recent chat messages:
- They said they're excited about next week's NFT drop.
- I shared a music playlist and they loved it.
- They mentioned feeling a bit overwhelmed with work.

My notes:
About Them:
Very creative, introverted. Likes climbing and DAOs.
They mentioned wanting to collaborate on a project.

My Intentions:
I’d like to build a real friendship and maybe even explore a joint NFT idea.
Would love to support them when they’re stressed.

What’s a good message to send next?
`;

    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: context }),
    });

    const data = await res.json();
    setSuggestions(data.suggestions || []);
    setLoading(false);
  };

  return (
    <div className="suggestion-box">
      <div className="suggestion-title">AI Suggestions</div>

      <div className="suggestion-button">
        <button onClick={fetchSuggestions} disabled={loading}>
          {loading ? 'Thinking...' : 'Get Suggestion'}
        </button>
      </div>

      <div className="suggestion-output">
        {suggestions.length === 0 && !loading && <p>No suggestions yet.</p>}

        {suggestions.map((s, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <strong>💬 {s.text}</strong>
            <br />
            <em>🧠 {s.reason}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
