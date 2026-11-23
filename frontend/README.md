# Expense Tracker — Frontend

Vite + React + TypeScript + Tailwind CSS dashboard for the Smart Expense Tracker.

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Optional: copy `.env.example` to `.env` and set `VITE_API_URL` (default `http://localhost:8000`). Dev server proxies `/api` → backend.

```bash
npm run build    # production build
npm run preview  # preview dist/
```

## Auth

Sign In / Sign Up store a JWT in `localStorage`. Dashboard routes are protected. Sign Out is in the sidebar and Settings. If the backend is down, auth and data APIs fall back to local demo mode so the UI remains usable.
