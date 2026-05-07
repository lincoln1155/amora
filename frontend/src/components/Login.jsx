import { useState } from 'react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    })

    setLoading(false)
    if (res.ok) {
      onLogin()
    } else {
      setError('senha incorreta 🙈')
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl rounded-3xl w-full max-w-sm p-8">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">amora</h1>
        <p className="text-center text-base-content/40 text-sm mb-8">seu cantinho de organização 🌸</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="senha"
            className="input input-bordered rounded-2xl w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-error text-sm text-center">{error}</p>}
          <button type="submit" className="btn btn-primary rounded-2xl" disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
