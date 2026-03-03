import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [screen, setScreen]         = useState('home')       // active screen
  const [history, setHistory]       = useState(['home'])     // navigation stack
  const [toast, setToast]           = useState('')           // toast message
  const [toastVisible, setToastVisible] = useState(false)
  const [currentStep, setCurrentStep]   = useState(1)       // protocol step (0-indexed)
  const [cameraState, setCameraState]   = useState('idle')  // idle | analyzing | result
  const toastTimer = useRef(null)

  // ---- Navigation ----
  const navigateTo = useCallback((target) => {
    setHistory(prev => [...prev, target])
    setScreen(target)
  }, [])

  const navigateBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev
      const next = [...prev]
      next.pop()
      setScreen(next[next.length - 1])
      return next
    })
  }, [])

  // ---- Toast ----
  const showToast = useCallback((msg) => {
    setToast(msg)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600)
  }, [])

  return (
    <AppContext.Provider value={{
      screen, history,
      navigateTo, navigateBack,
      toast, toastVisible, showToast,
      currentStep, setCurrentStep,
      cameraState, setCameraState,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook — import this in any component
export const useApp = () => useContext(AppContext)
