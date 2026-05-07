function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UpcomingEvents({ events }) {
  const now = new Date()
  const upcoming = events
    .filter((e) => new Date(e.start_date) >= now)
    .slice(0, 5)

  return (
    <div className="card bg-base-100 shadow-sm rounded-3xl p-5">
      <h2 className="font-bold text-base text-base-content mb-4">próximos eventos</h2>

      {upcoming.length === 0 ? (
        <p className="text-base-content/30 text-sm text-center py-4">
          nenhum evento por aí 🌿
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((event) => (
            <div key={event.id} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base-content text-sm truncate">{event.title}</p>
                <p className="text-xs text-base-content/40">{formatDate(event.start_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
