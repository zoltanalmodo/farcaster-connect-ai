import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';

export default function Home() {
  return (
    <div className="chat-wrapper">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>
      <div className="chat-title">Farcaster Connect AI</div>
      <ChatWindow />
      <Suggestions />
    </div>
  );
}
