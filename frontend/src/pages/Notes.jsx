import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function NoteSheet({ open, note, onClose, onSaved, onDeleted }) {
  const dialogRef = useRef(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const isEdit = note != null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setContent(note?.content ?? '')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, note])

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    const url = isEdit ? `/api/notes/${note.id}` : '/api/notes/'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: content.trim() }),
    })
    setSaving(false)
    if (!res.ok) return
    await onSaved()
    onClose()
  }

  async function handleDelete() {
    if (!isEdit) return
    if (!window.confirm('deletar essa nota?')) return
    setSaving(true)
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) {
      setSaving(false)
      return
    }
    await onDeleted()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box rounded-t-3xl sm:rounded-3xl bg-base-100 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base-content text-lg lowercase">
            {isEdit ? 'editar' : 'nova nota'}
          </h2>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost text-base-content/50">✕</button>
          </form>
        </div>

        <textarea
          className="textarea textarea-bordered rounded-2xl w-full min-h-40 text-base"
          placeholder="o que tá na sua cabeça? 🌸"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        <div className="flex gap-2 mt-4">
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="btn btn-ghost rounded-2xl text-error hover:bg-error/10"
            >
              deletar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="btn btn-primary rounded-2xl flex-1"
          >
            {saving ? <span className="loading loading-spinner" /> : 'salvar'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>fechar</button>
      </form>
    </dialog>
  )
}

function NoteCard({ note, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card bg-base-100 hover:bg-base-200/50 rounded-2xl p-4 text-left transition-colors border border-base-200"
    >
      <p className="text-base-content whitespace-pre-wrap line-clamp-6">{note.content}</p>
      <p className="text-xs text-base-content/40 mt-2">
        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: ptBR })}
      </p>
    </button>
  )
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, undefined = new, object = edit
  const sheetOpen = editing !== null

  async function fetchNotes() {
    const res = await fetch('/api/notes/', { credentials: 'include' })
    if (res.ok) {
      setNotes(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return (
    <div className="min-h-screen px-6 pb-32 pt-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-base-content">notas</h1>
        <button
          onClick={() => setEditing(undefined)}
          className="btn btn-primary btn-circle rounded-full"
          aria-label="nova nota"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📝</p>
          <p className="text-base-content/50">
            nenhuma nota ainda. <br />toque no <strong>+</strong> pra escrever.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} onClick={() => setEditing(n)} />
          ))}
        </div>
      )}

      <NoteSheet
        open={sheetOpen}
        note={editing || null}
        onClose={() => setEditing(null)}
        onSaved={fetchNotes}
        onDeleted={fetchNotes}
      />
    </div>
  )
}
