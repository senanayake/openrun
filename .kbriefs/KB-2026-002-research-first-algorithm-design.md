---
id: KB-2026-002
type: standard
status: validated
created: 2026-05-03
updated: 2026-05-03
tags: [architecture, coaching, research, algorithm-design, vdot, evidence-based]
related: [KB-2026-003]
---

# Research-first algorithm design: every coaching decision cites a study

## Context

OpenRun's entire value proposition rests on being different from black-box coaching platforms.
The credibility of that claim depends on being able to show that every algorithm traces back to
peer-reviewed evidence. This is not just a documentation requirement — it is a design constraint
that shapes how features are built.

## Problem/Need

Without a research-first discipline:
- Algorithms accumulate undocumented assumptions ("that's just how VDOT works")
- Features get built because they seem reasonable, not because they are validated
- The project loses its primary differentiator from Garmin, Strava, and TrainingPeaks
- Coaching recommendations become untestable and unauditable

## Standard/Pattern

### Description

No algorithm enters `packages/core` without a corresponding entry in `data/research/` that:
1. Cites the primary source (paper, book chapter, study)
2. States the specific finding that informs the algorithm
3. Includes a `coaching_applications` field explaining how the finding maps to code

The research entry is written before the algorithm, not after.

### Key Principles

1. **Evidence precedes implementation** — if you cannot cite a study, you cannot ship the feature
2. **Cite the primary source** — do not cite a blog post that cites a paper; find the paper
3. **State the limitation** — if the study had a small sample or only studied elite runners,
   say so in the research entry and in the code comment
4. **Methodology quality matters** — meta-analyses and RCTs outrank expert consensus;
   record the quality tier in `methodology_quality`

### Implementation

Before writing a coaching algorithm:

```bash
# 1. Create the research entry
cp data/research/schema.json /tmp/my-study.json
# fill in all required fields

# 2. Validate it
npx ajv validate -s data/research/schema.json -d /tmp/my-study.json

# 3. Add it to data/research/
mv /tmp/my-study.json data/research/YYYY-author-keyword.json

# 4. Reference the study ID in the algorithm docstring
```

Python example:

```python
def calculate_vdot(race_time_minutes: float, distance_km: float) -> float:
    """
    Calculate VDOT from a recent race performance.

    Research basis: data/research/1979-daniels-vdot-tables.json
    (Daniels & Gilbert, 1979 — Oxygen Power: Performance Tables for Distance Runners)
    """
```

## Rationale

The research community has 50+ years of rigorous running science. The algorithms already exist;
OpenRun's job is to implement them faithfully, not to invent new ones. Starting from research
ensures we implement the right thing, not just a plausible thing.

## Anti-Patterns

- **Assumption drift** — implementing "how we think VDOT works" without checking the tables
- **Citation laundering** — citing a Garmin white paper that cites a study; find the study
- **Metric without provenance** — adding a "readiness score" without specifying what it measures
  or where the formula comes from
- **Sample size blindness** — citing a study of 8 elite Kenyan runners as evidence for recreational
  runner recommendations without flagging the limitation

## Verification

- Every function in `packages/core` that makes a coaching recommendation must reference a
  `data/research/` entry ID in its docstring
- Code review checklist includes: "is there a research citation for this algorithm?"
- The CI pipeline will eventually include a lint check that verifies the referenced entry exists

## Applicability

### Use This Standard When
- Adding any new coaching algorithm (zones, pace, load, recovery, race prediction)
- Changing an existing algorithm's formula or constants
- Adding a new metric that influences training recommendations

### Don't Use This Standard When
- Engineering decisions (infrastructure, API design, UI components)
- Data schema changes that don't affect the coaching logic

## Related Knowledge

- KB-2026-003: VDOT as the coaching engine foundation
- data/research/schema.json — the schema every citation must follow
- CONTRIBUTING.md — how to add a research citation
