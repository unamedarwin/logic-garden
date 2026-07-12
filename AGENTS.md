# Project rules

## Product

This is an offline-first children's logic puzzle PWA.

The game must never include murder, death, weapons, violence, threats, punishment,
frightening content, advertising, tracking, personal-data collection, or remote generated
content.

## Architecture

Keep UI, puzzle generation, constraint solving, persistence, and PWA infrastructure
separated. The solver and generator must remain framework-independent.

Never expose or trust a stored answer as proof of puzzle uniqueness. Always verify
uniqueness by running the solver with a limit of two solutions.

## Random generation

All game randomness must use the seeded PRNG. The same generator version, difficulty,
and seed must produce the same puzzle. Never publish or display a generated puzzle unless
the solver confirms that it has exactly one solution.

## TypeScript

Use strict TypeScript. Do not use `any`. Prefer discriminated unions, pure functions,
immutable transformations, and exhaustive checks.

## Localisation

Keep all player-facing wording in local template dictionaries. Sentences must be short,
simple, and derived from structured clues so they can be reused in Catalan, Spanish, and
English without changing puzzle logic. Run the multilingual spell checker after wording
changes and add only intentional domain terms to its project dictionary.

## Accessibility

Drag-and-drop must always have a click/tap and keyboard alternative. Do not encode
information using color alone. Respect reduced-motion preferences.

## Visual design

Treat Logic Garden as an illustrated field guide, not a collection of interchangeable
cards. Keep the map visually dominant, make the current action easy to scan, and preserve
the warm paper, garden, and hand-drawn-ink direction across responsive layouts.

## Delivery

GitHub Pages serves this app below `/logic-garden/`. Keep Vite's base path, the PWA manifest
scope, internal navigation, and shared URLs aligned with that path. Deploy only the compiled
`dist` directory with `.github/workflows/deploy-pages.yml`; never publish source files as the
site artifact.

## Verification

After meaningful changes, run formatting, lint, type checking, unit tests, and the
production build. A task is not complete while any check fails.
