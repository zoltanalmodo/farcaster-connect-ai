import { useState, useRef, useEffect } from 'react';

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
  const [scopeCount, setScopeCount] = useState(10);
  const [useAllMessages, setUseAllMessages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [customInstruction, showCustom]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);

    const chatMessagesRaw = sessionStorage.getItem('chatMessages');
    const chatMessages = chatMessagesRaw ? JSON.parse(chatMessagesRaw) : [];

    const selectedMessages = useAllMessages
      ? chatMessages
      : chatMessages.slice(-scopeCount);

    const messageList = selectedMessages.map((m: string) => `- ${m}`).join('\n');

    const about = localStorage.getItem('aboutThem') || '';
    const intentions = localStorage.getItem('myIntentions') || '';

    const context = `
${showCustom ? customInstruction : ''}
Recent chat messages:
${messageList}

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
      <div className="suggestion-title">
        {showCustom ? 'Refine AI' : 'AI Suggestions'}
      </div>

      <div
        className="suggestion-controls"
        style={{
          justifyContent: showCustom ? 'flex-end' : 'space-between',
        }}
      >
        {!showCustom && (
          <button className="get-button" onClick={fetchSuggestions} disabled={loading}>
            {loading ? 'Thinking...' : 'Get Suggestions'}
          </button>
        )}
        <button className="refine-button" onClick={() => setShowCustom(!showCustom)}>
          {showCustom ? 'Done' : 'Refine AI'}
        </button>
      </div>

      {showCustom ? (
        <>
          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="instruction" style={{ fontWeight: 'bold' }}>
              Customize AI Behavior:
            </label>
            <textarea
              id="instruction"
              ref={textareaRef}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Enter your own AI prompt..."
              style={{
                width: '100%',
                marginTop: '0.5rem',
                resize: 'none',
                overflow: 'hidden',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
                fontSize: '1rem',
                boxSizing: 'border-box',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
              }}
            />
          </div>

          <div
            className="scope-controls"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <label>
              Take last{' '}
              <input
                type="number"
                min="1"
                max="100"
                value={scopeCount}
                onChange={(e) => setScopeCount(Number(e.target.value))}
                disabled={useAllMessages}
              />{' '}
              messages
            </label>

            <label>
              <input
                type="checkbox"
                checked={useAllMessages}
                onChange={() => setUseAllMessages(!useAllMessages)}
              />{' '}
              Use all messages for sampling
            </label>
          </div>
        </>
      ) : (
        <div className="suggestion-output" style={{ marginTop: '1rem' }}>
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
