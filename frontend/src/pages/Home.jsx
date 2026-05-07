import { useState } from 'react'

const TIME_CONFIG = {
  morning:   { greeting: 'bom dia',        snoopy: '/snoopy/morning.png'   },
  afternoon: { greeting: 'boa tarde',       snoopy: '/snoopy/afternoon.png' },
  evening:   { greeting: 'boa noite',       snoopy: '/snoopy/evening.png'   },
  night:     { greeting: 'boa madrugada',   snoopy: '/snoopy/night.png'     },
}

function getTimePeriod() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

function getSnoopyImage(period, weatherDesc) {
  if (import.meta.env.DEV) {
    const override = new URLSearchParams(window.location.search).get('snoopy')
    if (override === 'rain') return '/snoopy/rain.png'
    if (TIME_CONFIG[override]) return TIME_CONFIG[override].snoopy
  }
  if (weatherDesc?.includes('chuva') || weatherDesc?.includes('garoa'))
    return '/snoopy/rain.png'
  return TIME_CONFIG[period].snoopy
}

function formatEventDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (isToday) return `hoje às ${time}`
  if (isTomorrow) return `amanhã às ${time}`
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
}

function SnoopyImage({ src, compact = false }) {
  const [missing, setMissing] = useState(false)

  if (missing) {
    return (
      <div className={`w-full h-full flex justify-center ${compact ? 'items-center' : 'items-end'}`}>
        <span className={`select-none leading-none ${compact ? 'text-5xl' : 'text-[10rem]'}`}>🐾</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="snoopy"
      onError={() => setMissing(true)}
      className={`w-full h-full object-contain drop-shadow-xl ${compact ? 'object-center' : 'object-bottom'}`}
    />
  )
}

export default function Home({ weather, weatherError, events, displayName }) {
  const period = getTimePeriod()
  const { greeting } = TIME_CONFIG[period]
  const snoopySrc = getSnoopyImage(period, weather?.description)
  const name = displayName || 'você'

  const upcoming = events
    .filter((e) => new Date(e.start_date) >= new Date())
    .slice(0, 4)

  return (
    <div className="min-h-screen flex items-center px-8 md:px-16 lg:px-24 pb-28 pt-12">
      <div className="w-full max-w-7xl mx-auto flex items-center gap-12 lg:gap-20">

        {/* ── Coluna de texto ── */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Saudação */}
          <div className="flex items-center gap-4">
            <h1 className="flex-1 text-5xl md:text-6xl lg:text-7xl font-bold text-base-content leading-tight">
              {greeting},<br />
              <span className="text-primary">{name}</span>.
            </h1>
            {/* Snoopy compacto (só mobile/tablet) */}
            <div className="lg:hidden w-36 h-36 shrink-0">
              <SnoopyImage src={snoopySrc} compact />
            </div>
          </div>

          {/* Clima */}
          <div className="text-xl md:text-2xl text-base-content/60 font-medium leading-relaxed">
            {weatherError && (
              <span>o clima não está configurado ainda.</span>
            )}
            {!weatherError && !weather && (
              <div className="flex flex-col gap-2">
                <div className="skeleton h-7 w-80 rounded-xl" />
              </div>
            )}
            {weather && (
              <span>
                o clima hoje em <strong className="text-base-content">{weather.city}</strong> é{' '}
                <strong className="text-base-content">{weather.description}</strong> com{' '}
                <strong className="text-base-content">{weather.temp}°C</strong>.
              </span>
            )}
          </div>

          {/* Próximos eventos */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-base-content/40 uppercase tracking-widest">
              próximos eventos
            </p>
            {upcoming.length === 0 ? (
              <p className="text-base-content/30 text-lg">nenhum evento por aí 🌿</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="text-lg font-medium text-base-content">{event.title}</span>
                    <span className="text-base-content/40 text-base">
                      {formatEventDate(event.start_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Snoopy ── */}
        <div className="hidden lg:flex w-72 xl:w-96 h-96 shrink-0 items-end justify-center">
          <SnoopyImage src={snoopySrc} />
        </div>

      </div>
    </div>
  )
}
