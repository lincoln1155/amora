import { useState, useEffect, useRef } from 'react'

function emptyForm() {
  return { name: '', emoji: '✨' }
}

function HabitSheet({ open, onClose, onCreated }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setForm(emptyForm())
      setError('')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('coloca um nome 🌸')
      return
    }
    setSaving(true)
    const res = await fetch('/api/habits/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: form.name.trim(),
        emoji: form.emoji.trim() || '✨',
      }),
    })
    setSaving(false)
    if (!res.ok) {
      setError('algo deu errado 😿')
      return
    }
    await onCreated()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box rounded-t-3xl sm:rounded-3xl bg-base-100 max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base-content text-lg lowercase">novo hábito</h2>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost text-base-content/50">✕</button>
          </form>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-xs text-base-content/50 -mb-2 ml-1">emoji</label>
          <input
            type="text"
            placeholder="✨"
            maxLength={4}
            className="input input-bordered rounded-2xl w-20 text-2xl text-center"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          />

          <label className="text-xs text-base-content/50 -mb-2 ml-1">nome</label>
          <input
            type="text"
            placeholder="ex: tomar água"
            className="input input-bordered rounded-2xl w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={60}
            autoFocus
          />

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <button type="submit" className="btn btn-primary rounded-2xl mt-2" disabled={saving}>
            {saving ? <span className="loading loading-spinner" /> : 'criar'}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>fechar</button>
      </form>
    </dialog>
  )
}

function HabitRow({ habit, onToggle, onDelete }) {
  const [busy, setBusy] = useState(false)

  async function handleToggle() {
    if (busy) return
    setBusy(true)
    await onToggle(habit.id)
    setBusy(false)
  }

  async function handleDelete() {
    if (!window.confirm(`deletar "${habit.name}"? perde o histórico todo.`)) return
    setBusy(true)
    await onDelete(habit.id)
    // não desfaz busy — a row vai sumir
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-base-100 hover:bg-base-200/50 transition-colors">
      <span className="text-3xl select-none shrink-0">{habit.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-base-content truncate">{habit.name}</p>
        <p className="text-xs text-base-content/50">
          {habit.current_streak > 0
            ? `🔥 ${habit.current_streak} ${habit.current_streak === 1 ? 'dia' : 'dias'}`
            : 'comece hoje 🌱'}
        </p>
      </div>

      <button
        onClick={handleDelete}
        className="btn btn-sm btn-circle btn-ghost text-base-content/30 hover:text-error"
        aria-label="deletar"
      >
        ✕
      </button>

      <button
        onClick={handleToggle}
        disabled={busy}
        className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all ${
          habit.done_today
            ? 'bg-primary text-primary-content shadow-md scale-100'
            : 'bg-base-200 text-base-content/30 hover:bg-base-300'
        }`}
        aria-label={habit.done_today ? 'desmarcar' : 'marcar feito'}
      >
        <span className="text-xl">{habit.done_today ? '✓' : ''}</span>
      </button>
    </div>
  )
}

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  async function fetchHabits() {
    const res = await fetch('/api/habits/', { credentials: 'include' })
    if (res.ok) {
      setHabits(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  async function toggleHabit(id) {
    const res = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) {
      const updated = await res.json()
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)))
    }
  }

  async function deleteHabit(id) {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== id))
    }
  }

  return (
    <div className="min-h-screen px-6 pb-32 pt-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">hábitos</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="btn btn-primary btn-circle rounded-full"
          aria-label="adicionar hábito"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-20 rounded-2xl" />
          <div className="skeleton h-20 rounded-2xl" />
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-base-content/50">
            nenhum hábito ainda. <br />toque no <strong>+</strong> pra começar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      )}

      <HabitSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={fetchHabits}
      />
    </div>
  )
}
