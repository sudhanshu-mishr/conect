export default function SwipeCard({ user, onSwipe }) {
  return (
    <div className="rounded-3xl bg-white/95 shadow-xl border border-rose-100 p-6 space-y-4">
      <div className="h-56 rounded-2xl bg-gradient-to-br from-rose-300 via-pink-200 to-orange-100 flex items-end p-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-800">{user.username}</h3>
          <p className="text-sm text-slate-600">{user.latitude && user.longitude ? `📍 ${user.latitude.toFixed(2)}, ${user.longitude.toFixed(2)}` : 'Location hidden'}</p>
        </div>
      </div>
      <p className="text-slate-700 min-h-14">{user.bio || 'No bio yet — say hello and break the ice.'}</p>
      <div className="grid grid-cols-2 gap-3">
        <button className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-semibold" onClick={() => onSwipe(user.id, false)}>Pass</button>
        <button className="px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold" onClick={() => onSwipe(user.id, true)}>Like</button>
      </div>
    </div>
  )
}
