import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

export default function App() {
  // 'loading' enquanto verifica o cookie, 'in' ou 'out' depois
  const [auth, setAuth] = useState('loading')

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => setAuth(res.ok ? 'in' : 'out'))
      .catch(() => setAuth('out'))
  }, [])

  if (auth === 'loading') {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (auth === 'out') {
    return <Login onLogin={() => setAuth('in')} />
  }

  return <Dashboard onLogout={() => setAuth('out')} />
}
