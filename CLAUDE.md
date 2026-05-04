# OpenRun

Evidence-based running coaching platform. pnpm monorepo with Turborepo.
Coaching engine in Python (`packages/core`); apps and UI in TypeScript.

## Branch workflow

**Never work directly on `main`.** Always create a feature branch:

```bash
git checkout -b feature/<short-name>   # new feature
git checkout -b fix/<short-name>       # bug fix
git checkout -b data/<name>            # race or research data entry
git checkout -b docs/<name>            # K-Briefs, docs only
```

Open a PR to `main` when ready. Merge via GitHub.

## Build commands

### JavaScript / TypeScript (all packages)
```bash
pnpm install
pnpm build        # Turborepo build pipeline
pnpm lint         # ESLint
pnpm typecheck    # TypeScript
pnpm test         # Vitest / Jest
pnpm dev          # dev servers
```

### Python (packages/core)
```bash
cd packages/core
uv pip install -e ".[dev]"
ruff check .
mypy .
pytest
```

### Data validation
```bash
npx ajv validate -s data/races/schema.json -d <file>
npx ajv validate -s data/research/schema.json -d <file>
```

## Architecture

- `packages/core/` — Python coaching engine; VDOT, zones, periodization, HRV load management
- `packages/ui/` — React component library shared by web and mobile
- `packages/integrations/` — Strava, Garmin, WHOOP, Oura connectors
- `packages/nano/` — Watch engine; Garmin Monkey C + Apple Watch SwiftUI
- `apps/web/` — Next.js 15 dashboard
- `apps/mobile/` — React Native + Expo
- `data/research/` — peer-reviewed study citations backing every algorithm
- `data/races/` — community race database with course profiles

## KBPD methodology

Knowledge gaps are recorded as K-Briefs in `.kbriefs/`. The index and templates are in
`.kbriefs/README.md`. Create a K-Brief before building any non-trivial coaching feature.

See AGENTS.md for the full agent operating rules.

## Non-obvious constraints

- No coaching algorithm in `packages/core` without a `data/research/` citation
- `packages/core` is AGPL v3; do not change this without a governance decision
- VDOT (Daniels & Gilbert, 1979) is the coaching engine foundation — see KB-2026-003
- Schema validation is required for all data/ contributions before committing
- Container-first for Python work: use the polyglot-devcontainers-python-node image
