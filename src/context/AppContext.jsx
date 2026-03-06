import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const AppContext = createContext(null)
const PROTOCOL_IDS = ['bleeding', 'burns', 'cpr', 'fracture']
const FALLBACK_PROTOCOL = {
  id: 'bleeding',
  title: 'Bleeding Control Protocol',
  subtitle: 'NDMA certified · Red Cross verified',
  tag: 'Deep Laceration · Bleeding',
  steps: [
    { title: 'Call for help', desc: 'Alert nearby people and bystanders immediately.' },
    { title: 'Apply firm pressure', desc: 'Press clean cloth directly on wound. Do not remove cloth once applied.' },
    { title: 'Elevate the limb', desc: 'Raise the injured limb above heart level to slow bleeding.' },
    { title: 'Monitor breathing', desc: "Check victim's breathing every 2 minutes." },
    { title: 'Wait for help', desc: 'Keep the patient calm and still. Do not move them unless unsafe.' },
  ],
  voice_lines: [
    '"Alert nearby people immediately..."',
    '"Press clean cloth on wound firmly..."',
    '"Raise the limb above heart level..."',
    '"Check breathing every 2 minutes..."',
    '"Keep the patient calm and still..."',
  ],
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('home')
  const [history, setHistory] = useState(['home'])
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [cameraState, setCameraState] = useState('idle')
  const [protocolLibrary, setProtocolLibrary] = useState({ [FALLBACK_PROTOCOL.id]: FALLBACK_PROTOCOL })
  const [selectedProtocolId, setSelectedProtocolId] = useState(FALLBACK_PROTOCOL.id)
  const [triageResult, setTriageResult] = useState({
    injuryLabel: FALLBACK_PROTOCOL.tag,
    protocolId: FALLBACK_PROTOCOL.id,
    confidence: 0.85,
    source: 'demo',
    summary: 'Active bleeding suspected. Apply direct pressure and continue monitoring.',
    immediateWarning: '',
  })
  const [location, setLocation] = useState({
    status: 'idle',
    coords: null,
    updatedAt: null,
    error: '',
  })
  const toastTimer = useRef(null)

  useEffect(() => {
    let ignore = false

    async function loadProtocols() {
      try {
        const entries = await Promise.all(
          PROTOCOL_IDS.map(async (id) => {
            const response = await fetch(`/protocols/${id}.json`)
            if (!response.ok) {
              throw new Error(`Failed to load ${id}`)
            }
            const data = await response.json()
            return [id, { id, ...data }]
          })
        )

        if (!ignore) {
          setProtocolLibrary(Object.fromEntries(entries))
        }
      } catch (error) {
        console.warn('Falling back to bundled protocol defaults', error)
      }
    }

    loadProtocols()
    return () => {
      ignore = true
    }
  }, [])

  const navigateTo = (target) => {
    setHistory(prev => [...prev, target])
    setScreen(target)
  }

  const navigateBack = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev
      const next = [...prev]
      next.pop()
      setScreen(next[next.length - 1])
      return next
    })
  }

  const showToast = (msg) => {
    setToast(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600)
  }

  const selectedProtocol = protocolLibrary[selectedProtocolId] ?? FALLBACK_PROTOCOL

  const selectProtocol = (protocolId, overrides = {}) => {
    const protocol = protocolLibrary[protocolId] ?? protocolLibrary[FALLBACK_PROTOCOL.id] ?? FALLBACK_PROTOCOL
    setSelectedProtocolId(protocol.id)
    setCurrentStep(0)
    setTriageResult(prev => ({
      ...prev,
      injuryLabel: overrides.injuryLabel ?? protocol.tag,
      protocolId: protocol.id,
      confidence: overrides.confidence ?? prev.confidence,
      source: overrides.source ?? prev.source,
      summary: overrides.summary ?? prev.summary,
      immediateWarning: overrides.immediateWarning ?? prev.immediateWarning,
    }))
  }

  const value = useMemo(() => ({
    screen,
    history,
    navigateTo,
    navigateBack,
    toast,
    toastVisible,
    showToast,
    currentStep,
    setCurrentStep,
    cameraState,
    setCameraState,
    protocolLibrary,
    selectedProtocol,
    selectedProtocolId,
    selectProtocol,
    triageResult,
    setTriageResult,
    location,
    setLocation,
  }), [
    screen,
    history,
    toast,
    toastVisible,
    currentStep,
    cameraState,
    protocolLibrary,
    selectedProtocol,
    selectedProtocolId,
    triageResult,
    location,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
