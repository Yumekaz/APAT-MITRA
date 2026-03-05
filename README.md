# आपत्·Mitra — Apat-Mitra

**The AI First-Aid Co-Pilot That Works When Everything Else Fails**

> A voice-guided, offline-first Progressive Web App that turns any smartphone into an AI triage tool — no app store, no stable internet, no training required.

---

## The Problem

In disaster-prone Uttarakhand, ambulances take 18–20+ minutes to reach hilly terrain in normal conditions. During floods or landslides, roads wash out and towers go down entirely. The only person who can save a trauma victim in that window is an untrained bystander — who has no idea what to do.

Existing apps require stable internet, app store downloads, and complex navigation. All impossible during active emergencies.

**1.68 lakh+ Indians die from trauma injuries yearly. Nearly half are preventable with correct bystander first aid.** _(NCRB 2022)_

---

## The Solution

Apat-Mitra is a PWA that:

- **Opens via QR code** — no install, no app store, loads in 3 seconds on a ₹6,000 phone
- **Scans the injury** — Gemini 2.5 Flash Vision classifies wound type and routes to the correct protocol automatically
- **Reads steps aloud** — SpeechSynthesis API delivers Hindi + English voice guidance, fully offline after first load
- **Falls back silently** — if AI confidence is below 75% or network is unavailable, the app switches to certified NDMA offline protocols without showing any error
- **Sends SOS in one tap** — pre-composed SMS to 112 with live GPS coordinates and injury summary

---

## Live Demo

> **[Link to deployed app — Cloudflare Pages]**  
> Scan QR or open on mobile for best experience.

---

## Screenshots

| Home                               | AI Triage                              | Voice Protocol                             | SOS                              |
| ---------------------------------- | -------------------------------------- | ------------------------------------------ | -------------------------------- |
| ![Home](docs/screenshots/home.png) | ![Camera](docs/screenshots/camera.png) | ![Protocol](docs/screenshots/protocol.png) | ![SOS](docs/screenshots/sos.png) |

---

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Frontend       | React + Vite                                          |
| Styling        | Tailwind CSS (purged)                                 |
| Offline assets | Service Worker + Cache API                            |
| Offline data   | Protocol JSONs (NDMA certified)                       |
| AI triage      | Gemini 2.5 Flash Vision (via Cloudflare Worker proxy) |
| Voice output   | Web SpeechSynthesis API (offline)                     |
| Voice input    | Web SpeechRecognition (online enhancement)            |
| Location       | navigator.geolocation                                 |
| SOS            | sms: URI scheme → pre-filled 112                      |
| Hosting        | Cloudflare Pages                                      |

**No backend. No database. No server.**

---

## Offline Architecture

The app uses a **cache-first Service Worker** strategy:

1. On first load, all app assets + protocol JSONs are cached
2. Every subsequent load — even with zero internet — serves from cache
3. When network returns, cache updates silently in the background

This means a flood victim in Chamoli with no signal still gets full protocol guidance.

---

## Protocol Library

Stored as versioned JSON in `/public/protocols/`:

| Protocol        | Source                | Status      |
| --------------- | --------------------- | ----------- |
| `bleeding.json` | NDMA 2024 + Red Cross | ✅ Complete |
| `burns.json`    | NDMA Guidelines       | ✅ Complete |
| `cpr.json`      | AHA Guidelines        | ✅ Complete |
| `fracture.json` | NDMA + WHO            | ✅ Complete |

Each protocol includes bilingual voice lines for SpeechSynthesis playback.

---

## Project Structure

```
apat-mitra/
├── public/
│   ├── manifest.json          ← PWA manifest
│   ├── sw.js                  ← Service Worker (offline caching)
│   └── protocols/
│       ├── bleeding.json      ← Bleeding control (NDMA)
│       ├── burns.json         ← Burn protocol (NDMA)
│       ├── cpr.json           ← CPR (AHA)
│       └── fracture.json      ← Fracture/immobilization (NDMA+WHO)
├── src/
│   ├── context/
│   │   └── AppContext.jsx     ← Global state (navigation, step, camera)
│   ├── components/
│   │   ├── PhoneShell.jsx     ← App shell + screen switcher
│   │   └── Toast.jsx          ← Notification system
│   ├── screens/
│   │   ├── Home.jsx           ← Landing + quick actions
│   │   ├── Camera.jsx         ← AI triage camera (Gemini integration)
│   │   ├── Protocol.jsx       ← Step-by-step voice protocol
│   │   └── SOS.jsx            ← GPS + pre-filled SMS to 112
│   └── styles/
│       └── global.css         ← CSS variables + reset
└── gemini-prompts.js          ← Structured Gemini prompt templates
```

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Yumekaz/APAT-MITRA.git
cd APAT-MITRA

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open on mobile (or DevTools mobile view)
# → http://localhost:5173
```

---

## Hackathon Sprint Goals

Building during Graph-E-Thon 3.0 (72-hour finals):

- [ ] Gemini 2.5 Flash Vision API integration + confidence gate
- [ ] Real SpeechSynthesis voice protocol (Hindi + English)
- [ ] GPS fetch + real SMS to 112 on Android device
- [ ] Full offline test on budget ₹6,000 Android phone
- [ ] Cloudflare Worker proxy for API key protection

---

## Team — Codeinit

| Name               | Role                                  |
| ------------------ | ------------------------------------- |
| **Mihir Swarnkar** | Systems Architecture & AI Integration |
| **Taniya Taragi**  | Frontend Engineering & UI/UX          |
| **Tarun Pathak**   | Gemini API & Offline Systems          |
| **Diksha Kunwar**  | Protocol Research & Testing           |

**Graphic Era Hill University · Uttarakhand**  
**Graph-E-Thon 3.0 · Track 1: Intelligent Health & Learning · SDG 3 + SDG 4**

---

## References

1. NCRB Annual Report (2022) — 1.68 lakh trauma fatalities in India
2. ICIMOD — Chamoli Flood Report, May 2021 (200+ deaths/missing)
3. NHM Uttarakhand (2026) — 12,018 ASHA workers in Uttarakhand
4. WHO Health Emergencies Programme (2022) — Golden hour in trauma
5. AHA Guidelines — CPR and Emergency Cardiovascular Care

---

_"Rapid clinical care within 60 minutes of traumatic injury is key to a good outcome."_  
— WHO Health Emergencies Programme
