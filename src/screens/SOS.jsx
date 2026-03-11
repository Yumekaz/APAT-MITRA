import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import './SOS.css'

export default function SOS() {
  const { navigateBack, showToast, currentStep, selectedProtocol, triageResult, location, setLocation, screen } = useApp()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(seconds => seconds + 1), 1000)
    return () => clearInterval(id)
  }, [])

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setLocation({
        status: 'unsupported',
        coords: null,
        updatedAt: null,
        error: 'Geolocation is not supported on this browser',
      })
      return
    }

    setLocation(prev => ({
      ...prev,
      status: 'loading',
      error: '',
    }))

    // Phase 1 — fast coarse location (WiFi / cell tower, ~1-2s)
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          status: 'ready',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          updatedAt: Date.now(),
          error: '',
        })
        // Phase 2 — silently upgrade to precise GPS in background
        navigator.geolocation.getCurrentPosition(
          precise => {
            setLocation({
              status: 'ready',
              coords: {
                latitude: precise.coords.latitude,
                longitude: precise.coords.longitude,
              },
              updatedAt: Date.now(),
              error: '',
            })
          },
          () => {},
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        )
      },
      error => {
        setLocation({
          status: 'error',
          coords: null,
          updatedAt: null,
          error: error.message || 'Location unavailable',
        })
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (screen !== 'sos') {
      return
    }

    if (location.status === 'ready' || location.status === 'loading') {
      return
    }

    requestLocation()
  }, [location.status, screen])

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')
  const coordsText = location.coords
    ? `Lat: ${location.coords.latitude.toFixed(5)} · Long: ${location.coords.longitude.toFixed(5)}`
    : location.status === 'loading'
      ? 'Fetching location...'
      : location.status === 'unsupported'
        ? 'Geolocation not supported'
        : 'Location unavailable'

  const gpsStatus = location.status === 'ready'
    ? 'Active'
    : location.status === 'loading'
      ? 'Searching'
      : location.status === 'unsupported'
        ? 'Unsupported'
        : 'Unavailable'

  const mapsLink = location.coords
    ? `https://maps.google.com/?q=${location.coords.latitude.toFixed(6)},${location.coords.longitude.toFixed(6)}`
    : ''

  const message = useMemo(() => {
    const parts = [
      'Apat-Mitra emergency alert.',
      `Injury: ${triageResult.injuryLabel}.`,
      `Protocol: ${selectedProtocol.title}, step ${Math.min(currentStep + 1, selectedProtocol.steps.length)}/${selectedProtocol.steps.length}.`,
      triageResult.summary,
    ]

    if (location.coords) {
      parts.push(`Location: ${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}.`)
      parts.push(`Map: ${mapsLink}.`)
    } else if (location.error) {
      parts.push(`Location unavailable: ${location.error}.`)
    }

    return parts.join(' ')
  }, [currentStep, location.coords, location.error, mapsLink, selectedProtocol.steps.length, selectedProtocol.title, triageResult.injuryLabel, triageResult.summary])

  function buildSmsHref(body) {
    const separator = /iphone|ipad|ipod/i.test(window.navigator.userAgent) ? '&' : '?'
    return `sms:112${separator}body=${encodeURIComponent(body)}`
  }

  async function handleSend() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Apat-Mitra SOS Alert',
          text: message,
        })
        showToast('Shared the emergency alert with live GPS details')
        return
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(message)
      } catch {
        // Clipboard access is optional; keep the SMS fallback path.
      }
    }

    window.location.href = buildSmsHref(message)
    showToast('Opened SMS composer with the GPS alert text')
  }

  return (
    <div className="sos-screen">
      <button className="back-nav" onClick={navigateBack}>
        <ChevronLeft /> Back
      </button>

      <div className="sos-header">
        <div className="sos-tag">SOS · Emergency</div>
        <h1 className="sos-title">Send Alert to 112</h1>
        <p className="sos-subtitle">Uses live geolocation when your browser allows it</p>
      </div>

      <div className="sms-card">
        <div className="sms-card-header">
          <div className="sms-icon">📱</div>
          <div className="sms-to">
            <div className="sms-to-label">Sending to</div>
            <div className="sms-to-number">112</div>
          </div>
          <div className="sms-auto-badge">SMS</div>
        </div>
        <div className="sms-body">
          <Field label="Message">{message}</Field>
          <Field label="GPS Location">
            <span className="coords">{coordsText}</span>
            {location.error ? <span className="coords-error">{location.error}</span> : null}
          </Field>
          <Field label="Protocol Status">
            {selectedProtocol.title} · Step {Math.min(currentStep + 1, selectedProtocol.steps.length)}/{selectedProtocol.steps.length}
          </Field>
        </div>
      </div>

      <div className="sos-info-grid">
        <InfoCard label="Injury Type" value={triageResult.protocolId.toUpperCase()} valueClass="danger" />
        <InfoCard label="GPS Lock" value={gpsStatus} valueClass={location.status === 'ready' ? 'good' : 'amber'} />
        <InfoCard label="Network" value="Share / SMS" valueClass="amber" />
        <InfoCard label="Time Elapsed" value={`${mins}:${secs}`} />
      </div>

      <div className="sos-cta">
        {location.status !== 'ready' ? (
          <button className="sos-retry-btn" onClick={requestLocation} disabled={location.status === 'loading'}>
            {location.status === 'loading' ? 'Fetching GPS...' : 'Retry GPS'}
          </button>
        ) : null}
        <button className="sos-send-btn" onClick={handleSend}>
          📤 Send SOS Alert
        </button>
        <button className="sos-cancel" onClick={navigateBack}>
          Return to protocol
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="sms-field">
      <div className="sms-field-label">{label}</div>
      <div className="sms-field-value">{children}</div>
    </div>
  )
}

function InfoCard({ label, value, valueClass }) {
  return (
    <div className="info-card">
      <div className="info-card-label">{label}</div>
      <div className={`info-card-value ${valueClass || ''}`}>{value}</div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
