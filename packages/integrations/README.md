# @openrun/integrations

> Licensed under Apache 2.0. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

OpenRun connectors for third-party fitness platforms and wearables:

- **Strava** — activity import, segment data, kudos sync
- **Garmin Connect** — activity history, HRV status, training readiness
- **WHOOP** — recovery score, strain, sleep performance
- **Oura** — readiness, activity, sleep ring data

Licensed under Apache 2.0 so connector code can be embedded in commercial applications without triggering AGPL requirements on the host app. The coaching logic in `packages/core` remains AGPL.

## Development

```bash
pnpm install
pnpm build
pnpm test
```
