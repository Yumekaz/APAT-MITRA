import { useApp } from '../context/AppContext'
import './Protocol.css'

const STEPS = [
  { title: 'Call for help',       desc: 'Alert nearby people and bystanders immediately.' },
  { title: 'Apply firm pressure', desc: 'Press clean cloth directly on wound. Do not remove cloth once applied.' },
  { title: 'Elevate the limb',    desc: 'Raise the injured limb above heart level to slow bleeding.' },
  { title: 'Monitor breathing',   desc: "Check victim's breathing every 2 minutes." },
  { title: 'Wait for help',       desc: 'Keep the patient calm and still. Do not move them unless unsafe.' },
]

const VOICE_LINES = [
  '"Alert nearby people immediately..."',
  '"Press clean cloth on wound firmly..."',
  '"Raise the limb above heart level..."',
  '"Check breathing every 2 minutes..."',
  '"Keep the patient calm and still..."',
]

export default function Protocol() {
  const { navigateTo, navigateBack, showToast, currentStep, setCurrentStep } = useApp()

  const total   = STEPS.length
  const percent = Math.round((currentStep / total) * 100)
  const isLast  = currentStep === total - 1
  const isFirst = currentStep === 0

  function next() { if (!isLast)  setCurrentStep(s => s + 1) }
  function back() { if (!isFirst) setCurrentStep(s => s - 1) }

  return (
    <div className="protocol">

      {/* Back nav */}
      <button className="back-nav" onClick={navigateBack}>
        <ChevronLeft /> Back
      </button>

      {/* Header */}
      <div className="proto-header">
        <div className="injury-tag">Deep Laceration · Bleeding</div>
        <h1 className="proto-title">Bleeding Control<br />Protocol</h1>
        <p className="proto-subtitle">NDMA certified · Red Cross verified</p>
      </div>

      {/* Progress */}
      <div className="proto-progress">
        <div className="progress-labels">
          <span>STEP {currentStep + 1} OF {total}</span>
          <span>{percent}% COMPLETE</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Steps list */}
      <div className="steps-list">
        {STEPS.map((step, i) => {
          const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming'
          return (
            <div key={i} className={`step-card ${state}`}>
              <div className="step-num">
                {state === 'done' ? '✓' : i + 1}
              </div>
              <div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Voice bar */}
      <div className="voice-bar">
        <div className="voice-waves">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
        <span className="voice-text">{VOICE_LINES[currentStep]}</span>
        <div className="voice-controls">
          <button className="v-btn" onClick={() => showToast('Pause — backend coming soon')}>
            <PauseIcon />
          </button>
          <button className="v-btn" onClick={() => showToast('Repeat — backend coming soon')}>
            <RepeatIcon />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="proto-actions">
        <button
          className="btn-secondary"
          onClick={isFirst ? navigateBack : back}
          style={{ opacity: isFirst ? 0.4 : 1 }}
        >
          ← Back
        </button>
        {isLast ? (
          <button className="btn-primary" onClick={() => navigateTo('sos')}>
            Send SOS →
          </button>
        ) : (
          <button className="btn-primary" onClick={next}>
            Next Step →
          </button>
        )}
      </div>

    </div>
  )
}

// ---- Icons ----
function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}
function RepeatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>
  )
}
