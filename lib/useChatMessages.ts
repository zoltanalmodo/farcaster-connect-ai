// lib/useChatMessages.ts
import { useEffect, useState } from 'react';

export function useChatMessages() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Replace this with real chat message access logic
    const stored = sessionStorage.getItem('chatMessages');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  return messages;
}
