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
        <label htmlFor="intentions">Intentions</label>
        <textarea
          id="intentions"
          value={intentions}
          onChange={(e) => setIntentions(e.target.value)}
          placeholder="Where do you want this relationship to go?"
        />
      </div>

      <div className="notes-section">
        <label htmlFor="personalNotes">Personal Notes</label>
        <textarea
          id="personalNotes"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Hobbies, interests, background info..."
        />
      </div>
    </div>
  );
}
