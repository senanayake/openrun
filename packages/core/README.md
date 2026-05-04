# @openrun/core

> Licensed under AGPL v3. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

The OpenRun coaching engine. Pure Python implementation of:

- **VDOT calculation** — Jack Daniels' running formula for predicting equivalent performances and setting training paces
- **Training zones** — heart rate and pace zones derived from VDOT or lactate threshold tests
- **Periodization** — base, build, peak, and taper phase planning with progressive overload logic
- **HRV-based load management** — daily training readiness score from heart rate variability trends
- **Race prediction** — finish time estimates across distances from the same VDOT baseline
- **Recovery modelling** — acute:chronic workload ratio tracking to flag injury risk

This package has no runtime dependencies outside the Python standard library. The coaching algorithms are the core of OpenRun and must remain open under AGPL.

## Install

```bash
pip install openrun-core
# or with uv:
uv add openrun-core
```

## Development

```bash
uv pip install -e ".[dev]"
pytest
```
