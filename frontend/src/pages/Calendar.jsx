import { useState, useMemo } from 'react'
import { DayPicker, DayButton } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import EventSheet from '../components/EventSheet'

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export default function Calendar({ events, refreshEvents }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Agrupa eventos por dia (chave "Y-M-D")
  const eventsByDay = useMemo(() => {
    const map = new Map()
    for (const e of events) {
      const k = dayKey(new Date(e.start_date))
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(e)
    }
    return map
  }, [events])

  // Custom DayButton: número + bolinhas + cor de fundo pelo primeiro evento
  const CustomDayButton = useMemo(() => {
    return function CustomDay(props) {
      const date = props.day.date
      const dayEvents = eventsByDay.get(dayKey(date)) || []
      const hasEvent = dayEvents.length > 0
      const bgColor = hasEvent ? dayEvents[0].color : undefined
      const dots = dayEvents.slice(0, 3)

      return (
        <DayButton
          {...props}
          style={hasEvent ? { backgroundColor: bgColor + '55' } : undefined}
        >
          <span className="relative flex flex-col items-center justify-center">
            <span>{date.getDate()}</span>
            {hasEvent && (
              <span className="absolute -bottom-2 flex gap-0.5">
                {dots.map((e, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                ))}
              </span>
            )}
          </span>
        </DayButton>
      )
    }
  }, [eventsByDay])

  function handleSelect(date) {
    if (!date) return // ignora deselect ao clicar duas vezes no mesmo dia
    setSelectedDate(date)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-8">
      <h1 className="font-bold text-2xl text-base-content text-center mb-6 lowercase">
        calendário
      </h1>

      <div className="card bg-base-100 shadow-sm rounded-3xl p-4 max-w-md mx-auto">
        <DayPicker
          mode="single"
          locale={ptBR}
          selected={selectedDate}
          onSelect={handleSelect}
          showOutsideDays
          components={{ DayButton: CustomDayButton }}
        />
      </div>

      <EventSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedDate={selectedDate}
        events={events}
        refreshEvents={refreshEvents}
      />
    </div>
  )
}
