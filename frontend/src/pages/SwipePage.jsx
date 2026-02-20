import { useEffect, useState } from 'react'
import SwipeCard from '../components/SwipeCard'
import { api } from '../lib/api'

export default function SwipePage({ token }) {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('')

  const load = async () => {
    try {
      setUsers(await api('/swipes/recommendations', {}, token))
      setStatus('')
    } catch (e) {
      setStatus(e.message)
    }
  }

  useEffect(() => {
    if (token) load()
  }, [token])

  const swipe = async (swiped_id, liked) => {
    try {
      const result = await api('/swipes', {
        method: 'POST',
        body: JSON.stringify({ swiped_id, liked }),
      }, token)
      setStatus(result.matched ? '🎉 It\'s a match!' : liked ? 'Liked!' : 'Passed')
      load()
    } catch (e) {
      setStatus(e.message)
    }
  }

  if (!token) return <p className="text-center text-slate-600">Login to start swiping.</p>

  return (
    <section className="max-w-md mx-auto space-y-3">
      {status && <p className="text-center text-sm text-slate-600">{status}</p>}
      {users[0] ? <SwipeCard user={users[0]} onSwipe={swipe} /> : <div className="rounded-2xl bg-white p-6 text-center shadow">No recommendations right now.</div>}
    </section>
  )
}
