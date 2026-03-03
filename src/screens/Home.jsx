import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Home.css'

export default function Home() {
  const { navigateTo, showToast } = useApp()
  const [lang, setLang] = useState('HI')

  return (
    <div className="home">

      {/* Header */}
      <div className="home-header">
        <div className="home-brand">आपत्<span>·</span>Mitra</div>
        <div className="offline-badge">
          <div className="offline-dot" />
          Offline
        </div>
      </div>

      {/* Hero CTA */}
      <div className="home-hero">
        <button className="emergency-btn" onClick={() => navigateTo('camera')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="white">
            <path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z"/>
          </svg>
          <span className="btn-label">START</span>
        </button>
        <p className="home-tagline">Tap to begin emergency<br />first aid guidance</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ icon, label, sub, action }) => (
          <div
            key={label}
            className="quick-action"
            onClick={() => action ? navigateTo(action) : showToast(`${label} — backend coming soon`)}
          >
            <span className="qa-icon">{icon}</span>
            <span className="qa-label">{label}</span>
            <span className="qa-sub">{sub}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="home-footer">
        <div className="acc-row">
          <button className="acc-btn" onClick={() => showToast('Language — coming soon')}>
            <GlobeIcon />
          </button>
          <button className="acc-btn" onClick={() => showToast('Text size — coming soon')}>
            <TextIcon />
          </button>
        </div>
        <div className="lang-toggle">
          {['HI', 'EN'].map(l => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => {
                setLang(l)
                showToast(l === 'HI' ? 'हिंदी चुनी गई' : 'English selected')
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

// ---- Data ----
const QUICK_ACTIONS = [
  { icon: '📷', label: 'Scan Injury', sub: 'AI triage',        action: 'camera'   },
  { icon: '📋', label: 'Protocols',   sub: 'First aid guides', action: 'protocol' },
  { icon: '🆘', label: 'SOS · 112',  sub: 'GPS + injury',     action: 'sos'      },
  { icon: '🗣️', label: 'Voice',       sub: 'Hindi / EN',       action: null       },
]

// ---- Inline SVG icons ----
function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 0 0 20z"/>
    </svg>
  )
}
function TextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  )
}
