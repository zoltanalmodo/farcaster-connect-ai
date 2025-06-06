import { useState } from 'react';

interface Suggestion {
  text: string;
  reason: string;
}

const defaultInstruction = `You are an emotionally intelligent AI assistant helping a user craft thoughtful, casual, and friendly messages.

Your goal is to:
- Suggest 1–3 short and warm replies based on recent chat history and the user's intentions
- Be supportive, humorous, or lighthearted depending on context
- Match the tone of a good friend or someone who genuinely cares`;

export default function Suggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [customInstruction, setCustomInstruction] = useState(defaultInstruction);
  const [showCustom, setShowCustom] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    const chatMessagesRaw = sessionStorage.getItem('chatMessages');
    const chatMessages = chatMessagesRaw ? JSON.parse(chatMessagesRaw) : [];

    const lastFiveMessages = chatMessages.slice(-5).map((m: string) => `- ${m}`).join('\n');

    const about = localStorage.getItem('aboutThem') || '';
    const intentions = localStorage.getItem('myIntentions') || '';

    const context = `
${showCustom ? customInstruction : ''}
Recent chat messages:
${lastFiveMessages}

About Them:
${about}

My Intentions:
${intentions}

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
    <div className={`suggestion-box ${showCustom ? 'purple-box' : 'blue-box'}`}>
      <div className="suggestion-title">AI Suggestions</div>

      <div className="suggestion-controls">
        <button className="get-button" onClick={fetchSuggestions} disabled={loading}>
          {loading ? 'Thinking...' : 'Get Suggestions'}
        </button>

        <button className="refine-button" onClick={() => setShowCustom((prev) => !prev)}>
          {showCustom ? 'Back to Suggestions' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        <div className="custom-instruction-editor" style={{ marginTop: '1rem' }}>
          <label htmlFor="instruction" style={{ fontWeight: 'bold' }}>
            Customize AI Behavior:
          </label>
          <textarea
            id="instruction"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            rows={10}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>
      ) : (
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
      )}
    </div>
  );
}
