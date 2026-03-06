import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import './Camera.css'

const PROTOCOL_OPTIONS = [
  { id: 'bleeding', label: 'Bleeding' },
  { id: 'burns', label: 'Burn' },
  { id: 'fracture', label: 'Fracture' },
  { id: 'cpr', label: 'CPR' },
]

const PROTOCOL_LABELS = {
  bleeding: 'Deep Laceration · Bleeding',
  burns: 'Thermal Burn',
  fracture: 'Suspected Fracture · Bone Injury',
  cpr: 'Possible Cardiac Arrest',
}

export default function Camera() {
  const {
    screen,
    navigateTo,
    navigateBack,
    showToast,
    cameraState,
    setCameraState,
    selectedProtocolId,
    selectProtocol,
    triageResult,
  } = useApp()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [manualProtocolId, setManualProtocolId] = useState(selectedProtocolId)
  const inputRef = useRef(null)

  useEffect(() => {
    if (screen === 'camera') {
      setCameraState('idle')
    }
  }, [screen, setCameraState])

  useEffect(() => {
    setManualProtocolId(selectedProtocolId)
  }, [selectedProtocolId])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setCameraState('idle')
  }

  function inferProtocolId(fileName) {
    const name = fileName.toLowerCase()
    if (name.includes('burn')) return 'burns'
    if (name.includes('fracture') || name.includes('bone')) return 'fracture'
    if (name.includes('cpr') || name.includes('collapse') || name.includes('drown')) return 'cpr'
    if (name.includes('bleed') || name.includes('cut') || name.includes('wound')) return 'bleeding'
    return manualProtocolId || 'bleeding'
  }

  function buildSummary(protocolId, source) {
    const summaries = {
      bleeding: 'Possible open wound with bleeding. Start direct pressure and monitor breathing.',
      burns: 'Possible burn injury. Cool the area with clean running water and protect the skin.',
      fracture: 'Possible fracture or crush injury. Keep the patient still and immobilize the limb.',
      cpr: 'Possible collapse or unresponsive patient. Call for help and begin CPR if needed.',
    }

    return `${summaries[protocolId]} ${source === 'manual' ? 'Protocol selected manually.' : 'Prototype routing used local rules.'}`
  }

  function applyProtocol(protocolId, source, confidence) {
    selectProtocol(protocolId, {
      injuryLabel: PROTOCOL_LABELS[protocolId],
      confidence,
      source,
      summary: buildSummary(protocolId, source),
      immediateWarning: protocolId === 'fracture' ? 'Do not move the injured limb.' : '',
    })
  }

  function handleCapture() {
    if (cameraState === 'analyzing') return
    if (!selectedFile && !manualProtocolId) {
      showToast('Capture or upload a photo first')
      return
    }

    setCameraState('analyzing')

    window.setTimeout(() => {
      const protocolId = selectedFile ? inferProtocolId(selectedFile.name) : manualProtocolId
      const source = selectedFile ? 'prototype' : 'manual'
      const confidence = selectedFile ? 0.78 : 0.95
      applyProtocol(protocolId, source, confidence)
      setCameraState('result')
    }, 1600)
  }

  const overlayClass = cameraState === 'result' ? 'ai-overlay ai-overlay-result' : 'ai-overlay ai-overlay-top'

  return (
    <div className="camera-screen">
      <input
        ref={inputRef}
        className="camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      <div className="viewfinder">
        <div className="cam-grain" />
        {previewUrl ? (
          <img className="camera-preview" src={previewUrl} alt="Selected injury preview" />
        ) : (
          <div className="wound-blob" />
        )}

        <div className="scan-frame">
          {['tl', 'tr', 'bl', 'br'].map(corner => <div key={corner} className={`corner ${corner}`} />)}
          <div className="scan-line" />
        </div>

        <div className="cam-top-bar">
          <div className="cam-top-left">
            <button className="cam-back-btn" onClick={navigateBack}>←</button>
            <div className="cam-title-wrap">
              <span className="cam-kicker">AI Assisted</span>
              <span className="cam-title">Triage</span>
            </div>
          </div>
          <div className="cam-top-right">
            <div className="offline-badge cam-offline-badge">
              <OfflineIcon />
              Gemini Proto
            </div>
            <div className="cam-mode-badge">PHOTO</div>
          </div>
        </div>

        <div className={overlayClass}>
          {cameraState === 'idle' && (
            <div className="ai-hint">
              {selectedFile ? `Ready to analyze ${selectedFile.name}` : 'Capture or upload an injury photo'}
            </div>
          )}
          {cameraState === 'analyzing' && (
            <div className="ai-analyzing-box">
              <div className="ai-spinner" />
              <span className="ai-text">Analyzing with Gemini-style prototype routing...</span>
            </div>
          )}
          {cameraState === 'result' && (
            <div className="ai-result-box">
              <div className="result-top">
                <span className="result-title">{triageResult.injuryLabel}</span>
                <span className="confidence-badge">{Math.round(triageResult.confidence * 100)}% Confidence</span>
              </div>
              <p className="result-desc">{triageResult.summary}</p>
              <p className="result-meta">Source: {selectedFile ? 'Photo-assisted prototype' : 'Manual selection'}</p>
              <div className="result-actions">
                <button className="res-btn" onClick={() => setCameraState('idle')}>
                  Re-check
                </button>
                <button className="res-btn confirm" onClick={() => navigateTo('protocol')}>
                  Open Protocol →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cam-bottom">
        <p className="cam-instruction">
          <strong>Use a live photo on mobile or upload a sample image.</strong><br />
          Select a protocol if you want to override the classification.
        </p>
        <div className="protocol-picker">
          {PROTOCOL_OPTIONS.map(option => (
            <button
              key={option.id}
              className={`protocol-chip ${manualProtocolId === option.id ? 'active' : ''}`}
              onClick={() => setManualProtocolId(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="capture-row">
          <button className="side-btn" onClick={() => inputRef.current?.click()}>🖼️</button>
          <button className="capture-btn" onClick={handleCapture}>
            {cameraState === 'analyzing' ? <div className="cap-spinner" /> : '📷'}
          </button>
          <button
            className="side-btn"
            onClick={() => {
              applyProtocol(manualProtocolId, 'manual', 0.95)
              navigateTo('protocol')
            }}
          >
            📋
          </button>
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
