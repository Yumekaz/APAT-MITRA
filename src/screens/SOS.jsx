import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './SOS.css'

export default function SOS() {
  const { navigateBack, showToast } = useApp()
  const [elapsed, setElapsed] = useState(134) // seconds

  // Live elapsed timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  function handleSend() {
    showToast('SOS sent! Help is on the way 🚑')
    setTimeout(navigateBack, 1800)
  }

  return (
    <div className="sos-screen">

      {/* Back */}
      <button className="back-nav" onClick={navigateBack}>
        <ChevronLeft /> Back
      </button>

      {/* Header */}
      <div className="sos-header">
        <div className="sos-tag">SOS · Emergency</div>
        <h1 className="sos-title">Send Alert to 112</h1>
        <p className="sos-subtitle">Auto-composed with AI injury summary</p>
      </div>

      {/* SMS Preview card */}
      <div className="sms-card">
        <div className="sms-card-header">
          <div className="sms-icon">📱</div>
          <div className="sms-to">
            <div className="sms-to-label">Sending to</div>
            <div className="sms-to-number">112</div>
          </div>
          <div className="sms-auto-badge">AUTO</div>
        </div>
        <div className="sms-body">
          <Field label="Message">
            Apat-Mitra Alert: <strong>Deep laceration with active bleeding</strong> detected. Immediate help needed.
          </Field>
          <Field label="GPS Location">
            <span className="coords">Lat: 30.3165° N · Long: 78.0322° E</span>
          </Field>
          <Field label="Protocol Status">
            Bleeding Control Step 2/5 — In progress
          </Field>
        </div>
      </div>

      {/* Info grid */}
      <div className="sos-info-grid">
        <InfoCard label="Injury Type"   value="Laceration"  valueClass="danger" />
        <InfoCard label="GPS Lock"      value="✓ Active"    valueClass="good"   />
        <InfoCard label="Network"       value="SMS Only"    valueClass="amber"  />
        <InfoCard label="Time Elapsed"  value={`${mins}:${secs}`} />
      </div>

      {/* CTA */}
      <div className="sos-cta">
        <button className="sos-send-btn" onClick={handleSend}>
          📤 Send SOS Now
        </button>
        <button className="sos-cancel" onClick={navigateBack}>
          Cancel and return to protocol
        </button>
      </div>

    </div>
  )
}

// ---- Small reusable pieces ----
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
