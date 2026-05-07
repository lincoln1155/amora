const PAGES = [
  { id: 'home',     label: 'início',     emoji: '🏠' },
  { id: 'habits',   label: 'hábitos',    emoji: '🌱' },
  { id: 'calendar', label: 'calendário', emoji: '📅' },
  { id: 'notes',    label: 'notas',      emoji: '📝' },
  { id: 'settings', label: 'ajustes',    emoji: '⚙️' },
]

export default function BottomNav({ current, onChange }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-base-100/80 backdrop-blur-md shadow-xl rounded-full px-2 py-2 flex gap-1 border border-base-200">
        {PAGES.map((page) => (
          <button
            key={page.id}
            onClick={() => onChange(page.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              current === page.id
                ? 'bg-primary text-primary-content shadow-sm'
                : 'text-base-content/50 hover:text-base-content hover:bg-base-200'
            }`}
          >
            <span className="text-base">{page.emoji}</span>
            <span className={current === page.id ? 'inline' : 'hidden sm:inline'}>
              {page.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
