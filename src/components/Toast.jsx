import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast, toastVisible } = useApp()

  return (
    <div className={`toast ${toastVisible ? 'visible' : ''}`}>
      {toast}
    </div>
  )
}
