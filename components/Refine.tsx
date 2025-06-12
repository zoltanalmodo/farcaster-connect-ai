import { useEffect, useRef, useState } from 'react';
import { defaultInstruction } from '../lib/defaultInstruction';
import { useContactData } from '../hooks/useContactData';

export default function Refine({ recipient }: { recipient: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { contactData, setContactData } = useContactData(recipient);

  const [customInstruction, setCustomInstruction] = useState('');
  const [scopeCount, setScopeCount] = useState(5);
  const [useAllMessages, setUseAllMessages] = useState(false);
  const [numSuggestions, setNumSuggestions] = useState(5);

  const [warmth, setWarmth] = useState(0.5);
  const [formality, setFormality] = useState(0.5);
  const [humor, setHumor] = useState(0.5);
  const [empathy, setEmpathy] = useState(0.5);

  const [aiSuggestBehavior, setAiSuggestBehavior] = useState('');
  const [aiSuggestTone, setAiSuggestTone] = useState({
    warmth: 0.5,
    formality: 0.5,
    humor: 0.5,
    empathy: 0.5,
  });

  const [applied, setApplied] = useState(false); // ✅ Track apply state

  // ✅ Initial load only
  useEffect(() => {
    if (!recipient) return;

    setCustomInstruction(contactData.customInstruction || defaultInstruction);
    setScopeCount(contactData.scopeCount ?? 5);
    setUseAllMessages(contactData.useAllMessages ?? false);
    setNumSuggestions(contactData.numSuggestions ?? 5);

    const tone = contactData.toneSettings || {};
    setWarmth(tone.warmth ?? 0.5);
    setFormality(tone.formality ?? 0.5);
    setHumor(tone.humor ?? 0.5);
    setEmpathy(tone.empathy ?? 0.5);

    setAiSuggestBehavior(contactData.aiSuggestBehavior || '');
    setAiSuggestTone(contactData.aiSuggestTone || {});
    setApplied(false); // reset when switching recipient
  }, [recipient]);

  // ✅ Adjust height of textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [customInstruction]);

  // ✅ Sync tone + count settings
  useEffect(() => {
    setContactData({
      toneSettings: {
        warmth,
        formality,
        humor,
        empathy,
      },
      numSuggestions,
    });
  }, [warmth, formality, humor, empathy, numSuggestions]);

  const applySuggestedTone = () => {
    setWarmth(aiSuggestTone.warmth ?? 0.5);
    setFormality(aiSuggestTone.formality ?? 0.5);
    setHumor(aiSuggestTone.humor ?? 0.5);
    setEmpathy(aiSuggestTone.empathy ?? 0.5);
    setApplied(true);
  };

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
                setContactData({ scopeCount: newVal });
              }}
              disabled={useAllMessages}
              style={{ width: '60px', marginLeft: '0.25rem' }}
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
                setContactData({ useAllMessages: newVal });
              }}
              style={{ marginRight: '0.5rem' }}
            />
            Use all messages
          </label>
        </div>

        <button
          className="restore-default-button"
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #aaa',
            cursor: 'pointer',
          }}
          onClick={() => {
            setCustomInstruction(defaultInstruction);
            setContactData({ customInstruction: defaultInstruction });
          }}
        >
          🔁 Restore to Default
        </button>
      </div>

      <div
        className="tone-inner-box"
        style={{
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Tone sliders */}
        {[
          {
            label: 'Warmth',
            value: warmth,
            set: setWarmth,
            desc: 'Higher = more affectionate, encouraging, emotionally open.',
          },
          {
            label: 'Formality',
            value: formality,
            set: setFormality,
            desc: 'Higher = more structured, polite, and professional.',
          },
          {
            label: 'Humor',
            value: humor,
            set: setHumor,
            desc: 'Higher = more playful, witty, and lighthearted.',
          },
          {
            label: 'Empathy',
            value: empathy,
            set: setEmpathy,
            desc: 'Higher = more emotionally attuned and supportive responses.',
          },
        ].map(({ label, value, set, desc }) => (
          <div key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label>
                <strong>{label}</strong>: {value}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={value}
                onChange={(e) => set(parseFloat(e.target.value))}
              />
            </div>
            <div style={{ fontSize: '0.9rem', color: '#444' }}>{desc}</div>
          </div>
        ))}

        {/* Number of Answers */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label>
              <strong>Number of Answers</strong>: {numSuggestions}
            </label>
            <input
              type="range"
              min={3}
              max={12}
              step={1}
              value={numSuggestions}
              onChange={(e) => setNumSuggestions(parseInt(e.target.value))}
            />
          </div>
          <div style={{ fontSize: '0.9rem', color: '#444' }}>
            Sets how many distinct responses the AI should generate.
          </div>
        </div>
      </div>

      {/* 🔍 Refine Suggestions Section */}
      <div
        className="tone-inner-box"
        style={{
          marginTop: '2rem',
          backgroundColor: '#f9f9f9',
          border: '1px dashed #aaa',
          padding: '1rem',
          borderRadius: '10px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>🤖 Refine Suggestions</h3>

        <div style={{ marginBottom: '1rem' }}>
          <strong>Suggest Behavior:</strong>
          <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#444' }}>
            {aiSuggestBehavior || 'No behavior suggestions yet.'}
          </div>
        </div>

        <div>
          <strong>Suggest AI Tone Settings:</strong>
          <ul style={{ marginTop: '0.5rem', color: '#444', lineHeight: 1.6 }}>
            <li>Warmth: {aiSuggestTone.warmth ?? '–'}</li>
            <li>Formality: {aiSuggestTone.formality ?? '–'}</li>
            <li>Humor: {aiSuggestTone.humor ?? '–'}</li>
            <li>Empathy: {aiSuggestTone.empathy ?? '–'}</li>
          </ul>
        </div>

        {/* ✨ Apply Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={applySuggestedTone}
            disabled={applied}
            className="refine-button"
            style={{
              backgroundColor: applied ? '#ccc' : '#a551ff',
              color: 'white',
              opacity: applied ? 0.5 : 1,
              cursor: applied ? 'not-allowed' : 'pointer',
            }}
          >
            ✨ Apply Suggested Settings
          </button>
        </div>
      </div>
    </>
  );
}
