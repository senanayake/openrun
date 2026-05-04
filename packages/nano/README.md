# @openrun/nano

> Licensed under AGPL v3. See [docs/licenses/PLAIN-ENGLISH.md](../../docs/licenses/PLAIN-ENGLISH.md) for what this means for you.

Stripped-down coaching engine for resource-constrained devices. Implements the same core algorithms as `packages/core` in environments where Python is unavailable:

- **`garmin/`** — Monkey C implementation for Garmin Connect IQ data fields (Forerunner, Fenix, Epix series)
- **`apple-watch/`** — SwiftUI + WorkoutKit implementation for Apple Watch complications and workout metrics

The watch engine delivers real-time pace zone guidance, effort warnings, and lap targets directly on the device face — no phone required during a run.

AGPL licensed for the same reason as `packages/core`: if you ship a product using this engine, those improvements belong to the community.
