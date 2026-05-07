import { useState, useEffect, useRef } from 'react'
import { EVENT_COLORS, DEFAULT_EVENT_COLOR } from '../lib/colors'

function pad(n) {
  return String(n).padStart(2, '0')
}

// Format Date para input datetime-local: "YYYY-MM-DDTHH:mm" (horário local)
function toDateTimeLocal(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatHeader(date) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function emptyForm(selectedDate) {
  const start = new Date(selectedDate)
  start.setHours(9, 0, 0, 0)
  return {
    id: null,
    title: '',
    description: '',
    start_date: toDateTimeLocal(start),
    end_date: '',
    hasEnd: false,
    color: DEFAULT_EVENT_COLOR,
  }
}

function eventToForm(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? '',
    start_date: toDateTimeLocal(new Date(event.start_date)),
    end_date: event.end_date ? toDateTimeLocal(new Date(event.end_date)) : '',
    hasEnd: !!event.end_date,
    color: event.color || DEFAULT_EVENT_COLOR,
  }
}

export default function EventSheet({ open, onClose, selectedDate, events, refreshEvents }) {
  const dialogRef = useRef(null)
  const [mode, setMode] = useState('list') // 'list' | 'form'
  const [form, setForm] = useState(emptyForm(selectedDate || new Date()))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Eventos do dia selecionado
  const dayEvents = selectedDate
    ? events.filter((e) => isSameDay(new Date(e.start_date), selectedDate))
    : []

  // Abre/fecha o <dialog> nativo conforme prop. Ao abrir, volta pro modo 'list'.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setMode('list')
      setError('')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function startCreate() {
    setForm(emptyForm(selectedDate))
    setError('')
    setMode('form')
  }

  function startEdit(event) {
    setForm(eventToForm(event))
    setError('')
    setMode('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('título é obrigatório')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.hasEnd && form.end_date ? new Date(form.end_date).toISOString() : null,
      color: form.color,
    }

    const isEdit = form.id != null
    const url = isEdit ? `/api/events/${form.id}` : '/api/events/'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (!res.ok) {
      setError('algo deu errado 😿')
      return
    }
    await refreshEvents()
    setMode('list')
  }

  async function handleDelete() {
    if (form.id == null) return
    if (!window.confirm('deletar este evento?')) return
    setSaving(true)
    const res = await fetch(`/api/events/${form.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setSaving(false)
    if (!res.ok) {
      setError('não foi possível deletar 😿')
      return
    }
    await refreshEvents()
    setMode('list')
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box rounded-t-3xl sm:rounded-3xl bg-base-100 max-w-md">
        {selectedDate && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base-content text-lg lowercase">
              {formatHeader(selectedDate)}
            </h2>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost text-base-content/50">✕</button>
            </form>
          </div>
        )}

        {mode === 'list' && (
          <>
            {dayEvents.length === 0 ? (
              <p className="text-base-content/30 text-sm text-center py-6">
                nenhum evento neste dia 🌿
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => startEdit(event)}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200 transition-colors text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base-content text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-base-content/40">
                        {formatTime(event.start_date)}
                        {event.end_date && ` — ${formatTime(event.end_date)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button onClick={startCreate} className="btn btn-primary rounded-2xl w-full">
              + novo evento
            </button>
          </>
        )}

        {mode === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="título"
              className="input input-bordered rounded-2xl w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              required
            />

            <textarea
              placeholder="descrição (opcional)"
              className="textarea textarea-bordered rounded-2xl w-full"
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label className="text-xs text-base-content/50 -mb-2 ml-1">início</label>
            <input
              type="datetime-local"
              className="input input-bordered rounded-2xl w-full"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />

            <label className="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={form.hasEnd}
                onChange={(e) => setForm({ ...form, hasEnd: e.target.checked })}
              />
              tem horário de término?
            </label>

            {form.hasEnd && (
              <>
                <label className="text-xs text-base-content/50 -mb-2 ml-1">término</label>
                <input
                  type="datetime-local"
                  className="input input-bordered rounded-2xl w-full"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </>
            )}

            <div>
              <label className="text-xs text-base-content/50 ml-1">cor</label>
              <div className="flex gap-2 mt-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      form.color === c
                        ? 'ring-2 ring-offset-2 ring-base-content/40 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`cor ${c}`}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="btn btn-ghost rounded-2xl flex-1"
                disabled={saving}
              >
                cancelar
              </button>
              <button type="submit" className="btn btn-primary rounded-2xl flex-1" disabled={saving}>
                {saving ? <span className="loading loading-spinner loading-sm" /> : 'salvar'}
              </button>
            </div>

            {form.id != null && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-ghost rounded-2xl text-error"
                disabled={saving}
              >
                deletar evento
              </button>
            )}
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>fechar</button>
      </form>
    </dialog>
  )
}
