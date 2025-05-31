export default function MessageComposer() {
  return (
    <div className="mb-6">
      <textarea placeholder="Write your message..." className="w-full p-2 border rounded" />
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Send</button>
    </div>
  )
}
