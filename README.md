# OpenRun

**Evidence-based running coaching, open to everyone.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![CI](https://github.com/senanayake/openrun/actions/workflows/ci.yml/badge.svg)](https://github.com/senanayake/openrun/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

## What OpenRun is

OpenRun brings elite-grade running coaching science to every runner, for free. It implements VDOT-based training zones, periodized plan generation, HRV-driven load management, and race-specific preparation — the same methods used by world-class coaches — and makes the algorithms fully transparent and auditable.

If you want to understand *why* your easy pace is 5:45/km and not 6:00/km, OpenRun can show you the study that informs that number. Every coaching decision traces back to peer-reviewed research in `data/research/`.

## Why it exists

Most running platforms are black boxes. They tell you what to do but not why. The algorithms that set your training load, recommend your race pace, and flag your injury risk are proprietary and unauditable. Personalised coaching is expensive and inaccessible to most runners. Data you generate — your GPS tracks, heart rate, sleep — is locked inside platforms you don't control.

OpenRun is the alternative: transparent algorithms, your data in your own database, community-validated research, and a coaching engine anyone can read, critique, and improve.

## Key principles

- **Research-first** — every algorithm cites its source; no voodoo metrics
- **Transparent** — the coaching engine is open source; read it, fork it, improve it
- **Your data is yours** — self-host the full stack; nothing leaves your server unless you choose
- **Built for all runners** — from couch to ultramarathon; beginner-friendly UI, expert-accessible internals
- **Community-validated** — coaches and sport scientists contribute and review

## Architecture

This is a pnpm monorepo using Turborepo. See [docs/architecture.md](docs/architecture.md) for the full picture.

| Package / App | Description | License |
|---|---|---|
| `packages/core` | Python coaching engine (VDOT, zones, periodization, HRV) | AGPL v3 |
| `packages/ui` | React component library (pace calculators, zone charts) | MIT |
| `packages/integrations` | Strava, Garmin Connect, WHOOP, Oura connectors | Apache 2.0 |
| `packages/nano` | Watch engine — Garmin Connect IQ (Monkey C) + Apple Watch (SwiftUI) | AGPL v3 |
| `apps/web` | Next.js 15 training dashboard | AGPL v3 |
| `apps/mobile` | React Native + Expo companion app | AGPL v3 |
| `data/research` | Peer-reviewed running science index | CC BY 4.0 |
| `data/races` | Community race database with course profiles | ODbL 1.0 |

## Quick start

```bash
git clone https://github.com/senanayake/openrun.git
cd openrun
pnpm install
pnpm dev
```

### Full self-hosted stack

```bash
cp .env.example .env
# edit .env — set a real API_SECRET_KEY at minimum
docker compose up
```

This starts Postgres, Redis, Ollama, the FastAPI backend, and the Next.js web app. The web app is at `http://localhost:3000`.

## Contributing

Anyone can contribute — runners, developers, sport scientists, coaches. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started, including how to add race data or research citations without writing any code.

By contributing you agree to the [Contributor License Agreement](CONTRIBUTING.md#contributor-license-agreement).

## License

OpenRun uses different licenses for different components. The short version:

- Coaching engine and apps: **AGPL v3** — use freely, but share your changes
- UI components: **MIT** — use anywhere, no restrictions
- Integrations: **Apache 2.0** — use in commercial apps, includes patent grant
- Research data: **CC BY 4.0** — use freely, give attribution
- Race database: **ODbL 1.0** — use freely, keep derived databases open

Read [docs/licenses/PLAIN-ENGLISH.md](docs/licenses/PLAIN-ENGLISH.md) for a plain-English explanation of what each license means for you.

Companies wanting to use the coaching engine in a closed-source product can enquire about a commercial license by opening an issue tagged `commercial-license`.

## Community

- **GitHub Discussions** — questions, ideas, coaching science debate
- **Issues** — bugs and feature requests (use the templates)
- **Code of conduct** — [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
