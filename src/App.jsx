import { AppProvider } from './context/AppContext'
import PhoneShell from './components/PhoneShell'
import './styles/global.css'

export default function App() {
  return (
    <AppProvider>
      <PhoneShell />
    </AppProvider>
  )
}
