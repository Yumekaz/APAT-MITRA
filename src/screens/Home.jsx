import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Home.css'

export default function Home() {
  const { navigateTo, showToast, selectProtocol } = useApp()
  const [lang, setLang] = useState('HI')

  function openProtocol(protocolId) {
    selectProtocol(protocolId, {
      source: 'manual',
      confidence: 0.95,
      summary: 'Manual protocol selected from the home screen.',
    })
    navigateTo('protocol')
  }

  return (
    <div className="home">
      <div className="home-header">
        <div className="home-brand">आपत्<span>·</span>Mitra</div>
        <div className="offline-badge">
          <div className="offline-dot" />
          Prototype
        </div>
      </div>

      <div className="home-hero">
        <button className="emergency-btn" onClick={() => navigateTo('camera')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="white">
            <path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z"/>
          </svg>
          <span className="btn-label">START</span>
        </button>
        <p className="home-tagline">Capture a photo, choose a protocol,<br />and hear the next first-aid step</p>
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ icon, label, sub, onPress }) => (
          <button key={label} className="quick-action" onClick={() => onPress({ navigateTo, showToast, openProtocol })}>
            <span className="qa-icon">{icon}</span>
            <span className="qa-label">{label}</span>
            <span className="qa-sub">{sub}</span>
          </button>
        ))}
      </div>

      <div className="home-footer">
        <div className="acc-row">
          <button className="acc-btn" onClick={() => showToast('Voice guidance follows the phone language when available')}>
            <GlobeIcon />
          </button>
          <button className="acc-btn" onClick={() => showToast('Large-text mode is still a planned improvement')}>
            <TextIcon />
          </button>
        </div>
        <div className="lang-toggle">
          {['HI', 'EN'].map(code => (
            <button
              key={code}
              className={`lang-btn ${lang === code ? 'active' : ''}`}
              onClick={() => {
                setLang(code)
                showToast(code === 'HI' ? 'हिंदी मोड चुना गया' : 'English mode selected')
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { icon: '📷', label: 'Scan Injury', sub: 'Photo-assisted triage', onPress: ({ navigateTo }) => navigateTo('camera') },
  { icon: '🩸', label: 'Bleeding', sub: 'Direct pressure protocol', onPress: ({ openProtocol }) => openProtocol('bleeding') },
  { icon: '🔥', label: 'Burns', sub: 'Cool and cover', onPress: ({ openProtocol }) => openProtocol('burns') },
  { icon: '🆘', label: 'SOS · 112', sub: 'Compose emergency SMS', onPress: ({ navigateTo }) => navigateTo('sos') },
]

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
