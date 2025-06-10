// components/ToneControls.tsx
import { useState, useEffect } from 'react';
import { useContactData } from '../hooks/useContactData';

interface ToneControlsProps {
  recipient: string;
  onDone: () => void;
}

export default function ToneControls({ recipient, onDone }: ToneControlsProps) {
  const { contactData, setContactData } = useContactData(recipient);
  const [warmth, setWarmth] = useState(0.5);
  const [formality, setFormality] = useState(0.5);
  const [humor, setHumor] = useState(0.5);
  const [empathy, setEmpathy] = useState(0.5);

  useEffect(() => {
    const { toneSettings } = contactData;
    if (toneSettings) {
      setWarmth(toneSettings.warmth ?? 0.5);
      setFormality(toneSettings.formality ?? 0.5);
      setHumor(toneSettings.humor ?? 0.5);
      setEmpathy(toneSettings.empathy ?? 0.5);
    }
  }, [contactData]);

  const saveSettings = () => {
    setContactData({
      toneSettings: {
        warmth,
        formality,
        humor,
        empathy,
      },
    });
    onDone();
  };

  return (
    <>
      <div className="tone-inner-box">
        {/* Warmth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Warmth</strong>: {warmth}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={warmth}
            onChange={(e) => setWarmth(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem' }}>
          Higher = more affectionate, encouraging, emotionally open.
        </div>

        {/* Formality */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Formality</strong>: {formality}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={formality}
            onChange={(e) => setFormality(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem' }}>
          Higher = more structured, polite, and professional.
        </div>

        {/* Humor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Humor</strong>: {humor}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={humor}
            onChange={(e) => setHumor(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem' }}>
          Higher = more playful, witty, and lighthearted.
        </div>

        {/* Empathy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Empathy</strong>: {empathy}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={empathy}
            onChange={(e) => setEmpathy(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444' }}>
          Higher = more emotionally attuned and supportive responses.
        </div>
      </div>

      <div
        className="suggestion-controls"
        style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}
      >
        <button className="orange-button" onClick={saveSettings}>
          Done
        </button>
      </div>
    </>
  );
}
