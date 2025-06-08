// components/ContactsPanel.tsx
import React, { useState } from 'react';

type Contact = {
  address: string;
  displayName: string;
  avatar?: string;
  bio?: string;
};

type Props = {
  onSelectContact: (address: string) => void;
};

const ContactsPanel: React.FC<Props> = ({ onSelectContact }) => {
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);

  // TEMP placeholder: later will call useIdentity hook
  const mockResolveIdentity = async (input: string): Promise<Contact> => {
    return {
      address: '0x' + Math.random().toString(16).substring(2, 42),
      displayName: input,
      avatar: 'https://placekitten.com/40/40',
      bio: 'Mock user profile',
    };
  };

  const handleAddContact = async () => {
    if (!input.trim()) return;
    const identity = await mockResolveIdentity(input);
    setContacts(prev => [...prev, identity]);
    setInput('');
  };

  return (
    <div className="contacts-panel">
      <h2 className="contacts-title">🧑‍🤝‍🧑 Contacts</h2>

      <div className="contacts-input-row">
        <input
          type="text"
          className="contacts-input"
          placeholder="@handle, .eth, or 0x..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={handleAddContact} className="contacts-add-button">
          Add
        </button>
      </div>

      <div className="contacts-list">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            onClick={() => onSelectContact(contact.address)}
            className="contacts-card"
          >
            <img
              src={contact.avatar}
              alt="avatar"
              className="contacts-avatar"
            />
            <div>
              <div className="contacts-name">{contact.displayName}</div>
              <div className="contacts-bio">{contact.bio}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPanel;
