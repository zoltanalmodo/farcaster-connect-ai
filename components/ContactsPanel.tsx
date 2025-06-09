import React, { useEffect, useState } from 'react';
import { resolveIdentity } from '../lib/agentkit';
import { Client } from '@xmtp/xmtp-js';
import { useWalletClient } from 'wagmi';
import { walletClientToSigner } from '../lib/walletClientToSigner';

type Contact = {
  address: string;
  displayName: string;
};

type Props = {
  onSelectContact: (address: string) => void;
};

const ContactsPanel: React.FC<Props> = ({ onSelectContact }) => {
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved contacts:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = async () => {
    if (!input.trim()) return;
    if (!walletClient) {
      setError('Please connect your wallet first.');
      return;
    }

    try {
      setError(null);
      const signer = await walletClientToSigner(walletClient);
      const identity = await resolveIdentity(input.trim());

      if (!identity?.walletAddress) {
        setError('Could not resolve address.');
        return;
      }

      const existing = contacts.some(c => c.address === identity.walletAddress);
      if (existing) {
        setError('Contact already added.');
        return;
      }

      const xmtp = await Client.create(signer);
      const canMessage = await xmtp.canMessage(identity.walletAddress);
      if (!canMessage) {
        setError('This user is not on XMTP.');
        return;
      }

      const contact: Contact = {
        address: identity.walletAddress,
        displayName: identity.displayName || input.trim(),
      };

      setContacts(prev => [...prev, contact]);
      setInput('');
    } catch (err) {
      console.error('Failed to resolve identity or XMTP check:', err);
      setError('Could not add contact.');
    }
  };

  const handleSelect = (address: string) => {
    setSelectedAddress(address);
    onSelectContact(address);
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
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleAddContact}
          className="contacts-add-button"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="contacts-list">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            onClick={() => handleSelect(contact.address)}
            className={`contacts-card ${selectedAddress === contact.address ? 'selected-contact' : ''}`}
          >
            <img
              src="https://placekitten.com/40/40"
              alt="avatar"
              className="contacts-avatar"
            />
            <div>
              <div className="contacts-name">{contact.displayName}</div>
              <div className="contacts-bio">{contact.address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPanel;
