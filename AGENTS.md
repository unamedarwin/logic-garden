# Project rules

## Product

This is an offline-first logic puzzle PWA with Children, Puzzles 2D, and Puzzles 3D collections.
The teen and adult audiences remain internal safe-content catalogs for the two advanced collections,
not player profiles.

The game must never include murder, death, weapons, violence, threats, punishment,
frightening content, advertising, tracking, personal-data collection, or remote generated
content.

## Architecture

Keep UI, puzzle generation, constraint solving, persistence, and PWA infrastructure
separated. The solver and generator must remain framework-independent.

Never expose or trust a stored answer as proof of puzzle uniqueness. Always verify
uniqueness by running the solver with a limit of two solutions.
Checking a completed board must evaluate the submitted assignment against the structured
constraints, not compare it with the first solution returned by the solver. If a progress count is
shown, compute the largest subset of current placements that can jointly extend to a solution; an
incompatible complete assignment must never report `total/total`.

## Random generation

All game randomness must use the seeded PRNG. The same generator version, difficulty,
collection-specific selected size, and seed must produce the same puzzle. Never publish or display a generated puzzle unless
the solver confirms that it has exactly one solution.
Convert an explicit adventure/theme choice into a final seed that reproduces the chosen theme
through the ordinary generator. Do not require a separate theme field in a shared URL and never
store an answer to preserve that choice.
Advanced games are selected from the generated structural template catalog. Templates may store
only audience, difficulty, grid size, plan id, generic clue tuples, and difficulty metrics; they
must never store an answer, personal data, names, localized phrases, or concrete theme objects.
Keep all 100 catalog entries structurally distinct, cover both advanced audiences and every
difficulty/size combination, and rerun the solver with a limit of two after every runtime theme application.
Canonical structural identity must ignore clue-list ordering, and catalog checks must reject
order-only duplicates. The player chooses advanced board size independently from deductive
difficulty, so every `6 x 6`, `9 x 9`, and `16 x 16` size must remain available at every
difficulty. Grade difficulty through the number of candidate cells around visible landmarks and
the deduction chain, not by assigning one grid size to each difficulty. Every `16 x 16` template
uses eight people so row and column crossing remains meaningful across the full board.
Keep child size independent from child difficulty too. At every 4/6/8 size, easy protects direct
friendly placement clues, medium protects fewer, and hard prioritizes relational deductions before
using direct placement clues.
Keep the structural catalog split at 84 spatial entries and 16 hard building entries covering
every height from `5 x 5 x 3` through `5 x 5 x 10`, with one building entry per internal audience
and height. Choose height uniformly before choosing a template so future uneven per-height quotas
cannot bias selection. The building subset must remain answer-free under the same canonical-identity rules.
Expose easy, medium, and hard play on every building height without duplicating structural
templates. Easy deterministically ensures that at least four people have direct home or landmark
guidance, medium ensures at least two, and hard uses the base clue set. Count existing direct facts
toward those targets instead of repeating them. Derive guidance only after solving the unique
materialized structure, persist clues rather than an answer, and rerun the solver with a limit of
two on the guided puzzle.

## TypeScript

Use strict TypeScript. Do not use `any`. Prefer discriminated unions, pure functions,
immutable transformations, and exhaustive checks.

## Localisation

Keep all player-facing wording in local template dictionaries. Sentences must be short,
simple, and derived from structured clues so they can be reused in every supported language
without changing puzzle logic. Run the multilingual checks after wording
changes and add only intentional domain terms to its project dictionary.
Reducer, validation, and solver feedback must remain structured data and be localized only by the
interface; never persist a rendered feedback sentence in game state.
Child clue copy must pair each precise fact with a short friendly action, object, or motivation in
all supported languages. Do not reduce child clues to bare placement commands.
After child clue reduction, every playable child must retain at least one contextual clue card that
references that child directly, through a relationship, or through their structured carried item.
Catalan clues must name a visible landmark directly; do not insert a repeated generic label such as
`referència` before every object token when the icon and object name already identify it.
Position and relationship clues in every locale must not mention a character's carried item merely
for decoration. Render an item token only when that item participates in the structured clue fact.

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
The collection, size, difficulty, and adventure journey path must show one setup decision at a
time and move backward and forward without
discarding the current puzzle, timer, challenge, or placements. Starting a new game is the only
path action that replaces a suspended game. Keep every journey, clue-navigation, and elevator
control at least `44 x 44` CSS pixels.
Adventure must remain a real fourth selection screen. Do not start a game merely by navigating to
the adventure step, and do not show the primary play action on the difficulty step.
Show check feedback in an accessible dialog. The solver-derived `N/total` correct-placement score
must be a local preference; when hidden, use encouraging guidance without revealing a count.

## Visual design

Treat the child mode as an illustrated field guide, not a collection of interchangeable cards.
Keep the map visually dominant, make the current action easy to scan, and preserve the warm
paper, garden, and hand-drawn-ink direction across responsive layouts. Teen and adult content
themes within the unified 2D and 3D collections must remain visibly distinct while preserving the
same safe, local, accessible game mechanics. Use PixiJS only as a decorative grid renderer; keep semantic DOM controls as the
interaction and accessibility layer.
Child playable characters must use the curated, non-repeating human child-avatar catalog. Animals
and objects may decorate a theme but must not become child character identities.
Children must use the same horizontally scrollable people and contextual-clue rail as 2D and 3D.
Selecting a child shows that child's related clue cards directly below the people row; the complete
clue list remains a collapsed support panel and must never be the only practical clue path.
Texture each child place as an individual illustrated room card using its theme-specific local
material. Do not project an advanced spatial polygon, crossed-axis grid, or room geometry onto the
child map merely to provide those textures.
Scale room labels, textures, objects, placed avatars, and crossed cells from the actual grid
dimension rather than viewport units. Character/avatar emoji catalogs and object/obstacle emoji
catalogs must remain disjoint, with an automated invariant test covering every theme.
Pixi artwork, floor textures, fixed objects, semantic cells, drop previews, and placed avatars must
share one interior board surface and coordinate origin. Project every normalized plan to the
current grid by tracing its actual per-cell room map; every wall vertex must land on a grid line
without changing any cell's logical `placeId`. Center fixed objects and avatars on the exact cell
center, and paint the valid drag-target overlay above floor artwork with uniform opacity.
Draw the active drag grid as one continuous top layer from the same row and column variables as
the semantic cells; never rely on separate cell borders that decorative layers can interrupt.
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
Clue sentences must retain icon placeholders as structured tokens. Render those tokens through the
same local `SceneIcon` SVG key used by the matching board object; never interpolate a system emoji
string into otherwise SVG-rendered scene copy.
Exact building clues must resolve their landmark from the blocked cell's stored object label and
icon. Never reuse the home or shop name as a missing-object fallback.
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
list available as an accessible collapsed support panel. The fixed action rail must not overlap
the people picker, contextual clue, complete clue panel, or feedback at 390x844, including after
selection advances to a person with longer copy. Reserve enough document space above the rail and
the mobile safe area for every lower block to scroll fully into view.
Do not spend header space announcing a
normal online state; show connectivity status only when the app is offline.

Teen and adult modes share the same deduction rules, board dimensions, and irregular spatial
plan geometry. Their visual themes and safe content may differ, but neither mode may fall back to
coordinate-heavy distance, step, or row/column clue wording. Spatial clue copy must pair its
precise logical fact with a short positive social action or motivation in every supported
language; do not reduce advanced clues to bare coordinates. The game counter and solved-history
records are local-only; history may retain shareable seed metadata and completion statistics, but
never a solution or personal data.

Spatial boards use the local `spatialPlan` catalog. A plan can define only geometry, decorative
anchors, and visible blocked cells. The seeded generator must choose the plan, people, item
emojis, and wording independently; no plan may encode a character, item assignment, phrase,
solution, or player data. Every blocked cell must be rejected by the generator, solver, reducer,
and accessible DOM controls, not merely painted as scenery.
Every floor-plan variant must form one complete partition: rooms touch along shared walls, cover
the full interior without gaps or overlaps, and contain only horizontal or vertical edges. Keep
the catalog geometry and obstacle emojis under automated regression tests.
Place room titles against horizontal wall segments that are long enough for their measured box.
Prefer the room-facing side, allow the opposite side of an internal wall only to avoid a collision,
and reject placements that overlap fixed objects, occupied cells, other labels, or board bounds.
Choose each door's deterministic boundary position after label layout, preferring a free boundary
cell whose rendered box does not overlap any room title. Room titles retain visual priority when a
short shared boundary makes separation impossible.
Model label wrapping from the narrow fitted mobile surface, where percentage widths shrink before
the minimum font size does; reserve the full wrapped box rather than a desktop-width estimate.
Every spatial position must inherit its `placeId` from the room polygon that contains its center.
Anchor solutions must sit beside a visible obstacle so exact localized clues can use room,
obstacle, and direction wording without exposing routes, rows, columns, steps, or distances.

The advanced building board contains 3 to 10 `5 x 5` floor slices. For depth `d`, it has `25d`
visual cells, `14(d-1)` playable home cells, 10 playable shop cells, and eight people across
`4(d-1)` semantic homes and two shops. Every generated solution uses two ground-floor shopkeepers
and six residents across at most five residential floors; tall buildings must retain unoccupied
floors. Entrance cells, landings, stairs, and `6d` curated room-fixture cells are blocked scenery.
Every blocked home or shop cell must show a visible object; every visually empty home or shop cell
must remain a genuine solver, reducer, and DOM candidate even when it is not part of the final
solution. Placed people conflict across the
complete row and column of their current floor. A height conflict at the same row and column reaches
only the immediately adjacent floor above and below, so adding more floors does not create an
unbounded full-height exclusion.
Render each floor as semantic DOM controls and use a keyboard-accessible, non-wrapping elevator to
switch among all floors without changing placements or timer state. Keep the elevator outside the
active-floor frame, order its floor buttons from ground floor to the selected height's top floor,
and let the fitted `5 x 5` plan use the available mobile width. Keep all floor targets at least
44 pixels and use one horizontally scrollable, non-wrapping tab strip when ten targets do not fit.
Derive visible room walls from the same `buildingUnitId` map as the puzzle geometry. Merge adjacent
edges into continuous horizontal or vertical runs, keep shared landing/stair/entrance circulation
open, and render walls above floor materials but below upright doors and interactive characters.
Corner clues are secondary variety and must retain the same positive social wording rule as other
advanced spatial clues.
Render doors as non-interactive wall fixtures centered on the boundary between two cells. A door
must not consume either cell, alter solver geometry, obscure a target, or receive pointer events.
Keep every door glyph upright; horizontal and vertical boundaries may change its position but never
rotate the recognizable icon.
Home and shop doors should face a landing, stair, or entrance route where the floor plan allows it.
Use structured shop clues for the ground-floor people, with localized social copy about opening,
helping the neighborhood, and preparing displays. Do not describe a shopkeeper as living in a shop.
Decorate blocked building cells with seeded local furniture, storage, plants, and shop fixtures.
Keep this scenery behind interaction, sparse in shared routes, absent from stairs, disjoint from
person-carried item icons, and semantically inert.
Accept clue-incorrect placements as normal player hypotheses. Validate clue truth only when solving,
checking, or producing a hint; persist structurally valid wrong guesses so reload never corrects the
player by silently discarding an error.
Checking an incorrect proposal must report the result without moving or removing pieces, changing
the move history, or revealing which individual hypothesis is wrong. Automatic correction is never
part of ordinary play; a solver placement occurs only after an explicit hint request.

The app must not ask for or store a player name or avatar. Shared URLs may contain a version, audience,
difficulty, selected board size, seeded puzzle identifier, and a bounded completion-time benchmark, but never a
solution or any personal data. A received challenge must explain the benchmark before play and
offer a return challenge after completion. Start its timer only after the player accepts the
challenge, and persist the benchmark with an in-progress game. Store theme identifiers rather
than localized titles in new history records so history follows the active language.
When restoring a challenge, verify that its seed, difficulty, variant, collection-specific size,
and audience match the saved puzzle's current theme and geometry; reject inconsistent metadata.

## Delivery

GitHub Pages serves this app below `/logic-garden/`. Keep Vite's base path, the PWA manifest
scope, internal navigation, and shared URLs aligned with that path. New share payloads are JSON
compressed with GZIP and encoded as URL-safe Base64 under the `p` query parameter. Validate the
encoded and declared decompressed sizes before use, while retaining safe legacy Base64 parsing.
New payloads must include the collection-specific size: child friend count, advanced 2D grid size,
or 3D building height. A shared challenge must reproduce that exact dimension.
Deploy only the compiled
`dist` directory with `.github/workflows/deploy-pages.yml`; never publish source files as the
site artifact.
Use automatic service-worker activation and client claiming. Check for an update when the app
returns to the foreground so installed mobile PWAs do not retain an obsolete JS/CSS pair.
Enforce checked-in budgets for the entry module, initial JavaScript graph, largest lazy chunk,
total JavaScript and CSS, chunk count, and complete `dist` size. PWA verification must reject
duplicate precache URLs and missing offline resources rather than relaxing the manifest.

## Verification

After meaningful changes, run formatting, lint, type checking, unit tests, and the
production build. A task is not complete while any check fails.
Prefer `docker compose run --rm --build verify` when host execution would require new permissions
or tool installation. The `verify` image must install from the frozen lockfile and execute the same
`pnpm verify` pipeline as GitHub Pages; do not weaken checks in the container-only path.
Run `docker compose run --rm --build e2e` after board or responsive-layout changes. Keep its official
Playwright image version equal to `@playwright/test`, and retain the Chromium, Firefox, and WebKit
mobile projects at `390 x 844` rather than relying on a single rendering engine.
Keep the checked-in V8 coverage thresholds at or above 84% statements, 78% branches, 84%
functions, and 86% lines. Raise them when reproducible full-suite evidence permits it; never lower
them merely to make a release pass.
After changes to boards, icons, labels, clues, or responsive layout, visually inspect teen and
adult games at a 390x844 mobile viewport for 6x6, 9x9, and 16x16 boards. Check both an empty board
and a board with a placed character where relevant. Reject clipped or overlapping labels,
misaligned cells, repeated or semantically wrong icons, unreadable clues, unexpected scroll in fit
mode, broken zoom/pan restoration, and touch targets obscured by artwork before publishing.
During drag QA, compare the pixel center of every fixed object and placed avatar with its semantic
cell, and verify that every valid destination has the same visible overlay while invalid and
blocked cells remain clearly distinct.
Also inspect every floor of representative 3-, 6-, and 10-floor `5 x 5` buildings at 390x844.
Verify centered wall doors, floor
switching, 25 cells per slice, exact avatar/drop-preview centers, and crossed destinations on the
horizontal and vertical axes plus the neighboring-floor height axis, without unintended fit-mode
panning. A non-adjacent floor at the same row and column must remain available. Verify that seeded
furniture and plants neither cover controls nor reuse a resident's carried item icon.
For every floor, verify that each blocked room cell has visible furniture and each room cell without
furniture is enabled. Include a known non-solution placement in interaction and persistence QA.
