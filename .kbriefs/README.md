# Knowledge Briefs (K-Briefs)

This directory contains structured knowledge artifacts generated during OpenRun development.

## What is a K-Brief?

A K-Brief is a **reusable record of learning** that captures:
- What we learned
- Why it matters
- Where it applies
- What evidence supports it

K-Briefs are **first-class artifacts**, not optional documentation.
Every algorithm in `packages/core` should trace back to at least one K-Brief.

## When to create a K-Brief

Create a K-Brief when:
- ✅ A coaching algorithm decision is made
- ✅ A research study informs the system design
- ✅ An architecture or license decision is made
- ✅ An experiment is run (A/B test, benchmark, prototype)
- ✅ A failure occurs (build, data quality, coaching accuracy)
- ✅ A performance boundary is discovered
- ✅ A trade-off is analysed
- ✅ A design space is explored

## K-Brief types

### 1. Standard / best practice
Captures proven solutions and patterns.
**Template:** `templates/standard.md`
**Example:** Research-first algorithm design principle

### 2. Trade-off
Captures relationships between competing variables.
**Template:** `templates/tradeoff.md`
**Example:** AGPL vs MIT for the coaching engine

### 3. Limit / boundary
Defines where something breaks or stops working.
**Template:** `templates/limit.md`
**Example:** VDOT accuracy bounds for untrained runners

### 4. Design space
Maps the range of possible solutions.
**Template:** `templates/design-space.md`
**Example:** Coaching algorithm approaches (VDOT vs power-based vs ML)

### 5. Failure mode
Documents how systems fail and how to prevent it.
**Template:** `templates/failure-mode.md`
**Example:** Data quality failure when race schema fields are missing

### 6. Source profile
Documents a key external source (library, dataset, paper, API).
**Template:** `templates/source-profile.md`
**Example:** Jack Daniels' VDOT tables as a reference source

## K-Brief structure

All K-Briefs follow this structure:

```yaml
---
id: KB-YYYY-NNN
type: [standard|tradeoff|limit|design-space|failure-mode|source-profile]
status: [draft|validated|deprecated]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []       # e.g. vdot, hrv, license, architecture, data-quality
related: []    # other KB IDs
---
```

## Numbering

K-Briefs are numbered sequentially within the year: `KB-2026-001`, `KB-2026-002`, etc.
If two K-Briefs are opened on the same day, assign the next available number.

## Querying

```bash
# Find all coaching-algorithm standards
grep -l "type: standard" .kbriefs/*.md | xargs grep -l "tags:.*coaching"

# Find all trade-offs involving licensing
grep -l "type: tradeoff" .kbriefs/*.md | xargs grep -l "tags:.*license"

# Find related briefs
grep -l "related:.*KB-2026-001" .kbriefs/*.md
```

## Integration with development

Before implementing any coaching algorithm:
1. Search for relevant K-Briefs (`grep -r "tags:.*vdot" .kbriefs/`)
2. Check `data/research/` for supporting studies
3. If no K-Brief exists, create a draft before writing code

## K-Brief vs other artifacts

| Artifact | Purpose | Lifespan |
|---|---|---|
| K-Brief | Reusable knowledge record | Long-term |
| ADR | Single architecture decision | Permanent |
| Issue | Track work item | Short-term |
| data/research entry | Cite a study | Permanent |
| ROADMAP | Plan future work | Living |

> "The highest-performing teams don't just build products faster — they learn faster and encode that learning into the system."
> — Allen C. Ward, Knowledge-Based Product Development
