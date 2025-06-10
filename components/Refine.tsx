// components/Refine.tsx
import { useEffect, useRef, useState } from 'react';
import { defaultInstruction } from '../lib/defaultInstruction';
import { useContactData } from '../hooks/useContactData';

export default function Refine({
  recipient,
  setSuggestions,
  setLoading,
}: {
  recipient: string;
  setSuggestions: (val: any) => void;
  setLoading: (val: boolean) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { contactData, setContactData } = useContactData(recipient);

  const [customInstruction, setCustomInstruction] = useState('');
  const [scopeCount, setScopeCount] = useState(5);
  const [useAllMessages, setUseAllMessages] = useState(false);

  useEffect(() => {
    if (recipient) {
      const savedScope = localStorage.getItem('scopeCount');
      const savedAll = localStorage.getItem('useAllMessages');

      setCustomInstruction(contactData.customInstruction || defaultInstruction);
      if (!contactData.customInstruction) {
        setContactData({ customInstruction: defaultInstruction });
      }

      if (savedScope) setScopeCount(Number(savedScope));
      if (savedAll === 'true') setUseAllMessages(true);
    }
  }, [recipient]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [customInstruction]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setSuggestions([]);

      const chatMessagesRaw = sessionStorage.getItem(`chatMessages-${recipient}`);
      const chatMessages = chatMessagesRaw ? JSON.parse(chatMessagesRaw) : [];

      const selectedMessages = useAllMessages
        ? chatMessages
        : chatMessages.slice(-scopeCount);

      const formattedMessages = selectedMessages.map((m: string) => {
        const sender = m.startsWith('You:') ? 'user' : 'them';
        const text = m.replace(/^You: |^Them: /, '');
        return { sender, text };
      });

      const aboutThem = contactData.aboutThem || '';
      const myIntentions = contactData.myIntentions || '';

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

    document.addEventListener('fetch-suggestions', fetchSuggestions);
    return () => {
      document.removeEventListener('fetch-suggestions', fetchSuggestions);
    };
  }, [customInstruction, scopeCount, useAllMessages, contactData]);

  return (
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
            setContactData({ customInstruction: value });
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
            setContactData({ customInstruction: defaultInstruction });
          }}
        >
          🔁 Restore to Default
        </button>
      </div>
    </>
  );
}
