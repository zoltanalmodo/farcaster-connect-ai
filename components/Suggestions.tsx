import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { defaultInstruction } from '../lib/defaultInstruction';

const SEND_ADDRESS = process.env.NEXT_PUBLIC_SEND_ADDRESS!;
const REPLY_ADDRESS = process.env.NEXT_PUBLIC_REPLY_ADDRESS!;

interface Suggestion {
  text: string;
  reason: string;
}

export default function Suggestions({
  xmtpClient,
  signer,
}: {
  xmtpClient: any;
  signer: any;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [scopeCount, setScopeCount] = useState(5);
  const [useAllMessages, setUseAllMessages] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInstruction = localStorage.getItem('customInstruction');
      const savedScope = localStorage.getItem('scopeCount');
      const savedAll = localStorage.getItem('useAllMessages');

      setCustomInstruction(savedInstruction || defaultInstruction);
      if (!savedInstruction) {
        localStorage.setItem('customInstruction', defaultInstruction);
      }

      if (savedScope) setScopeCount(Number(savedScope));
      if (savedAll === 'true') setUseAllMessages(true);
    }
  }, []);

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

    const formattedMessages = selectedMessages.map((m: string) => {
      const sender = m.startsWith('You:') ? 'user' : 'them';
      const text = m.replace(/^You: |^Them: /, '');
      return { sender, text };
    });

    const aboutThem = localStorage.getItem('aboutThem') || '';
    const myIntentions = localStorage.getItem('myIntentions') || '';

    const res = await fetch('/api/suggest-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        aboutThem,
        myIntentions,
        instruction: customInstruction,
      }),
    });

    const data = await res.json();
    console.log('🧠 API Response:', data);

    const mapped = Array.isArray(data)
      ? data.map((s: any) => ({
          text: s.text?.trim() || '',
          reason: s.explanation?.trim() || 'No explanation provided by AI.',
        }))
      : [];

    setSuggestions(mapped);
    setLoading(false);
  };

  const sendViaXMTP = async (message: string) => {
    try {
      if (!xmtpClient || !address) {
        console.error('Missing XMTP Client or wallet address');
        alert('Missing XMTP client or wallet address');
        return;
      }

      const recipient =
        address.toLowerCase() === SEND_ADDRESS.toLowerCase()
          ? REPLY_ADDRESS
          : SEND_ADDRESS;

      const existing = (await xmtpClient.conversations.list()).find(
        (c: any) => c.peerAddress.toLowerCase() === recipient.toLowerCase()
      );

      const conversation =
        existing ?? (await xmtpClient.conversations.newConversation(recipient));

      await conversation.send(message);
      alert('✅ Message sent via XMTP!');
    } catch (err) {
      console.error('❌ Failed to send via XMTP:', err);
      alert('Error sending message.');
    }
  };

  return (
    <div className={`suggestion-box ${showCustom ? 'purple-box' : 'blue-box'}`}>
      <div className="suggestion-title">
        {showCustom ? 'Refine AI' : 'AI Suggestions'}
      </div>

      <div
        className="suggestion-controls"
        style={{ justifyContent: showCustom ? 'flex-end' : 'space-between' }}
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
              onChange={(e) => {
                const value = e.target.value;
                setCustomInstruction(value);
                localStorage.setItem('customInstruction', value);
              }}
              placeholder="Edit the AI's behavior..."
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
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <label>
                Take last{' '}
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={scopeCount}
                  onChange={(e) => {
                    const newVal = Number(e.target.value);
                    setScopeCount(newVal);
                    localStorage.setItem('scopeCount', newVal.toString());
                  }}
                  disabled={useAllMessages}
                />{' '}
                messages
              </label>

              <label style={{ whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={useAllMessages}
                  onChange={() => {
                    const newVal = !useAllMessages;
                    setUseAllMessages(newVal);
                    localStorage.setItem('useAllMessages', newVal.toString());
                  }}
                />{' '}
                Use all messages
              </label>
            </div>

            <button
              className="restore-default-button"
              onClick={() => {
                setCustomInstruction(defaultInstruction);
                localStorage.setItem('customInstruction', defaultInstruction);
              }}
            >
              🔁 Restore to Default
            </button>
          </div>
        </>
      ) : (
        <div className="suggestion-output" style={{ marginTop: '1rem' }}>
          {suggestions.length === 0 && !loading && <p>No suggestions yet.</p>}
          {suggestions.map((s, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <strong>💬 {s.text}</strong>
              <br />
              <em>🧠 {s.reason}</em>
              <br />
              <button
                className="send-xmtp-button"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  background: '#ff4081',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => sendViaXMTP(s.text)}
              >
                ✉️ Send this answer via XMTP
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
