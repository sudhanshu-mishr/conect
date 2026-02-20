import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export default function ChatPage({ token, activeMatch }) {
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [socket, setSocket] = useState(null)

  const wsUrl = useMemo(() => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${location.host}/api/ws/chat/${activeMatch}?token=${token}`
  }, [token, activeMatch])

  useEffect(() => {
    if (!token || !activeMatch) return

    api(`/chat/${activeMatch}/messages`, {}, token).then(setMessages).catch(() => setMessages([]))

    const ws = new WebSocket(wsUrl)
    ws.onmessage = (event) => setMessages((prev) => [...prev, JSON.parse(event.data)])
    setSocket(ws)
    return () => ws.close()
  }, [token, activeMatch, wsUrl])

  const send = () => {
    if (!socket || !content.trim()) return
    socket.send(JSON.stringify({ content: content.trim() }))
    setContent('')
  }

  if (!token) return <p className="text-center text-slate-600">Login to chat.</p>
  if (!activeMatch) return <p className="text-center text-slate-600">Pick a match first.</p>

  return (
    <div className="space-y-3">
      <div className="h-80 overflow-auto bg-white rounded-2xl p-4 shadow space-y-2">
        {messages.map((m) => (
          <p key={m.id} className="text-sm"><strong>{String(m.sender_id).slice(0, 8)}:</strong> {m.content}</p>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-xl p-3 border" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a message" />
        <button onClick={send} className="px-4 rounded-xl bg-blue-600 text-white">Send</button>
      </div>
    </div>
  )
}
