# Race database

> Licensed under ODbL 1.0. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

Community-maintained database of marathon and road race data: course profiles, elevation, typical weather, and strategy notes. Used by `packages/core` for race-specific preparation plans.

## What belongs here

- Road races with measurable course data (elevation profile, distance verified)
- Enough strategy detail to be useful to a runner preparing for the race
- Only verified public information — no private GPS data

## Adding a race

1. Copy `examples/twin-cities-2026.json` as a starting point
2. Fill in all required fields per `schema.json`
3. Validate: `npx ajv validate -s data/races/schema.json -d your-race.json`
4. Submit a PR — a human reviewer who has run the race (or can verify the data) will review it

## License note

The ODbL requires that derived databases remain open. If you build an app on top of this database, your app can be any license you choose — but if you redistribute a modified version of the database itself, it must stay ODbL.
