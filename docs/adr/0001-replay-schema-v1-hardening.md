# ADR 0001: Harden Replay Schema v1

- Status: Accepted
- Date: 2026-03-08

## Context

`schemaVersion: 1` is stable and currently not consumed by external projects. We can still harden it now without introducing a new schema version.

We want stronger guarantees and better DX immediately.

## Decision

Keep `schemaVersion: 1` and apply the stricter contract directly in v1.

1. Stronger action typing in v1:
- Known action `type` values must match typed payload contracts.
- Custom actions remain possible through explicit fallback shape.

2. Profile-first metadata conventions:
- `initialState.metadata.rulesProfile` becomes required.
- Profile validation becomes deterministic and discoverable.

3. Better event UX metadata:
- Standard optional event metadata fields for UI (`phase`, `intent`, `summary`).
- Keep domain-specific metadata open under `event.metadata`.

## Rollout strategy

1. Make strict payload validation the default in v1.
2. Keep an escape hatch (`strictActionPayloads: false`) for temporary compatibility.
3. Document canonical action payloads and profile conventions in v1 docs.
4. Remove the compatibility flag once all in-repo payloads are migrated.

## Consequences

- No schema version split is introduced.
- Validation errors become earlier and clearer for malformed known actions.
- Tooling keeps a single contract (`schemaVersion: 1`) with better autocomplete and consistency.
