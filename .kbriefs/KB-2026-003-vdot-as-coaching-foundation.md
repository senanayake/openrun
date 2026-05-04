---
id: KB-2026-003
type: design-space
status: validated
created: 2026-05-03
updated: 2026-05-03
tags: [coaching, vdot, algorithm-design, architecture, jack-daniels, training-zones]
related: [KB-2026-002]
---

# Coaching algorithm foundation: VDOT vs power-based vs ML vs heart rate only

## Context

`packages/core` needs a single unifying metric from which training zones, pace targets,
race predictions, and periodization decisions are derived. The choice of that foundation
metric shapes every algorithm downstream and is expensive to change later.

## Problem Statement

What single metric should anchor the OpenRun coaching engine?

Options range from well-established physiological formulas (VDOT, lactate threshold) to
device-dependent measurements (power, GPS pace) to data-hungry ML approaches.

## Design Space Dimensions

- **Scientific validation** — how well-studied is the method across runner populations?
- **Data accessibility** — what does a runner need to use it? (a race result? a lab test? a power meter?)
- **Implementation complexity** — how hard is it to implement correctly?
- **Accuracy** — how well does it predict performance and prescribe training?
- **Explainability** — can the runner understand why they got this recommendation?

## Options in the Space

### Option A: VDOT (Jack Daniels / Gilbert, 1979)

VDOT is a pseudo-VO2max value derived from a recent race performance using Daniels & Gilbert's
performance tables. All training paces are set as percentages of VDOT-derived VO2max.

**Characteristics:**
- Strengths: 45+ years of validation; simple input (one race result); produces all five training
  zones; race prediction across distances from the same VDOT; no device required; transparent
  formula; widely used by coaches globally
- Weaknesses: requires a recent race effort; assumes runner ran near maximal effort; less accurate
  at extremes (very new runners, world-class elites); based on tables from the 1970s-80s
- Data required: recent race time + distance

### Option B: Lactate threshold testing

Zones set from blood lactate measurements at VT1 and VT2 thresholds.

**Characteristics:**
- Strengths: most physiologically accurate; personalised to the individual
- Weaknesses: requires lab or field test; expensive; inaccessible to most recreational runners;
  results change frequently; cannot be self-administered
- Data required: lab test or expensive field test protocol

### Option C: Power-based (Stryd)

Training zones anchored to Critical Power (CP) from a power meter.

**Characteristics:**
- Strengths: weather/terrain independent; well-validated for cycling (less so for running)
- Weaknesses: requires Stryd pod ($200+); proprietary CP algorithm; alienates majority of runners
  who don't own power meters; less research depth than VDOT
- Data required: Stryd pod; CP test

### Option D: Heart rate only (Maffetone, 180-formula)

Max aerobic function zone set at 180 minus age.

**Characteristics:**
- Strengths: no equipment needed; simple
- Weaknesses: age-based formula has poor individual accuracy; ignores fitness level entirely;
  limited evidence for the 180 formula specifically; not suitable for speed work prescription
- Data required: heart rate monitor

### Option E: ML-based (Garmin, Strava fitness model)

Train a model on historical activity data to predict training load, form, and race readiness.

**Characteristics:**
- Strengths: can incorporate many signals; personalises over time
- Weaknesses: requires large data history; black box; no transparency; requires ongoing compute;
  significant implementation complexity; undermines the "transparent algorithms" principle
- Data required: extensive activity history; wearable data

## Design Space Map

| Option | Scientific validation | Accessibility | Complexity | Explainability | Viable for MVP? |
|--------|----------------------|---------------|------------|----------------|----------------|
| VDOT | Very high | Very high | Low | Very high | Yes |
| Lactate | Highest | Very low | Medium | High | No (barrier) |
| Power | Medium | Low | Medium | Medium | No (hardware req) |
| HR-only | Low | High | Very low | High | Partial |
| ML | Medium | Medium | Very high | Very low | No (data req) |

## Decision

**VDOT is the foundation metric for `packages/core`.**

VDOT dominates the design space for an accessible, open-source platform:
- Maximum accessibility (any runner who has raced can use it immediately)
- Strongest scientific pedigree of the accessible options
- Full transparency (the formula is published; we can implement it openly)
- Enables all downstream algorithms (zones, race prediction, periodization) from one input

Heart rate monitoring is used as a secondary signal for daily readiness and load management
(HRV-based), but the primary training zone anchor is VDOT.

## Implications

- `packages/core` must implement Daniels' VDOT tables faithfully from the primary source
- Race prediction uses the VDOT equivalence tables (a 3:45 marathon = VDOT 47 = 1:47 half)
- The five training zones map to VDOT-derived pace ranges: Easy, Marathon, Threshold, Interval, Rep
- HRV is layered on top as a daily modifier (not a zone-setter)
- Power and ML-based features may be added later as optional enhancements, not replacements

## Recommendations

1. Implement VDOT table lookup first — this is the critical path for all other algorithms
2. Create a `data/research/` entry for Daniels & Gilbert (1979) before writing any code
3. Add a source-profile K-Brief for the VDOT tables as a reference source
4. Do not add ML or power features until VDOT-based coaching is validated with real runners

## Related Knowledge

- KB-2026-002: Research-first algorithm design standard
- data/research/ — research citations backing VDOT and training zone science
- packages/core/README.md — coaching engine overview
