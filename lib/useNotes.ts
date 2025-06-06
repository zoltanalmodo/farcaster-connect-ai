// lib/useNotes.ts
import { useEffect, useState } from 'react';

export function useNotes() {
  const [intentions, setIntentions] = useState('');
  const [aboutThem, setAboutThem] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('notes-0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIntentions(parsed.personalNotes || '');
      setAboutThem(parsed.intentions || '');
    }
  }, []);

  return { intentions, aboutThem };
}
