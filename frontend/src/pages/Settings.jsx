import { useState } from 'react'

export default function Settings({ displayName, refreshSettings }) {
  const [name, setName] = useState(displayName ?? '')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('saving')

    const res = await fetch('/api/settings/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ display_name: name.trim() }),
    })

    if (!res.ok) {
      setStatus('error')
      return
    }
    await refreshSettings()
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-28 pt-12">
      <div className="card bg-base-100 shadow-xl rounded-3xl w-full max-w-sm p-8">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">ajustes</h1>
        <p className="text-center text-base-content/40 text-sm mb-8">personalize seu cantinho ✨</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-xs text-base-content/50 ml-1">como você quer ser chamada</label>
          <input
            type="text"
            placeholder="seu nome"
            className="input input-bordered rounded-2xl w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />

          {status === 'error' && (
            <p className="text-error text-sm text-center">não consegui salvar 😿</p>
          )}
          {status === 'saved' && (
            <p className="text-success text-sm text-center">salvo! 🌸</p>
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-2xl"
            disabled={status === 'saving' || !name.trim() || name.trim() === displayName}
          >
            {status === 'saving' ? <span className="loading loading-spinner" /> : 'salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}
