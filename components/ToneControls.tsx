import { useState } from 'react';

export default function ToneControls({ onDone }: { onDone: () => void }) {
  const [temperature, setTemperature] = useState(0.8);
  const [presencePenalty, setPresencePenalty] = useState(0.6);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.4);

  const saveSettings = () => {
    const values = { temperature, presencePenalty, frequencyPenalty };
    localStorage.setItem('toneSettings', JSON.stringify(values));
    onDone();
  };

  return (
    <>
      <div className="tone-inner-box">
        {/* Creativity Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Creativity</strong>: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem' }}>
          Higher = more expressive, playful, and varied suggestions.
        </div>

        {/* Freshness Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Freshness</strong>: {presencePenalty}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={presencePenalty}
            onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem' }}>
          Higher = more novel ideas, less repetition of common phrases.
        </div>

        {/* Repetition Avoidance Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>
            <strong>Repetition Avoidance</strong>: {frequencyPenalty}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={frequencyPenalty}
            onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
          />
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444' }}>
          Higher = discourages repeating the same words or topics.
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
