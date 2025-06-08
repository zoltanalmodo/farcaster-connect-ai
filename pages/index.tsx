import Head from 'next/head';
import { useEffect, useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';
import Notes from '../components/Notes';
import ContactsPanel from '../components/ContactsPanel';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { initXMTP } from '../lib/xmtp';

export default function Home() {
  const [showNotes, setShowNotes] = useState(false);
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<any>(null);
  const [xmtpClient, setXmtpClient] = useState<any>(null);
  const [recipient, setRecipient] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !walletClient || signer || xmtpClient) return;

    const setup = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = provider.getSigner();
      setSigner(_signer);
      const xmtp = await initXMTP(_signer);
      setXmtpClient(xmtp);
    };

    setup();
  }, [isConnected, walletClient, signer, xmtpClient]);

  return (
    <div className="chat-wrapper">
      <Head>
        <title>CastCompass</title>
        <meta
          name="description"
          content="CastCompass helps you connect with purpose. Organize your relationships, define your intentions, and craft smarter, more meaningful messages using AI."
        />
        <meta property="og:title" content="CastCompass" />
        <meta
          property="og:description"
          content="Intentional messaging. Smarter relationships."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/social-preview.png" />
        <meta property="og:url" content="https://your-app-url.com" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CastCompass" />
        <meta
          name="twitter:description"
          content="Intentional messaging. Smarter relationships."
        />
        <meta name="twitter:image" content="/social-preview.png" />
      </Head>

      {/* App Title + Subtitle */}
      <div className="chat-title">CastCompass</div>
      <p
        style={{
          marginTop: '-0.5rem',
          marginBottom: '1rem',
          color: 'gray',
          fontSize: '1.1rem',
        }}
      >
        Intentional messaging. Smarter relationships.
      </p>

      {/* BUTTON ROW */}
      <div className="button-bar">
        <div className="button-left">
          <ConnectButton />
        </div>
        <div className="button-right">
          <button
            className="toggle-button"
            style={{
              backgroundColor: showNotes ? '#ef4444' : '#22c55e',
            }}
            onClick={() => setShowNotes((prev) => !prev)}
          >
            {showNotes ? 'Show Chat' : 'Show Notes'}
          </button>
        </div>
      </div>

      {/* CONTACTS PANEL */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ContactsPanel onSelectContact={setRecipient} />
      </div>

      {/* MAIN VIEW */}
      {showNotes ? (
        <Notes peerAddress={recipient || ''} />
      ) : (
        <ChatWindow
          xmtpClient={xmtpClient}
          signer={signer}
          recipient={recipient || ''}
        />
      )}

      {/* AI Suggestions */}
      <Suggestions
        xmtpClient={xmtpClient}
        signer={signer}
        recipient={recipient || ''}
      />
    </div>
  );
}
