// Notes.tsx
import { useEffect, useState } from 'react';
import { useContactData } from '../hooks/useContactData';

interface NotesProps {
  peerAddress: string;
}

export default function Notes({ peerAddress }: NotesProps) {
  const { contactData, setContactData } = useContactData(peerAddress);
  const [aboutThem, setAboutThem] = useState('');
  const [myIntentions, setMyIntentions] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [aiObservationsAboutThem, setAiObservationsAboutThem] = useState('');
  const [aiObservationsAboutMe, setAiObservationsAboutMe] = useState('');

  useEffect(() => {
    setAboutThem(contactData.aboutThem || '');
    setMyIntentions(contactData.myIntentions || '');
    setAboutMe(contactData.aboutMe || '');
    setAiObservationsAboutThem(contactData.aiObservationsAboutThem || '');
    setAiObservationsAboutMe(contactData.aiObservationsAboutMe || '');
  }, [peerAddress]);

  useEffect(() => {
    setContactData({
      aboutThem,
      myIntentions,
      aboutMe,
      aiObservationsAboutThem,
      aiObservationsAboutMe,
    });
  }, [aboutThem, myIntentions, aboutMe, aiObservationsAboutThem, aiObservationsAboutMe]);

  // ✅ Trigger AI observations when Notes panel is opened
  useEffect(() => {
    if (!peerAddress || !contactData.chatHistory || contactData.chatHistory.length === 0) return;

    const scope = contactData.useAllMessages
      ? contactData.chatHistory
      : contactData.chatHistory.slice(-contactData.scopeCount || 5);

    const runAI = async () => {
      try {
        const response = await fetch('/api/analyze-observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: scope }),
        });

        const json = await response.json();

        if (json.aboutThemAI && json.aboutMeAI) {
          setAiObservationsAboutThem(json.aboutThemAI);
          setAiObservationsAboutMe(json.aboutMeAI);
          setContactData({
            aiObservationsAboutThem: json.aboutThemAI,
            aiObservationsAboutMe: json.aboutMeAI,
          });
        } else {
          console.warn('AI did not return observations:', json);
        }
      } catch (err) {
        console.error('Error calling AI observations API:', err);
      }
    };

    runAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerAddress]);

  return (
    <div className="notes-box">
      <div className="notes-title">Notes</div>

      <div className="notes-section">
        <label htmlFor="aboutThem">Observations About Them</label>
        <small>Your observations and what they have said/done.</small>
        <textarea
          id="aboutThem"
          value={aboutThem}
          onChange={(e) => setAboutThem(e.target.value)}
          placeholder="E.g., shared hobbies, behavior, promises, tone..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="myIntentions">My Intentions In This Relationship</label>
        <small>Your perspective and hopes for the relationship.</small>
        <textarea
          id="myIntentions"
          value={myIntentions}
          onChange={(e) => setMyIntentions(e.target.value)}
          placeholder="E.g., friendship, collaboration, keep it light..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="aboutMe">Observations About Me In This Relationship</label>
        <small>What others or you have observed about yourself in this relationship.</small>
        <textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          placeholder="E.g., I tend to overthink, I'm always curious..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="aiObservationsAboutThem">AI Observations About This Contact</label>
        <small>Automatically inferred tone, habits, or patterns from their messages.</small>
        <textarea
          id="aiObservationsAboutThem"
          value={aiObservationsAboutThem}
          onChange={(e) => setAiObservationsAboutThem(e.target.value)}
          placeholder="E.g., tends to joke, usually brief and to the point..."
        />
      </div>

      <div className="notes-section">
        <label htmlFor="aiObservationsAboutMe">AI Observations About Me In This Relationship</label>
        <small>How the AI sees your behavior with this person.</small>
        <textarea
          id="aiObservationsAboutMe"
          value={aiObservationsAboutMe}
          onChange={(e) => setAiObservationsAboutMe(e.target.value)}
          placeholder="E.g., you're more formal with this person, very expressive..."
        />
      </div>
    </div>
  );
}
