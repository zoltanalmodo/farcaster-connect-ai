import Head from 'next/head';
import { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';
import Notes from '../components/Notes';

const peerAddress = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B'; // placeholder

export default function Home() {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="chat-wrapper">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>

      <div className="chat-title">Farcaster Connect AI</div>

      {/* TOGGLE BUTTON */}
      <div className="toggle-button-wrapper">
        <button
          className="toggle-button"
          onClick={() => setShowNotes((prev) => !prev)}
        >
          {showNotes ? 'Show Chat' : 'Show Notes'}
        </button>
      </div>

      {/* FLIPPABLE CONTENT */}
      {showNotes ? (
        <Notes peerAddress={peerAddress} />
      ) : (
        <ChatWindow />
      )}

      {/* Suggestions always visible */}
      <Suggestions />
    </div>
  );
}
