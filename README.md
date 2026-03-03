# Apat·Mitra — Frontend

Emergency First Aid App · React + Vite

## Project Structure

```
src/
├── context/
│   └── AppContext.jsx     ← Global state (navigation, toast, step)
├── components/
│   ├── PhoneShell.jsx     ← Phone frame, status bar, screen switcher
│   └── Toast.jsx          ← Notification popup
├── screens/
│   ├── Home.jsx / .css    ← Landing screen
│   ├── Camera.jsx / .css  ← AI Triage camera
│   ├── Protocol.jsx / .css← Step-by-step first aid
│   └── SOS.jsx / .css     ← Send alert to 112
├── styles/
│   └── global.css         ← CSS variables, reset, shared styles
├── App.jsx                ← Root component
└── main.jsx               ← React entry point
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Backend Placeholders

All buttons that need a backend show a toast saying "— coming soon".
When your backend is ready, connect it in:
- `Camera.jsx` → replace `setCameraState('result')` with real Gemini API call
- `SOS.jsx`    → replace `handleSend()` with real SMS / 112 API call
- `Protocol.jsx` → replace static steps with data from your API
