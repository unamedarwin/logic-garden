# Project rules

## Product

This is an offline-first logic puzzle PWA with child, teen, and adult profile modes.

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
Keep a visible, keyboard-accessible path from a game and its completion dialog back to the
difficulty picker before a player starts another adventure.

## Visual design

Treat the child mode as an illustrated field guide, not a collection of interchangeable cards.
Keep the map visually dominant, make the current action easy to scan, and preserve the warm
paper, garden, and hand-drawn-ink direction across responsive layouts. Teen and adult profiles
must have visibly distinct themes while preserving the same safe, local, accessible game
mechanics. Use PixiJS only as a decorative grid renderer; keep semantic DOM controls as the
interaction and accessibility layer.
On small screens, keep the map, character picker, and the selected person's contextual clues in
one compact workspace. Use a horizontally scrollable people rail rather than forcing navigation
between a person, their clues, and the map location where they are placed. Keep the complete clue
list available as an accessible collapsed support panel.

Teen and adult modes share the same deduction rules, board dimensions, and irregular spatial
plan geometry. Their visual themes and safe content may differ, but neither mode may fall back to
coordinate-heavy distance, step, or row/column clue wording. The game counter and solved-history
records are local-only; history may retain shareable seed metadata and completion statistics, but
never a solution or profile data.

Spatial boards use the local `spatialPlan` catalog. A plan can define only geometry, decorative
anchors, and visible blocked cells. The seeded generator must choose the plan, people, item
emojis, and wording independently; no plan may encode a character, item assignment, phrase,
solution, or player data. Every blocked cell must be rejected by the generator, solver, reducer,
and accessible DOM controls, not merely painted as scenery.
Every floor-plan variant must form one complete partition: rooms touch along shared walls, cover
the full interior without gaps or overlaps, and contain only horizontal or vertical edges. Keep
the catalog geometry and obstacle emojis under automated regression tests.
Every spatial position must inherit its `placeId` from the room polygon that contains its center.
Anchor solutions must sit beside a visible obstacle so exact localized clues can use room,
obstacle, and direction wording without exposing routes, rows, columns, steps, or distances.

Profile names and avatars are local-only. Shared URLs may contain a version, audience,
difficulty, and seeded puzzle identifier, but never a solution or any profile data.

## Delivery

GitHub Pages serves this app below `/logic-garden/`. Keep Vite's base path, the PWA manifest
scope, internal navigation, and shared URLs aligned with that path. Share payloads are URL-safe
Base64 under the `p` query parameter and must be validated before use. Deploy only the compiled
`dist` directory with `.github/workflows/deploy-pages.yml`; never publish source files as the
site artifact.

## Verification

After meaningful changes, run formatting, lint, type checking, unit tests, and the
production build. A task is not complete while any check fails.
