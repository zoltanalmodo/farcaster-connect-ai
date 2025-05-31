import Head from 'next/head'
import MessageComposer from '../components/MessageComposer'
import Suggestions from '../components/Suggestions'

export default function Home() {
  return (
    <div className="p-6">
      <Head>
        <title>Farcaster Connect AI</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Farcaster Connect AI</h1>
      <MessageComposer />
      <Suggestions />
    </div>
  )
}
