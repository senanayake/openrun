---
id: KB-2026-001
type: tradeoff
status: validated
created: 2026-05-03
updated: 2026-05-03
tags: [license, architecture, commercial, agpl, mit, apache, open-source]
related: []
---

# Multi-license architecture: AGPL core + MIT UI + Apache connectors + CC data

## Context

OpenRun is an open-source running coaching platform that also wants to sustain itself through
commercial licensing. The license choices made at founding determine who can use what, whether
commercial contributors can build on it, and whether the coaching algorithms stay open. Getting
this wrong at the start is expensive to fix.

## Variables

- **Viral strength** — how strongly the license requires downstream code to stay open
- **Adoption friction** — how much the license discourages commercial users from touching the code
- **Commercial sustainability** — whether the dual-license model is viable
- **Data openness** — whether the databases stay open even when used commercially

## Options Considered

### Option A: Single AGPL for everything
- Maximum viral protection; any derivative service must open its source
- Blocks UI component adoption entirely (no commercial app will use AGPL UI components)
- Kills integration connector adoption (enterprises can't embed AGPL connectors)

### Option B: Single MIT for everything
- Maximum adoption; zero friction
- No protection for the coaching algorithms — a company could take the engine, improve it, and
  close it permanently
- Undermines the dual-license commercial model

### Option C: Multi-license by component (chosen)
- AGPL v3 for the coaching engine and apps
- MIT for the UI component library
- Apache 2.0 for the integration connectors
- CC BY 4.0 for research data
- ODbL 1.0 for the race database

## Trade-Off Analysis

| Component | License | Viral strength | Adoption friction | Rationale |
|---|---|---|---|---|
| packages/core | AGPL v3 | High | High for commercial | Algorithms must stay open |
| packages/nano | AGPL v3 | High | High for commercial | Same as core |
| apps/web, mobile | AGPL v3 | High | N/A (end-user apps) | Running as a service triggers share-back |
| packages/ui | MIT | None | None | Components need max adoption |
| packages/integrations | Apache 2.0 | Low | Very low | Patent grant needed; embed in commercial apps |
| data/research | CC BY 4.0 | Attribution only | Very low | Scientific data should flow freely |
| data/races | ODbL 1.0 | Database-level | Very low | Derived databases must stay open |

## Rationale

The multi-license model is standard practice for dual-license commercial open source
(GitLab, Elasticsearch, MongoDB all use variants of this pattern).

The key insight: the thing with commercial value is the coaching engine (core + nano).
Everything that helps the engine get adopted (UI components, connectors, data) should
have the lowest possible friction. The engine itself carries the copyleft protection that
makes the dual-license commercial offering viable.

## Implications

- Companies wanting to embed `packages/core` in a closed product must purchase a commercial license
- The commercial license enquiry process should be visible in README and NOTICE
- Contributors are informed via CONTRIBUTING.md that their contributions may be used under
  the commercial license (CLA-lite arrangement)
- The UI component library (`packages/ui`) being MIT means it can be a standalone widely-adopted
  open-source project in its own right

## Recommendations

- Never change `packages/core` away from AGPL without a formal governance decision
- Any new package must have its license explicitly decided before the first commit
- The NOTICE file must be kept current as new packages are added

## Related Knowledge

- docs/licenses/PLAIN-ENGLISH.md — plain-English explanation of each license
- NOTICE — per-package license summary
- CONTRIBUTING.md — CLA-lite section
