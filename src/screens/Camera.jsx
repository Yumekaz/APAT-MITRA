import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import './Camera.css'

export default function Camera() {
  const { navigateTo, navigateBack, showToast, cameraState, setCameraState } = useApp()

  // Reset camera state every time screen becomes active
  useEffect(() => {
    setCameraState('idle')
  }, [])

  function handleCapture() {
    if (cameraState === 'analyzing') return
    setCameraState('analyzing')
    setTimeout(() => setCameraState('result'), 2400)
  }

  return (
    <div className="camera-screen">

      {/* Dark viewfinder area */}
      <div className="viewfinder">
        <div className="cam-grain" />

        {/* Glowing wound area mock */}
        <div className="wound-blob" />

        {/* Corner scan frame */}
        <div className="scan-frame">
          {['tl','tr','bl','br'].map(c => <div key={c} className={`corner ${c}`} />)}
          <div className="scan-line" />
        </div>

        {/* Top bar */}
        <div className="cam-top-bar">
          <button className="cam-back-btn" onClick={navigateBack}>←</button>
          <span className="cam-title">AI TRIAGE</span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div className="offline-badge" style={{ fontSize:10 }}>
              <OfflineIcon />
            </div>
            <div className="cam-mode-badge">LIVE</div>
          </div>
        </div>

        {/* AI Overlay */}
        <div className="ai-overlay">
          {cameraState === 'idle' && (
            <div className="ai-hint">Point camera at the wound</div>
          )}
          {cameraState === 'analyzing' && (
            <div className="ai-analyzing-box">
              <div className="ai-spinner" />
              <span className="ai-text">Gemini analyzing injury...</span>
            </div>
          )}
          {cameraState === 'result' && (
            <div className="ai-result-box">
              <div className="result-top">
                <span className="result-title">Deep Laceration</span>
                <span className="confidence-badge">85% Confidence</span>
              </div>
              <p className="result-desc">
                AI suggests bleeding control protocol. If incorrect, please override.
              </p>
              <div className="result-actions">
                <button className="res-btn" onClick={() => showToast('Override — backend coming soon')}>
                  Override
                </button>
                <button className="res-btn confirm" onClick={() => navigateTo('protocol')}>
                  Proceed →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="cam-bottom">
        <p className="cam-instruction">
          <strong>Point camera at the wound.</strong><br />
          Hold steady for 2 seconds
        </p>
        <div className="capture-row">
          <button className="side-btn" onClick={() => showToast('Flashlight — hardware required')}>🔦</button>
          <button className="capture-btn" onClick={handleCapture}>
            {cameraState === 'analyzing' ? <div className="cap-spinner" /> : '📷'}
          </button>
          <button className="side-btn" onClick={() => showToast('Gallery — coming soon')}>↩</button>
        </div>
      </div>

    </div>
  )
}

function OfflineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
