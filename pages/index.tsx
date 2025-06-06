import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';
import Notes from '../components/Notes';

const peerAddress = '0x0832CE6C215B079e665b99cB1F27C9A2d4E0226B'; // TEMP for demo

export default function Home() {
  return (
    <div className="chat-wrapper">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>
      <div className="chat-title">Farcaster Connect AI</div>
      <ChatWindow />
      <Notes peerAddress={peerAddress} />
      <Suggestions />
    </div>
  );
}
