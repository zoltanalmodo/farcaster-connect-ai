import Head from 'next/head';
import { useEffect, useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';
import Notes from '../components/Notes';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { initXMTP } from '../lib/xmtp';

const peerAddress = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B';

export default function Home() {
  const [showNotes, setShowNotes] = useState(false);
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<any>(null);
  const [xmtpClient, setXmtpClient] = useState<any>(null);

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
        <title>Farcaster Connect AI</title>
      </Head>

      <div className="chat-title">Farcaster Connect AI</div>

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

      {/* MAIN VIEW */}
      {showNotes ? (
        <Notes peerAddress={peerAddress} />
      ) : (
        <ChatWindow xmtpClient={xmtpClient} signer={signer} />
      )}

      <Suggestions />
    </div>
  );
}
