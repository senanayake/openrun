# Contributing to OpenRun

Welcome — and thank you. OpenRun is built by runners, developers, sport scientists, and coaches. You don't need to be all four.

## Ways to contribute

- **Code** — coaching algorithms, UI components, integrations, watch apps
- **Research** — add peer-reviewed studies to `data/research/` that back the coaching decisions
- **Race data** — add or improve entries in `data/races/`
- **Bug reports** — something broken? File an issue
- **Coaching feedback** — you're a coach or exercise scientist? Your domain knowledge shapes the algorithms

## Development setup

### Prerequisites

- Node 20 or later
- pnpm 9 or later (`npm install -g pnpm`)
- Python 3.12 or later (for `packages/core`)
- Docker (optional — needed only for the full self-hosted stack)

### Clone and install

```bash
git clone https://github.com/senanayake/openrun.git
cd openrun
pnpm install
```

### Run the development servers

```bash
pnpm dev
```

This starts all apps in watch mode via Turborepo. The web app runs at `http://localhost:3000`.

### Full self-hosted stack

```bash
cp .env.example .env
# edit .env with your values
docker compose up
```

## Branching strategy

- `main` is always stable and deployable
- Create feature branches as `feature/short-description`
- Bug fixes: `fix/short-description`
- Documentation only: `docs/short-description`

Never commit directly to `main`.

## Commit message format

We use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add VDOT pace table component
fix: correct zone 4 boundary calculation for heart rate
docs: add Twin Cities Marathon race entry
chore: upgrade Turbo to 2.1
```

The type must be one of: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`.

## Pull request checklist

Before opening a PR:

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] Tests added or updated for code changes
- [ ] Documentation updated if behaviour changed
- [ ] For data contributions: entry validates against the schema

## Contributor License Agreement

By submitting a pull request, you confirm that:

1. You wrote the contribution yourself, or have the right to submit it.
2. You grant OpenRun the right to use your contribution under the open-source license that applies to the file you are contributing to.
3. If OpenRun ever issues a commercial license, your contribution may be included under that license as well.
4. You keep copyright of your work.

This is a lightweight CLA. Full CLA text: _(link to be added once drafted)_

## Adding a race to the database

1. Create a JSON file in `data/races/` following `data/races/schema.json`
2. Use `data/races/examples/twin-cities-2026.json` as a reference
3. Validate: `npx ajv validate -s data/races/schema.json -d your-race.json`
4. Submit a PR — a reviewer familiar with the course will check the data

## Adding a research citation

1. Create a JSON file in `data/research/` following `data/research/schema.json`
2. Include at least one `coaching_applications` entry explaining how this informs the coaching engine
3. Validate: `npx ajv validate -s data/research/schema.json -d your-study.json`
4. Submit a PR

## Code style

ESLint and Prettier are configured at the root. Run before pushing:

```bash
pnpm lint
```

For Python (`packages/core`), we use `ruff` for linting and `mypy` for type checking:

```bash
cd packages/core
uv pip install -e ".[dev]"
ruff check .
mypy .
```
