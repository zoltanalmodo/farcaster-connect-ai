import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';
import Suggestions from '../components/Suggestions';

export default function Home() {
  return (
    <div className="p-6">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>
      <ChatWindow />
      <Suggestions />
    </div>
  );
}
