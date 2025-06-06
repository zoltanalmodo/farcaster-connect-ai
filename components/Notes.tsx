import { useEffect, useState } from 'react';

interface NotesProps {
  peerAddress: string;
}

export default function Notes({ peerAddress }: NotesProps) {
  const [intentions, setIntentions] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const storageKey = `notes-${peerAddress}`;

  useEffect(() => {
    if (!peerAddress) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { intentions, personalNotes } = JSON.parse(saved);
      setIntentions(intentions || '');
      setPersonalNotes(personalNotes || '');
    }
  }, [peerAddress]);

  useEffect(() => {
    if (!peerAddress) return;
    localStorage.setItem(storageKey, JSON.stringify({ intentions, personalNotes }));
  }, [peerAddress, intentions, personalNotes]);

  return (
    <div className="notes-box">
      <div className="notes-title">Notes</div>

      <div className="notes-section">
        <label htmlFor="personalNotes">About Them</label>
        <small>Your observations and what they have said/done.</small>
        <textarea
          id="personalNotes"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="E.g., shared hobbies, behavior, promises, tone..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="intentions">My Intentions</label>
        <small>Your perspective and hopes for the relationship.</small>
        <textarea
          id="intentions"
          value={intentions}
          onChange={(e) => setIntentions(e.target.value)}
          placeholder="E.g., friendship, collaboration, keep it light..."
        />
      </div>
    </div>
  );
}
