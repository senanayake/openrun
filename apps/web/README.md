# @openrun/web

> Licensed under AGPL v3. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

The OpenRun web dashboard. Built with Next.js 15, it is the reference implementation of the coaching interface:

- Training plan overview and week-by-week schedule
- VDOT tracking and race performance history
- Zone distribution analysis per workout
- HRV readiness trend and load management warnings
- Race database browser with course profiles

## Development

```bash
pnpm install
pnpm dev          # starts at http://localhost:3000
```

Requires the API service to be running. See the root `docker-compose.yml` for the full local stack.
