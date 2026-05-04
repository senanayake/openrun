# Research database

> Licensed under CC BY 4.0. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

An index of peer-reviewed running science papers that inform OpenRun's coaching algorithms. Every algorithm in `packages/core` should trace back to at least one entry here.

## What belongs here

- Studies directly relevant to coaching decisions: training zones, VDOT, periodization, HRV, nutrition, injury prevention
- Meta-analyses and systematic reviews are preferred over single small studies
- Expert consensus guidelines (e.g. ACSM, IAAF) when RCT evidence is sparse

## What doesn't belong here

- Opinion pieces, blog posts, or anecdotal sources
- Studies where the sample was < 5 and there is no corroborating evidence
- Paywalled papers with no accessible abstract

## Adding an entry

Validate your JSON against `schema.json` before submitting a PR:

```bash
npx ajv validate -s data/research/schema.json -d your-entry.json
```

See CONTRIBUTING.md for the full process.
