# CarbonTrack Frontend

React + Vite + Tailwind CSS frontend for CarbonTrack, built to match the Milestone 1 & 2 design screens (Login, Register, Activity Logging, Dashboard, Set Goal modal).

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` by default. Set your backend URL in `.env`:

```
VITE_API_URL=http://localhost:8080/api
```

## What's implemented

- **Login** (`/login`) and **Register** (`/register`) — call `POST /api/auth/login` and `POST /api/auth/register`.
- **Dashboard** (`/dashboard`) — shows an empty state until activities exist, then switches to the populated weekly-summary view.
- **Log Activity** (`/activity`) — category tabs (Transport/Electricity/Food/Shopping), live CO2e preview as you type, recent logs list.
- **Set Carbon Goal** modal — reachable from the empty dashboard state.
- **Goals / Insights / Community** — placeholder pages only; not yet designed (Milestone 3 territory).

## Important: backend API assumptions to verify

I don't have your finalized controller/DTO code for activities, goals, or emission factors, so I made reasonable assumptions based on your entity fields and project doc. Check these against your actual backend before it'll work end-to-end:

| File | Assumed endpoint | Assumed request/response shape |
|---|---|---|
| src/api/auth.js | POST /api/auth/login | { email, password } -> { token, user } |
| src/api/auth.js | POST /api/auth/register | { fullName, email, password, confirmPassword } |
| src/api/activities.js | POST /api/activities | { category, activityType, quantity, unit, logDate } |
| src/api/activities.js | GET /api/activities/recent?limit=N | array of ActivityLog-shaped objects |
| src/api/activities.js | GET /api/activities/summary/weekly | { totalKgCo2e, weeklyTargetKg, percentChangeVsLastWeek, transportKg, electricityKg, foodKg, recommendations: [{title, description}] } |
| src/api/activities.js | GET /api/emission-factors?category=&activityType= | { kgCo2ePerUnit } |
| src/api/goals.js | GET /api/goals/current | null or { targetReductionPercent, timeframe, progressPercent } |
| src/api/goals.js | POST /api/goals | { targetReductionPercent, timeframe } |

None of these endpoints existed yet in your backend as of the last review -- only AuthController, HelloController, and TestController were present. You'll need to build ActivityController, GoalController, and an emission-factor lookup endpoint for the dashboard and logging screens to actually work against real data. Until then, the Activity Logging page falls back to hardcoded approximate emission factors client-side, and the dashboard/recent-logs sections just show their empty states gracefully (network errors are caught, not crashed on).

## Folder structure

```
frontend/
├── src/
│   ├── api/            # axios instance + one file per resource (auth, activities, goals)
│   ├── components/     # Layout (sidebar), ProtectedRoute, SetGoalModal
│   ├── context/         # AuthContext (JWT + user state)
│   ├── pages/           # Login, Register, Dashboard, LogActivity, Placeholder
│   ├── App.jsx           # routing
│   └── index.css         # Tailwind + brand theme colors
```
