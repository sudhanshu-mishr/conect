import { Link, Route, Routes, useLocation } from "react-router-dom"
import { useState } from "react"
import SwipePage from "./pages/SwipePage"
import MatchesPage from "./pages/MatchesPage"
import ChatPage from "./pages/ChatPage"
import { api } from "./lib/api"

const navItems = [
  ["Swipe", "/swipe"],
  ["Matches", "/matches"],
  ["Chat", "/chat"],
  ["Settings", "/settings"],
  ["Premium", "/premium"],
]

function NavBar() {
  const location = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-2 md:relative md:shadow-none md:bg-transparent md:p-0 md:mb-4">
      <div className="grid grid-cols-5 gap-1 max-w-3xl mx-auto">
        {navItems.map(([label, href]) => (
          <Link
            key={href}
            to={href}
            className={`flex flex-col items-center justify-center py-2 text-xs rounded-xl transition-colors ${
              location.pathname === href
                ? "text-rose-600 font-bold"
                : "text-slate-500 hover:text-rose-500"
            }`}
          >
            {/* Add icons here if desired */}
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [activeMatch, setActiveMatch] = useState("")
  const [email, setEmail] = useState("alice@example.com")
  const [password, setPassword] = useState("password123")
  const [authMode, setAuthMode] = useState("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submitAuth = async (e) => {
    e.preventDefault() // Prevent default form submission
    setLoading(true)
    setError("")
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register"
      const body = authMode === "login"
        ? { email, password }
        : { email, username: email.split("@")[0], password }

      const res = await fetch(`/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setToken(data.access_token)
      localStorage.setItem("token", data.access_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    setActiveMatch("")
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-400 to-orange-300 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-rose-500">🔥 Conect</h1>
              <p className="text-slate-500">Find your match today.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  authMode === "login" ? "bg-white shadow text-rose-500" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  authMode === "register" ? "bg-white shadow text-rose-500" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setAuthMode("register")}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={submitAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  placeholder="alice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 md:p-4 pb-20 md:pb-4">
      <div className="max-w-3xl mx-auto md:space-y-6">
        {/* Header - Hidden on mobile or simplified */}
        <header className="hidden md:flex bg-white rounded-2xl p-4 shadow-sm items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl font-bold text-slate-800">Conect</h1>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors"
          >
            Log Out
          </button>
        </header>

        {/* Mobile Top Bar */}
        <div className="md:hidden bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
           <h1 className="text-xl font-black text-rose-500">🔥 Conect</h1>
           <button onClick={logout} className="text-xs font-bold text-slate-400">LOGOUT</button>
        </div>

        <main className="p-4 md:p-0">
          <Routes>
            <Route path="/" element={<SwipePage token={token} />} />
            <Route path="/swipe" element={<SwipePage token={token} />} />
            <Route path="/matches" element={<MatchesPage token={token} setActiveMatch={setActiveMatch} />} />
            <Route path="/chat" element={<ChatPage token={token} activeMatch={activeMatch} />} />
            <Route path="/settings" element={<div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Settings</h2>
              <p className="text-slate-500">Profile, notifications, and account preferences.</p>
            </div>} />
            <Route path="/premium" element={<div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200 bg-yellow-50">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Conect Premium ✨</h2>
              <p className="text-yellow-700">Get unlimited swipes, boosts, and see who likes you!</p>
            </div>} />
          </Routes>
        </main>

        <NavBar />
      </div>
    </div>
  )
}
