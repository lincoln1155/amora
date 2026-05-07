const timeConfig = {
  morning: {
    greeting: 'bom dia',
    emoji: '🌸',
    bg: 'from-pink-50 to-amber-50',
    message: 'que o seu dia seja lindo!',
  },
  afternoon: {
    greeting: 'boa tarde',
    emoji: '🌤️',
    bg: 'from-amber-50 to-orange-50',
    message: 'continue arrasando!',
  },
  evening: {
    greeting: 'boa noite',
    emoji: '🌙',
    bg: 'from-violet-50 to-pink-50',
    message: 'hora de relaxar ✨',
  },
  night: {
    greeting: 'boa madrugada',
    emoji: '⭐',
    bg: 'from-indigo-50 to-violet-50',
    message: 'vai dormir! 😴',
  },
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function WelcomeCard() {
  const period = getTimeOfDay()
  const { greeting, emoji, bg, message } = timeConfig[period]

  return (
    <div className={`card rounded-3xl p-6 bg-gradient-to-br ${bg} shadow-sm`}>
      <div className="flex items-center gap-5">
        <div className="text-6xl select-none">{emoji}</div>
        <div>
          <h1 className="text-2xl font-bold text-base-content">{greeting}!</h1>
          <p className="text-base-content/50 text-sm capitalize">{formatDate()}</p>
          <p className="text-base-content/40 text-xs mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}
