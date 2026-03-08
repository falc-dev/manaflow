# ADR 0001: Replay Schema v2 Roadmap

- Status: Proposed
- Date: 2026-03-08

## Context

`schemaVersion: 1` is stable and broadly used. It works for deterministic playback, but we currently have:

- Generic runtime action validation by default.
- No first-class typed action contract in the replay payload itself.
- Profile conventions (`rulesProfile`) that are useful but mostly optional.

We need a clear path to improve DX and UX without breaking existing replays.

## Decision

Keep `schemaVersion: 1` as fully supported and define a forward-compatible migration path to `schemaVersion: 2`.

`schemaVersion: 2` should focus on:

1. Stronger action typing:
- Known action `type` values must match typed payload contracts.
- Custom actions remain possible through explicit fallback shape.

2. Profile-first replay metadata:
- `initialState.metadata.rulesProfile` becomes required.
- Profile validation becomes deterministic and discoverable.

3. Better event UX metadata:
- Standard optional event metadata fields for UI (`phase`, `intent`, `summary`).
- Keep domain-specific metadata open under `event.metadata`.

## Migration strategy

1. Maintain v1 loaders and validators unchanged by default.
2. Ship strict payload validation as opt-in for v1 (`strictActionPayloads`).
3. Add `toSchemaV2()` conversion helpers for v1 payloads.
4. Introduce v2 loaders/validators in parallel APIs.
5. Deprecate v1 only after at least one stable release cycle with migration tooling.

## Consequences

- Existing consumer integrations continue to work with v1.
- New projects can adopt stricter validation and profile-aware authoring progressively.
- Tooling can provide better autocomplete, timeline labeling, and validation error quality.
