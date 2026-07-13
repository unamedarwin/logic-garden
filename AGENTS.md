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
Advanced games are selected from the generated structural template catalog. Templates may store
only audience, difficulty, grid size, plan id, generic clue tuples, and difficulty metrics; they
must never store an answer, profile data, names, localized phrases, or concrete theme objects.
Keep all 1,000 catalog entries structurally distinct, cover both advanced audiences and every
difficulty/size combination, and rerun the solver with a limit of two after every runtime theme application.
Canonical structural identity must ignore clue-list ordering, and catalog checks must reject
order-only duplicates. Choose advanced grid size uniformly before choosing a template from that
size so uneven bucket counts cannot couple board size back to difficulty.
Board size and difficulty are independent. Grade advanced difficulty through the number of
candidate cells around visible landmarks and the deduction chain, not by assigning one grid size
to each difficulty.

## TypeScript

Use strict TypeScript. Do not use `any`. Prefer discriminated unions, pure functions,
immutable transformations, and exhaustive checks.

## Localisation

Keep all player-facing wording in local template dictionaries. Sentences must be short,
simple, and derived from structured clues so they can be reused in Catalan, Spanish, and
English without changing puzzle logic. Run the multilingual spell checker after wording
changes and add only intentional domain terms to its project dictionary.
Reducer, validation, and solver feedback must remain structured data and be localized only by the
interface; never persist a rendered feedback sentence in game state.

## Accessibility

Drag-and-drop must always have a click/tap and keyboard alternative. Do not encode
information using color alone. Respect reduced-motion preferences.
Keep spatial boards fitted to the available viewport by default. Board panning is allowed only
after the player explicitly zooms in, and returning to fit mode must remove both scroll axes.
Dragging an already placed character must ignore its former cell's row/column constraints, retain
an anchored source, and show an exact in-cell destination preview before drop. Pointer collision
must resolve from the pointer position so the highlighted cell always matches the final cell.
Prevent accidental interface-text selection during board interaction, while preserving normal
selection and editing in input, textarea, and editable controls.
Keep a visible, keyboard-accessible path from a game and its completion dialog back to the
difficulty picker before a player starts another adventure.

## Visual design

Treat the child mode as an illustrated field guide, not a collection of interchangeable cards.
Keep the map visually dominant, make the current action easy to scan, and preserve the warm
paper, garden, and hand-drawn-ink direction across responsive layouts. Teen and adult profiles
must have visibly distinct themes while preserving the same safe, local, accessible game
mechanics. Use PixiJS only as a decorative grid renderer; keep semantic DOM controls as the
interaction and accessibility layer.
Scale room labels, textures, objects, placed avatars, and crossed cells from the actual grid
dimension rather than viewport units. Character/avatar emoji catalogs and object/obstacle emoji
catalogs must remain disjoint, with an automated invariant test covering every theme.
Render current scene emoji through the locally bundled Fluent Emoji Flat SVG subset; never load
scene art from a CDN or runtime API. Follow `docs/visual-asset-policy.md` for replacements: use
current official Kenney packs first, Game-icons.net only with per-author CC BY 3.0 credits, and
itch.io only for individually licensed pixel-art packs. Keep every imported file local, record its
source and license, and migrate a reviewed semantic category as a coherent set rather than mixing
styles ad hoc. Carried clue items and fixed room objects must also use disjoint
icons within a theme. Room-object catalogs are curated scene content, not arbitrary random emoji,
and advanced rooms must prioritize their place-specific subset. A deterministic same-theme fallback
is allowed only when a globally unique object matching cannot otherwise be completed; at least 70%
of fixed objects must remain place-specific, and pond objects never use the fallback.
Advanced room floors use local square seamless SVG materials plus a seeded decorative motif layer.
Decorate an exact seeded 25-75% of each room's unblocked cells, keep every motif behind interaction
and clue artwork, and reproduce the same material composition from the same puzzle seed. Keep the
same pattern phase across adjacent cells. Water is never an entire playable room: garden ponds are
contiguous blocked patches of 1, 2, or 4 cells on 6x6, 9x9, or 16x16 boards, while the surrounding
room remains traversable. Water obstacles must use the curated pond-object catalog. Regenerate and
review every fixed PNG under `docs/terrain-samples/` after changing textures, motifs, density,
palette, scale, or opacity.
The contiguous 1/2/4 blocked cluster belongs to spatial-plan geometry for every advanced theme;
only the city-garden visual treatment turns it into water. Theme selection must never change which
cells a structural template considers blocked.
Render one continuous stone rim only along water-to-land pond edges. Never draw a rim between two
orthogonally adjacent water cells. Pond perimeter tests must derive the expected edge count from
the actual generated cluster and cover non-rectangular shapes rather than assuming a 2x2 patch.
On small screens, keep the map, character picker, and the selected person's contextual clues in
one compact workspace. Use a horizontally scrollable people rail rather than forcing navigation
between a person, their clues, and the map location where they are placed. Keep the complete clue
list available as an accessible collapsed support panel. Do not spend header space announcing a
normal online state; show connectivity status only when the app is offline.

Teen and adult modes share the same deduction rules, board dimensions, and irregular spatial
plan geometry. Their visual themes and safe content may differ, but neither mode may fall back to
coordinate-heavy distance, step, or row/column clue wording. Spatial clue copy must pair its
precise logical fact with a short positive social action or motivation in every supported
language; do not reduce advanced clues to bare coordinates. The game counter and solved-history
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
difficulty, seeded puzzle identifier, and a bounded completion-time benchmark, but never a
solution or any profile data. A received challenge must explain the benchmark before play and
offer a return challenge after completion. Start its timer only after the player accepts the
challenge, and persist the benchmark with an in-progress game. Store theme identifiers rather
than localized titles in new history records so history follows the active language.

## Delivery

GitHub Pages serves this app below `/logic-garden/`. Keep Vite's base path, the PWA manifest
scope, internal navigation, and shared URLs aligned with that path. Share payloads are URL-safe
Base64 under the `p` query parameter and must be validated before use. Deploy only the compiled
`dist` directory with `.github/workflows/deploy-pages.yml`; never publish source files as the
site artifact.

## Verification

After meaningful changes, run formatting, lint, type checking, unit tests, and the
production build. A task is not complete while any check fails.
After changes to boards, icons, labels, clues, or responsive layout, visually inspect teen and
adult games at a 390x844 mobile viewport for 6x6, 9x9, and 16x16 boards. Check both an empty board
and a board with a placed character where relevant. Reject clipped or overlapping labels,
misaligned cells, repeated or semantically wrong icons, unreadable clues, unexpected scroll in fit
mode, broken zoom/pan restoration, and touch targets obscured by artwork before publishing.
