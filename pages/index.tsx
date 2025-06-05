import Head from 'next/head';
import ChatWindow from '../components/ChatWindow'; // Updated import
import Suggestions from '../components/Suggestions'; // Optional: can be removed if built-in

export default function Home() {
  return (
    <div className="p-6">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Farcaster Connect AI</h1>
      <ChatWindow />
      {/* Optional: only keep <Suggestions /> if you're using it outside ChatWindow */}
      {/* <Suggestions /> */}
    </div>
  );
}
