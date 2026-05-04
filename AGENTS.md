# AGENTS.md

This file defines the **operating rules for AI coding agents** working in this repository.

Agents must read and follow this file before making changes.

The goal of this repository is to build **OpenRun** — an open-source, evidence-based running
coaching platform that brings elite coaching science to every runner, with full transparency
into the algorithms and research behind every recommendation.

---

# 0. Development Philosophy: Knowledge-Based Product Development

This repository follows **Knowledge-Based Product Development (KBPD)** principles.

Product development is a **knowledge-generation system**, not a task-execution system.

## Core Principles

### Product Development = Learning System

Traditional approach:
```
Execute plan → hit milestones → ship
```

KBPD approach:
```
Identify knowledge gaps → run learning cycles → capture knowledge → make evidence-based decisions
```

### Knowledge Gaps Are First-Class Artifacts

Before implementing, explicitly identify:
- What is unknown but critical to success
- What assumptions need validation
- What coaching science research exists
- What trade-offs need quantification

### Evidence Before Commitment

Delay irreversible decisions until sufficient knowledge is available.
For coaching algorithms: no code before a research citation exists.

### Knowledge Briefs (K-Briefs)

Capture learning in **structured, reusable artifacts** called K-Briefs.

K-Briefs are **first-class artifacts**, not optional documentation.

See `.kbriefs/README.md` for complete K-Brief system documentation.

## When to Create K-Briefs

Agents must create K-Briefs when:
- ✅ A coaching algorithm decision is made
- ✅ A research study informs the system design
- ✅ An architecture or license decision is made
- ✅ An experiment is run
- ✅ A failure occurs
- ✅ A performance boundary is discovered
- ✅ A trade-off is analysed
- ✅ A design space is explored

Templates in `.kbriefs/templates/`.

## Agent K-Brief Workflow

### Before making decisions
```bash
# Search for relevant K-Briefs
grep -r "tags:.*vdot" .kbriefs/
grep -r "tags:.*license" .kbriefs/
```

### After learning
```bash
# Create K-Brief
cp .kbriefs/templates/standard.md .kbriefs/KB-YYYY-NNN-short-title.md
# fill in content, commit alongside the code change
```

---

# 1. Project Purpose

OpenRun is:
- A **coaching engine** (`packages/core`) implementing VDOT, training zones, periodization,
  HRV-based load management, and race-specific preparation
- A **component library** (`packages/ui`) for displaying coaching data
- A **set of integration connectors** (`packages/integrations`) for Strava, Garmin, WHOOP, Oura
- A **watch engine** (`packages/nano`) for Garmin Connect IQ and Apple Watch
- A **web app** (`apps/web`) and **mobile app** (`apps/mobile`) as reference implementations
- A **research database** (`data/research`) and **race database** (`data/races`)

The project prioritises:
- Research-first: every algorithm cites a peer-reviewed source
- Transparency: the coaching logic is readable and auditable
- Accessibility: works for any runner with a race result, no special hardware required
- Community: data quality is a shared responsibility

---

# 2. Architectural Principles

## Research before code

No coaching algorithm enters `packages/core` without a corresponding entry in `data/research/`
that cites the primary source and explains the `coaching_applications`.

See KB-2026-002 for the full standard.

## VDOT is the foundation

The coaching engine is anchored to VDOT (Daniels & Gilbert, 1979).
All training zones, race predictions, and pace targets derive from VDOT.
Heart rate is a secondary signal for daily readiness; it does not override VDOT zones.

See KB-2026-003 for the design space analysis.

## Follow Gall's Law

Start with the **simplest working system** and evolve.

Phase 1: VDOT calculation from a race result → five training zones → pace table.
Do not build ML features, power-based features, or multi-variable models until Phase 1 is
validated with real runners.

## Multi-license model is fixed

The license for each package is documented in KB-2026-001 and in NOTICE.
**Do not change `packages/core` away from AGPL v3 without a governance decision.**
Any new package must have its license explicitly decided before the first commit.

## Container-first for coaching engine work

`packages/core` is Python. All development, testing, and validation must run inside a
container to ensure reproducibility. Do not rely on host Python installations.

The polyglot-devcontainers Python+Node image is the target execution environment:
`ghcr.io/senanayake/polyglot-devcontainers-python-node:main`

For aider-relay-driven development runs, specify this image with `--image`.

---

# 3. Task Runner Contract

All development tasks run through pnpm scripts or dedicated tooling inside the container.

## JavaScript/TypeScript packages

```bash
pnpm install      # install all dependencies
pnpm build        # build all packages (Turborepo)
pnpm lint         # ESLint across all packages
pnpm typecheck    # TypeScript typecheck across all packages
pnpm test         # run all JS/TS tests
pnpm dev          # start all apps in watch mode
```

## Python (packages/core)

```bash
cd packages/core
uv pip install -e ".[dev]"
ruff check .          # lint
mypy .                # typecheck
pytest                # test
```

Agents must not declare a task complete if `pnpm lint`, `pnpm typecheck`, or `pytest` fail.

---

# 4. Code Quality Standards

## TypeScript

- All new files must pass `pnpm typecheck` with zero errors
- ESLint rules from `.eslintrc.base.json` — `no-explicit-any` is a warning, `no-unused-vars` is an error
- Prettier formatting enforced — run `pnpm lint` before committing

## Python

- `ruff` for linting (replaces flake8/isort/black)
- `mypy --strict` for type checking
- `pytest` for tests — every public function in the coaching engine needs a test
- No `type: ignore` without a comment explaining why

## Data schemas

- Every new race or research entry must validate against the relevant schema before committing:
  ```bash
  npx ajv validate -s data/races/schema.json -d data/races/my-race.json
  npx ajv validate -s data/research/schema.json -d data/research/my-study.json
  ```

---

# 5. Branching and Commit Strategy

- `main` is always stable
- Feature branches: `feature/short-description`
- Bug fixes: `fix/short-description`
- Data additions: `data/race-name` or `data/study-author-year`
- K-Briefs only: `docs/kb-NNN-title`
- Never commit directly to `main`

Commit format: Conventional Commits

```
feat(core): implement VDOT table lookup from race performance
fix(ui): correct zone 4 colour in pace chart
data: add Twin Cities Marathon race entry
docs: KB-2026-004 VDOT accuracy bounds for new runners
```

---

# 6. What Agents Must Avoid

Agents must NOT:
- Implement coaching algorithms without a research citation in `data/research/`
- Add ML-based features before Phase 1 (VDOT + zones) is validated
- Change the license of any package without creating a K-Brief and human review
- Commit `.env` files with real secrets — only `.env.example`
- Add large architectural layers prematurely
- Skip schema validation when adding race or research data
- Use `any` types in TypeScript without a documented reason

---

# 7. Repository Layout

```
openrun/
├── packages/
│   ├── core/          Python coaching engine (AGPL v3)
│   ├── ui/            React component library (MIT)
│   ├── integrations/  Third-party connectors (Apache 2.0)
│   └── nano/          Watch engine (AGPL v3)
├── apps/
│   ├── web/           Next.js 15 dashboard (AGPL v3)
│   └── mobile/        React Native + Expo (AGPL v3)
├── data/
│   ├── research/      Peer-reviewed studies (CC BY 4.0)
│   └── races/         Community race database (ODbL 1.0)
├── docs/
│   └── licenses/      License texts + plain-English guide
├── .kbriefs/          Knowledge Brief artifacts (KBPD)
│   └── templates/     K-Brief templates by type
├── .github/           Issue templates, PR template, CI workflow
├── AGENTS.md          This file
├── CLAUDE.md          Claude Code project instructions
└── CONTRIBUTING.md    Contributor guide
```

---

# 8. Agent Workflow Loop

1. Search `.kbriefs/` for relevant prior learning
2. Check `data/research/` for supporting science
3. Create a K-Brief draft if a knowledge gap exists
4. Implement the change
5. Run `pnpm lint && pnpm typecheck && pnpm test` (JS) or `ruff check . && mypy . && pytest` (Python)
6. Validate any new data files against schemas
7. Finalise the K-Brief and commit it alongside the code

A task is not complete until lint, typecheck, and tests pass.

---

End of AGENTS.md
