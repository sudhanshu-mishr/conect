export async function api(path, options = {}, token = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`/api${path}`, { ...options, headers })
  if (!res.ok) {
    const maybe = await res.json().catch(() => ({}))
    throw new Error(maybe.detail || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}
