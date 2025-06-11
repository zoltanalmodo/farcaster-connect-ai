// components/Notes.tsx
import { useEffect, useState } from 'react';
import { useContactData } from '../hooks/useContactData';

interface NotesProps {
  peerAddress: string;
}

export default function Notes({ peerAddress }: NotesProps) {
  const { contactData, setContactData } = useContactData(peerAddress);
  const [aboutThem, setAboutThem] = useState('');
  const [myIntentions, setMyIntentions] = useState('');

  // Load from ContactStore on mount
  useEffect(() => {
    setAboutThem(contactData.aboutThem || '');
    setMyIntentions(contactData.myIntentions || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerAddress]);


  // Persist to ContactStore whenever notes change
  useEffect(() => {
    setContactData({
      aboutThem,
      myIntentions,
    });
  }, [aboutThem, myIntentions]);

  return (
    <div className="notes-box">
      <div className="notes-title">Notes</div>

      <div className="notes-section">
        <label htmlFor="aboutThem">About Them</label>
        <small>Your observations and what they have said/done.</small>
        <textarea
          id="aboutThem"
          value={aboutThem}
          onChange={(e) => setAboutThem(e.target.value)}
          placeholder="E.g., shared hobbies, behavior, promises, tone..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="myIntentions">My Intentions</label>
        <small>Your perspective and hopes for the relationship.</small>
        <textarea
          id="myIntentions"
          value={myIntentions}
          onChange={(e) => setMyIntentions(e.target.value)}
          placeholder="E.g., friendship, collaboration, keep it light..."
        />
      </div>
    </div>
  );
}
