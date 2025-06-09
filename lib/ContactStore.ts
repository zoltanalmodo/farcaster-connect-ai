// lib/ContactStore.ts

export type ChatMessage = {
  sender: 'me' | 'them';
  text: string;
};

export type ContactProfile = {
  address: string;
  displayName?: string;
  avatar?: string;

  chatHistory?: ChatMessage[];
  aboutThem?: string;
  myIntentions?: string;
  customInstruction?: string;

  aiLearnedInsights?: string[];
  theySaidAboutMe?: string;
  selfReflection?: string;
};

const CONTACT_PREFIX = 'cast-compass-contact-';

function getStorageKey(address: string) {
  return `${CONTACT_PREFIX}${address.toLowerCase()}`;
}

export const ContactStore = {
  saveContact(profile: ContactProfile) {
    if (!profile.address) return;
    const key = getStorageKey(profile.address);
    localStorage.setItem(key, JSON.stringify(profile));
  },

  getContact(address: string): ContactProfile | null {
    const key = getStorageKey(address);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      console.warn(`Failed to parse contact profile for ${address}`);
      return null;
    }
  },

  updateContact(address: string, updates: Partial<ContactProfile>) {
    const current = ContactStore.getContact(address) || { address };
    const updated = { ...current, ...updates };
    ContactStore.saveContact(updated);
  },

  deleteContact(address: string) {
    localStorage.removeItem(getStorageKey(address));
  },

  getAllContacts(): ContactProfile[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(CONTACT_PREFIX))
      .map((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ContactProfile[];
  },
};
