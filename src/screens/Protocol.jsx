import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import './Protocol.css'

export default function Protocol() {
  const {
    navigateTo,
    navigateBack,
    showToast,
    currentStep,
    setCurrentStep,
    selectedProtocol,
    triageResult,
    screen,
  } = useApp()
  const [isSpeaking, setIsSpeaking] = useState(false)

  const steps = selectedProtocol.steps ?? []
  const voiceLines = selectedProtocol.voice_lines ?? []
  const total = steps.length
  const safeStep = Math.min(currentStep, Math.max(total - 1, 0))
  const percent = total <= 1 ? (total === 0 ? 0 : 100) : Math.round((safeStep / (total - 1)) * 100)
  const isLast = safeStep === total - 1
  const isFirst = safeStep === 0
  const currentVoiceLine = voiceLines[safeStep] ?? steps[safeStep]?.desc ?? 'Follow the protocol carefully.'

  const spokenText = useMemo(() => {
    const warning = triageResult.immediateWarning ? `${triageResult.immediateWarning} ` : ''
    return `${warning}${currentVoiceLine.replaceAll('"', '')}`
  }, [currentVoiceLine, triageResult.immediateWarning])

  useEffect(() => {
    if (screen !== 'protocol') return undefined
    if (!('speechSynthesis' in window) || !spokenText) return undefined

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)

    return () => {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [screen, safeStep, spokenText])

  function next() {
    if (!isLast) setCurrentStep(step => step + 1)
  }

  function back() {
    if (!isFirst) setCurrentStep(step => step - 1)
  }

  function repeatStep() {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported on this browser')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported on this browser')
      return
    }

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setIsSpeaking(false)
      return
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsSpeaking(true)
      return
    }

    repeatStep()
  }

  if (!total) {
    return (
      <div className="protocol">
        <button className="back-nav" onClick={navigateBack}>
          <ChevronLeft /> Back
        </button>
        <div className="proto-header">
          <div className="injury-tag">Protocol unavailable</div>
          <h1 className="proto-title">No steps loaded</h1>
          <p className="proto-subtitle">Return home and try another protocol.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="protocol">
      <button className="back-nav" onClick={navigateBack}>
        <ChevronLeft /> Back
      </button>

      <div className="proto-header">
        <div className="injury-tag">{triageResult.injuryLabel}</div>
        <h1 className="proto-title">{selectedProtocol.title}</h1>
        <p className="proto-subtitle">{selectedProtocol.subtitle}</p>
        {triageResult.immediateWarning ? (
          <p className="proto-warning">Warning: {triageResult.immediateWarning}</p>
        ) : null}
      </div>

      <div className="proto-progress">
        <div className="progress-labels">
          <span>STEP {safeStep + 1} OF {total}</span>
          <span>{percent}% COMPLETE</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => {
          const state = index < safeStep ? 'done' : index === safeStep ? 'active' : 'upcoming'
          return (
            <div key={step.title} className={`step-card ${state}`}>
              <div className="step-num">{state === 'done' ? '✓' : index + 1}</div>
              <div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="voice-bar">
        <div className="voice-waves" aria-hidden="true">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`wave-bar ${isSpeaking ? 'active' : ''}`} style={{ animationDelay: `${index * 0.07}s` }} />
          ))}
        </div>
        <span className="voice-text">{currentVoiceLine}</span>
        <div className="voice-controls">
          <button className="v-btn" onClick={toggleSpeech}>
            <PauseIcon paused={!isSpeaking} />
          </button>
          <button className="v-btn" onClick={repeatStep}>
            <RepeatIcon />
          </button>
        </div>
      </div>

      <div className="proto-actions">
        <button className="btn-secondary" onClick={isFirst ? navigateBack : back} style={{ opacity: isFirst ? 0.4 : 1 }}>
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

function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function PauseIcon({ paused }) {
  return paused ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ) : (
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
