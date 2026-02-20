import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function MatchesPage({ token, setActiveMatch }) {
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    api('/swipes/matches', {}, token).then(setMatches).catch((e) => setError(e.message))
  }, [token])

  if (!token) return <p className="text-center text-slate-600">Login to see matches.</p>

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {matches.map((m) => (
        <button key={m.match_id} className="w-full p-4 rounded-2xl bg-white shadow text-left hover:shadow-md transition" onClick={() => setActiveMatch(m.match_id)}>
          <p className="font-semibold">💖 {m.user.username}</p>
          <p className="text-xs text-slate-500">Open chat</p>
        </button>
      ))}
      {!matches.length && !error && <div className="rounded-2xl bg-white p-4 shadow text-center">No matches yet. Keep swiping.</div>}
    </div>
  )
}
