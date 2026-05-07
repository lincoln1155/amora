import { useState, useEffect, useCallback } from 'react'
import BottomNav from './BottomNav'
import Home from '../pages/Home'
import Habits from '../pages/Habits'
import Calendar from '../pages/Calendar'
import Notes from '../pages/Notes'
import Settings from '../pages/Settings'

const PAGES = {
  home: Home,
  habits: Habits,
  calendar: Calendar,
  notes: Notes,
  settings: Settings,
}

export default function Dashboard({ onLogout }) {
  const [page, setPage] = useState('home')
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState(false)
  const [events, setEvents] = useState([])
  const [displayName, setDisplayName] = useState('')

  const fetchEvents = useCallback(() => {
    return fetch('/api/events/', { credentials: 'include' })
      .then((res) => res.json())
      .then(setEvents)
      .catch(() => {})
  }, [])

  const fetchSettings = useCallback(() => {
    return fetch('/api/settings/', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setDisplayName(data.display_name))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/weather/', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setWeather)
      .catch(() => setWeatherError(true))

    fetchEvents()
    fetchSettings()
  }, [fetchEvents, fetchSettings])

  const PageComponent = PAGES[page]

  return (
    <div className="min-h-screen bg-base-100">
      <PageComponent
        weather={weather}
        weatherError={weatherError}
        events={events}
        refreshEvents={fetchEvents}
        displayName={displayName}
        refreshSettings={fetchSettings}
      />
      <BottomNav current={page} onChange={setPage} />
    </div>
  )
}
