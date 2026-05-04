# Architecture

OpenRun is a pnpm monorepo built with Turborepo. The coaching engine is Python; the web and mobile apps are TypeScript.

## Package map

```
openrun/
├── packages/
│   ├── core/          Python coaching engine (AGPL v3)
│   │                  VDOT, zones, periodization, HRV load management
│   ├── ui/            React component library (MIT)
│   │                  Shared UI primitives consumed by web and mobile
│   ├── integrations/  Third-party connectors (Apache 2.0)
│   │                  Strava, Garmin Connect, WHOOP, Oura
│   └── nano/          Watch engine (AGPL v3)
│       ├── garmin/    Monkey C for Garmin Connect IQ
│       └── apple-watch/ SwiftUI + WorkoutKit
│
├── apps/
│   ├── web/           Next.js 15 dashboard (AGPL v3)
│   └── mobile/        React Native + Expo (AGPL v3)
│
└── data/
    ├── research/      Peer-reviewed studies (CC BY 4.0)
    └── races/         Community race database (ODbL 1.0)
```

## Data flow

```
User activity data
    │
    ▼
packages/integrations  ←── Strava / Garmin / WHOOP / Oura APIs
    │
    ▼
packages/core          ←── coaching engine (VDOT, zones, periodization)
    │
    ├──▶ apps/api       FastAPI — REST + WebSocket
    │        │
    │        ▼
    │    apps/web       Next.js dashboard
    │
    └──▶ packages/nano  ←── direct to watch (no phone needed on-run)
             ├── garmin/
             └── apple-watch/
```

## Build pipeline

Turborepo orchestrates builds. `build` tasks depend on `^build` (upstream packages first). The CI pipeline runs lint, typecheck, JS tests, and Python tests independently so they can parallelise.

## Self-hosting

See `docker-compose.yml` at the root. The compose file brings up Postgres, Redis, Ollama, the API, and the web app. Copy `.env.example` to `.env` and edit before running.
