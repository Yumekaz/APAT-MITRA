import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import Home from '../screens/Home'
import Camera from '../screens/Camera'
import Protocol from '../screens/Protocol'
import SOS from '../screens/SOS'
import Toast from './Toast'

// Which screens exist and their render order
const SCREENS = ['home', 'camera', 'protocol', 'sos']

export default function PhoneShell() {
  const { screen, history } = useApp()
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = window.localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'light'
  })

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])

  // Determine CSS class for each screen
  const getScreenClass = (id) => {
    if (id === screen) return 'screen active'
    // The screen just below the active one stays visible (slide-behind effect)
    const idx = history.indexOf(id)
    if (idx !== -1 && idx === history.length - 2) return 'screen behind'
    return 'screen'
  }

  const screenMap = { home: <Home />, camera: <Camera />, protocol: <Protocol />, sos: <SOS /> }

  return (
    <div className="phone-shell">

      {/* Dynamic Island */}
      <div className="dynamic-island">
        <div className="island-dot" />
        <div className="island-camera" />
        <div className="island-dot" />
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-time">{time}</span>
        <div className="status-icons">
          <button
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="signal-bars">
            <div className="signal-bar" />
            <div className="signal-bar" />
            <div className="signal-bar" />
          </div>
          <div className="battery">
            <div className="battery-level" />
          </div>
        </div>
      </div>

      {/* All screens live here, CSS transitions handle show/hide */}
      <div className="screens-container">
        {SCREENS.map(id => (
          <div key={id} className={getScreenClass(id)}>
            {screenMap[id]}
          </div>
        ))}
      </div>

      <Toast />
    </div>
  )
}