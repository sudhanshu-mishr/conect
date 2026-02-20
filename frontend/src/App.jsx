import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useState } from 'react'
import SwipePage from './pages/SwipePage'
import MatchesPage from './pages/MatchesPage'
import ChatPage from './pages/ChatPage'
import { api } from './lib/api'

const navItems = [
  ['Swipe', '/swipe'],
  ['Matches', '/matches'],
  ['Chat', '/chat'],
  ['Settings', '/settings'],
  ['Premium', '/premium'],
]

function NavBar() {
  const location = useLocation()
  return (
    <nav className="grid grid-cols-5 gap-1 bg-white rounded-2xl p-1 shadow">
      {navItems.map(([label, href]) => (
        <Link key={href} to={href} className={`text-center text-xs md:text-sm py-2 rounded-xl ${location.pathname === href ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          {label}
        </Link>
      ))}
    </nav>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [activeMatch, setActiveMatch] = useState('')
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password123')
  const [authMode, setAuthMode] = useState('login')
  const [error, setError] = useState('')

  const submitAuth = async () => {
    try {
      const path = authMode === 'login' ? '/auth/login' : '/auth/register'
      const body = authMode === 'login' ? { email, password } : { email, username: email.split('@')[0], password }
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) })
      setToken(data.access_token)
      localStorage.setItem('token', data.access_token)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setActiveMatch('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-slate-100 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="bg-white/95 rounded-3xl p-5 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-rose-600">🔥 Conect</h1>
            <p className="text-xs text-slate-500">FastAPI + React single-service app</p>
          </div>
          {token && <button className="text-sm px-3 py-2 rounded-xl bg-slate-100" onClick={logout}>Logout</button>}
        </header>

        <NavBar />

        {!token && (
          <section className="bg-white rounded-2xl p-4 shadow space-y-3">
            <div className="flex gap-2">
              <button className={`px-3 py-2 rounded-xl ${authMode === 'login' ? 'bg-rose-500 text-white' : 'bg-slate-100'}`} onClick={() => setAuthMode('login')}>Login</button>
              <button className={`px-3 py-2 rounded-xl ${authMode === 'register' ? 'bg-rose-500 text-white' : 'bg-slate-100'}`} onClick={() => setAuthMode('register')}>Register</button>
            </div>
            <input className="w-full p-2 rounded-xl border" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="w-full p-2 rounded-xl border" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white" onClick={submitAuth}>{authMode === 'login' ? 'Login' : 'Create account'}</button>
          </section>
        )}

        <main className="pb-10">
          <Routes>
            <Route path="/" element={<SwipePage token={token} />} />
            <Route path="/swipe" element={<SwipePage token={token} />} />
            <Route path="/matches" element={<MatchesPage token={token} setActiveMatch={setActiveMatch} />} />
            <Route path="/chat" element={<ChatPage token={token} activeMatch={activeMatch} />} />
            <Route path="/settings" element={<div className="bg-white rounded-2xl p-5 shadow">Settings stub: profile, notifications, and account preferences can be managed here.</div>} />
            <Route path="/premium" element={<div className="bg-white rounded-2xl p-5 shadow">Premium stub: boosts, rewinds, and advanced filters.</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
