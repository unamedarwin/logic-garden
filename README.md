# Logic Garden

Logic Garden is an offline-first logic puzzle game with three public collections: Children,
Puzzles 2D, and Puzzles 3D. Children place friendly characters on compact illustrated maps. The
2D collection uses irregular deduction plans, and the 3D collection uses a 3-to-10-floor building
where placement affects the horizontal, vertical, and height axes. Every visible puzzle is
generated locally, has exactly one solver-verified answer, and can be reproduced from its seed.

The game contains no ads, analytics, personal-data collection, remote APIs, user-generated
content, violence, frightening material, or external game assets.

## Run it

```sh
pnpm install
pnpm dev
```

Use `pnpm build` and `pnpm preview` to run the production PWA locally.

For an isolated environment that does not install project tools on the host, use Docker Desktop:

```sh
docker compose up --build -d dev
docker compose run --rm --build verify
docker compose run --rm --build e2e
docker compose down
```

The development app is available at `http://localhost:5173/logic-garden/`. Source files are bind
mounted for hot reload, while `node_modules` stays in the named Docker volume `dependencies`.
The verification service is rebuilt from the checked-in lockfile and runs the same `pnpm verify`
pipeline used by GitHub Pages without reusing host dependencies. The `e2e` service uses the pinned
official Playwright image and checks Chromium, Firefox, and WebKit at `390 x 844`, retaining traces
and screenshots under `test-results` and `playwright-report`.

The published build is available at `https://unamedarwin.github.io/logic-garden/`.
`main` is deployed with `.github/workflows/deploy-pages.yml`; it builds the app and publishes
only `dist` through GitHub Pages.

## Scripts

| Command                        | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `pnpm dev`                     | Start Vite.                                      |
| `pnpm build`                   | Type-check and build for production.             |
| `pnpm preview`                 | Serve the production build.                      |
| `pnpm format` / `format:check` | Format or validate formatting.                   |
| `pnpm spellcheck`              | Check Catalan, Spanish, and English text.        |
| `pnpm lint`                    | Run ESLint.                                      |
| `pnpm typecheck`               | Run strict TypeScript checking.                  |
| `pnpm test`                    | Run unit, property, and interface tests.         |
| `pnpm test:coverage`           | Run tests and enforce V8 coverage thresholds.    |
| `pnpm pwa:check`               | Validate generated PWA files.                    |
| `pnpm build:budget`            | Enforce JavaScript, CSS, chunk, and dist limits. |
| `pnpm release:metrics`         | Print reproducible build metrics as JSON.        |
| `pnpm templates:build`         | Regenerate 100 structural puzzle templates.      |
| `pnpm templates:check`         | Check the generated catalog version and size.    |
| `pnpm icons:build`             | Refresh the local Fluent SVG subset.             |
| `pnpm terrain:samples`         | Rebuild the 14 fixed terrain PNG references.     |
| `pnpm verify`                  | Run every required check and production build.   |

The equivalent host-isolated release checks are `docker compose run --rm --build verify` and
`docker compose run --rm --build e2e`.

## Architecture

```text
src/
  app/          shared-link parsing
  components/   accessible React UI, PixiJS grid artwork, and drag/drop presentation
  domain/       types, themes, spatial-plan catalog, translations, structured clue wording
  generator/    seeded world, structural templates, clues, and clue reduction
  assets/       generated local SVG and answer-free puzzle-template data
  solver/       framework-independent backtracking constraint solver
  game/         reducer, selectors, validation, solver-based hints
  storage/      IndexedDB preferences, visit state, statistics, and saved game
  pwa/          manifest and service-worker registration
  tests/        unit, integration, and property tests
```

The UI never stores a private answer. It asks the solver to validate a completed board or
derive a hint. The generator and solver do not import React, IndexedDB, or presentation
code.

## Unique seeded puzzles

`src/generator/seededRandom.ts` implements a deterministic PRNG. Theme, characters,
positions, solution, clue variants, and clue ordering all come from seeded streams. The same
generator version, variant, audience, difficulty, selected size, and seed therefore create the same puzzle.

The 2D and 3D collections select one of 100 pre-generated structural templates. The catalog
contains 84 spatial templates across the internal teen and adult content catalogs, all three
difficulties, and `6 x 6`, `9 x 9`, and `16 x 16` plans, plus 16 hard variable-height
`5 x 5 x 3` through `5 x 5 x 10` building templates: one for every internal content catalog and
height combination. A template
contains compact generic clue tuples, geometry references, and difficulty metrics, but never an
answer, name, avatar, localized phrase, concrete object, or personal value. The public seed then
selects new people, room names, objects, and phrase variants. The solver always validates the
themed puzzle again with a limit of two before it is shown.

The offline catalog builder makes a temporary internal assignment, creates only true structured
clues, and uses counterexample-guided clue selection until `countSolutions(puzzle, { limit: 2 })`
returns `1`. It removes a clue only when uniqueness remains. The public `Puzzle` and generated
catalog never contain the internal answer.

The solver uses backtracking with partial-constraint pruning, unique positions, and a
minimum-remaining-values variable order. It stops when it reaches the requested solution
limit, normally two for uniqueness checking.

For a selected height `d`, the 3D collection presents `25d` visual cells as accessible floor
slices. Its `4(d-1)` semantic homes expose `14(d-1)` genuinely playable cells, while two
ground-floor shops expose 10 more. Every game still uses only two shopkeepers and six residents;
at most five residential floors are occupied, so taller buildings keep meaningful empty levels.
Entrances, landings, stairs, and `6d` visible room fixtures remain blocked throughout generation,
solving, reducer actions, and the DOM. A room cell without a visible fixture is never disabled
just because it is absent from the final solution. A placement crosses the complete row and column
on that floor plus the same position one floor above and below; non-adjacent floors remain
independent. A detached elevator ordered from the ground floor to the selected building's highest
floor switches levels without narrowing or hiding the active plan. Doors are
non-interactive wall fixtures centered between adjacent cells,
never objects that occupy a destination. Seeded local furniture and plants warm the blocked scenery
without becoming puzzle objects. See [`docs/building-system.md`](docs/building-system.md).

## Collections, difficulty, and play

The first screen offers three direct play collections. No name, avatar, account, or profile is
required. Language remains an independent local preference. Each collection has its own visual
language and safe local themes:

| Collection | Interaction            | Themes                                                      |
| ---------- | ---------------------- | ----------------------------------------------------------- |
| Children   | Illustrated map        | Forests, farms, trips, and gentle discoveries               |
| Puzzles 2D | Spatial deduction plan | Music, sports, creative spaces, books, gardens, and markets |
| Puzzles 3D | 3-to-10-floor building | Friendly neighbors, shared landings, homes, and local shops |

Children choose 4, 6, or 8 friends independently from easy, medium, or hard deduction. Easy maps
protect direct friendly clues for most friends, medium maps protect fewer direct clues, and hard
maps prioritize relational deduction before direct placement clues. Seeded
rectangular boards alternate their orientation, so a `2 x 3` board can also appear as `3 x 2`.
Puzzles 3D similarly choose an exact height from 3 through 10 floors independently from their
difficulty. Easy deterministically ensures direct home or landmark guidance for at least four
people, medium ensures it for at least two, and hard keeps the complete structural deduction
without extra guidance. Existing direct facts count toward those targets and are not repeated.

Players can drag with a pointer or touch, or use the equivalent keyboard-friendly flow:
focus and activate a character button, then activate a location button. Touching a placed
character returns it to the waiting tray. A placed character can also be dragged again: its old
cell is excluded while valid destinations light up, a cell-sized preview shows the exact drop
target under the pointer, and dropping on the current cell does not count as a move. A single
top-layer guide draws the complete drag grid, so room textures and scene art cannot interrupt or
change individual grid lines. The 2D collection uses the same deduction rules across its internal
teen and adult content catalogs.
Setup follows one compact decision per journey step: collection, size, difficulty, and adventure.
The fourth step is a real horizontally scrollable theme picker; starting or resuming a game is
available only after that choice.
The size step offers 4/6/8 friends for Children, `6 x 6`/`9 x 9`/`16 x 16` for Puzzles 2D, and
3-10 floors for Puzzles 3D. In the 2D and 3D collections the player chooses size independently from
easy, medium, or hard deduction. Easy templates keep landmark choices narrow, while harder
templates allow broader candidate domains. Every `16 x 16` template uses eight people so the
row/column crossing mechanic covers the large board meaningfully. Visible scenery
blocks selected cells, while occupied rows and columns are crossed. Choosing a crossed destination
returns incompatible occupants to the waiting rail in one reversible move, so drag interactions
preserve the deduction rule without trapping the next person. The game provides visible focus,
ARIA live announcements,
44-pixel touch targets, and reduced-motion support. A selected person can receive a
solver-derived placement hint; at most all but one person can be placed this way. When nobody is
selected, the game asks who needs the hint. Hints are derived from the solver, never a stored
answer.

On deduction boards, a crossed destination remains selectable. Moving a person there gives the new
placement priority and returns every incompatible occupant to the waiting rail in the same reversible
move, preventing an earlier guess from trapping a later person.

Wrong deductions are part of play: any physically free cell accepts a person even when the clues make
that hypothesis incorrect. `Comprovar` evaluates clue truth, while local persistence retains valid
wrong guesses instead of silently correcting them on reload. The same rule applies to the child map:
a child can test a free place, replace its occupant, return a person to the waiting area, and undo the
whole experiment without the interface revealing the answer early.
Checking a wrong proposal never moves or removes a piece and never rewrites undo/redo history. It
reports only overall progress; the game changes a hypothesis automatically only when the player
explicitly asks for a solver hint.

Every check opens an accessible result dialog instead of placing feedback below the game. By default,
it reports the solver-verified number of correctly placed people as `N/total`. A local setting can hide
that exact score and retain only encouraging guidance. The score is the largest subset of the current
placements that can jointly extend to a valid solution, so individually plausible but mutually
contradictory guesses can never be reported as `total/total`. A completed board is accepted when its
full assignment satisfies the puzzle constraints; it is never compared with a stored or arbitrarily
selected answer. Generation still rejects every puzzle unless a solver run limited to two confirms
exactly one solution. No answer or rendered result text is persisted.

The upper journey path links collection, board size, difficulty, and adventure. Moving backward returns to the
picker without deleting the current puzzle, placements, timer, or challenge; returning to the same
adventure resumes that game. Selecting a different adventure and pressing play starts a new seeded
puzzle. The selected theme is folded into the final shareable seed, so the ordinary share payload
replays the exact adventure without storing a solution or adding a separate theme field. Starting a
new game is the only navigation action that replaces the suspended game.
Every step and direction control is keyboard accessible and at least 44 pixels high.

## Visual direction

Children use the illustrated field-guide direction: warm paper, garden colors, inked outlines,
a playful title scene, and a map that stays visually dominant during play. Their playable friends
use a curated, non-repeating set of child avatars; animals and objects remain scenery rather than
character identities. The 2D collection
alternates between poster-like creative scenes and calm editorial scenes from the internal teen
and adult content catalogs. Its boards use twelve local floor-plan variants per content catalog. A seeded game selects a
plan, transform, people, item emojis, obstacle locations, and phrase variants deterministically.
The catalog only describes architecture: it never encodes a name, object assignment, phrase,
answer, or player information. Every room is part of one complete orthogonal partition: rooms
share walls, cover the whole plan, and use only 90-degree corners. PixiJS paints floors, shared
walls and room-specific materials locally; semantic DOM cells paint crossed-out spaces
without rebuilding the Pixi canvas after every move. Seed-generated item
icons render visible furniture and obstacles, while human avatars always come from a separate
visual category. Scene art uses a generated, locally bundled subset of Microsoft Fluent Emoji
Flat SVG bodies, with no Iconify runtime, CDN, or network request. Each advanced theme has a curated room
catalog split into six place-specific subsets, so fixed objects remain plausible for the room that
contains them. Clue items, room objects, and character avatars cannot reuse an icon. Icon,
token, label, and cross sizes derive from the actual grid cell so 6x6,
9x9, and 16x16 plans retain the same hierarchy. The real interaction remains semantic HTML
buttons. Interface copy is non-selectable to avoid accidental selection while placing characters
or panning a plan; editable form fields retain normal text selection.

All spatial layers render inside one shared square surface. For each grid size, the renderer traces
the existing logical room assignment back into an orthogonal polygon, so every wall lands on a
real cell edge while every `placeId` stays unchanged. Fixed objects and avatars use the exact cell
center. Room names attach to collision-free horizontal walls, preferring the room-facing side and
using the opposite side of an internal wall only when necessary. Their collision boxes are sized
from the narrow fitted mobile surface, including the full wrapped height of 16x16 labels, so wider
layouts cannot hide a mobile overlap. Structured clue icon tokens use
the same locally bundled SVG key as the corresponding board object rather than a platform emoji.

Future scene-art replacements follow a fixed source hierarchy: Kenney for general graphics,
Game-icons.net for attributed semantic icons, and individually licensed itch.io packs only for a
deliberate pixel-art theme. See the [visual asset policy](docs/visual-asset-policy.md) for curation,
licensing, category separation, and migration QA. The current Fluent subset remains local and
deterministic until a complete reviewed category is ready to replace it.

Floor materials use three layered, square, seamless SVG tiles. The 14-material catalog uses
material-specific local drawings with deliberately different scale, geometry, palette, and contrast;
only water keeps a very subtle adapted bubble layer. Parquet, mosaic, carpet, rubber, cork, grass,
soil, stone, sand, water, concrete, metal, stage flooring, and artificial turf therefore look materially
distinct instead of reading as near-identical recolors. A second seeded layer scatters small curated
Lucide motifs inside cells. Each room decorates an exact seeded proportion between 25% and 75% of
its unblocked cells; every motif uses its own restrained semantic color palette and varies within
seeded scale, offset, and rotation ranges.
The remaining cells stay visually quiet. Patterns share a continuous phase across room and cell
boundaries. In the city garden, the pond is a contiguous 1/2/4-cell blocked patch on 6/9/16 boards;
the surrounding room remains a playable stone or garden edge. The puzzle seed makes the complete
composition reproducible in a shared URL, and the decorative SVG layer remains behind all labels,
objects, crosses, and semantic controls. See [the terrain system](docs/terrain-system.md) for the
material rules. The committed [terrain atlas](docs/terrain-samples/atlas.png) and
[material-by-material review](docs/terrain-samples/review.md) keep visual QA reproducible.

On narrow screens, the plan, horizontally scrollable people rail, and the selected person's
contextual clue stay in one workspace. The full clue list remains an optional collapsed support
panel rather than a separate view. Every plan fits the available width by default, including
`9 x 9` and `16 x 16`; there is no internal board scroll in fit mode. Players can explicitly zoom
from 100% to 250%, at which point only the enlarged board can be moved within its viewport. A
compact fixed action rail fits hint, undo, sharing, and validation without horizontal scrolling
to the page end. The mobile adventure banner and rail spacing compact without shrinking the map
or action targets. The document reserves enough bottom space for the whole people picker,
contextual clue rail, complete clue panel, and feedback to scroll fully above that fixed rail and the
iOS safe area. A visible game counter records elapsed time without blocking play. New games
reset document position and board zoom rather than inheriting a previous view.

## Languages and wording

Catalan, Spanish, English, Basque, Galician, French, and German are available from the collection
picker and in settings. A new installation chooses the first supported language reported by the
browser; an explicit saved choice always takes priority. Every clue is a discriminated union value;
`renderClue` converts it into a short local template for the selected language.
This makes phrases simple, reusable, and logically identical across languages.
Child clues use the same narrative pattern as advanced clues: each precise fact is paired with a
short friendly action, object, or motivation instead of being reduced to a bare placement command.
Reducer and solver feedback is also stored as structured message data; the interface localizes it
at render time, so saved games never retain wording from a previously selected language.
Spatial cells inherit the room that geometrically contains them. Exact spatial clues add a short,
positive social action before identifying one playable cell by naming its room, a visible adjacent
obstacle, and the direction from that obstacle. They never expose route, row, column, step, or
distance wording.

`cspell.json` loads Catalan and Spanish dictionaries alongside the built-in English one.
`pnpm spellcheck` is part of `pnpm verify` for project prose and non-catalog source. The localized
catalogs are checked with strict key and logical-placeholder audits; Basque, Galician, French, and
German additionally use independent composition review without installing language packages.
Add only intentional names and technical terms to the project dictionary, never a spelling mistake.
See [localization](docs/localisation.md).

## PWA and offline play

`vite-plugin-pwa` creates the standalone manifest, maskable SVG icon, and Workbox service
worker. Essential assets are precached. New releases activate automatically and the app checks
again whenever a foreground window regains focus, preventing an installed mobile PWA from keeping
an obsolete board bundle. After the first successful visit, the app can load,
start a game, generate a puzzle, play, validate, and create another game offline. It shows
an offline status only when connectivity is lost. On a first mobile
visit, Android receives the native install action when available; iPhone and iPad receive the
short Share > Add to Home Screen instruction.

Production builds enforce budgets for the entry module, initial graph, largest lazy chunk, total
JavaScript and CSS, chunk count, and complete `dist` size. `pnpm pwa:check` additionally rejects
duplicate precache entries, missing offline assets, source maps, source files, broken base paths,
and credential-like strings.

Share links are available during play and after completion, and never contain the answer or
personal data. Payload schema 5 stores a generator version,
variant, difficulty, the collection-specific selected size, seed, audience, and an optional bounded completion-time benchmark
as JSON compressed with GZIP and then encoded as URL-safe Base64. New payloads use the `gz_`
prefix, while the reader remains compatible with validated legacy uncompressed Base64 links:

```text
/logic-garden/?p=gz_<url-safe-base64-gzip-payload>
```

After a solve, the local history stores the theme identifier, audience, difficulty, the selected map, grid, or building size, generator version,
elapsed time, moves, hint count, and seed. It never stores the answer or personal data. Each saved result exposes the
same share action, using the platform share sheet on supported Android and Apple devices and
copying the link as a fallback. Opening a timed link shows an accessible challenge dialog; after
the timer starts only when that dialog is accepted, and its benchmark survives an in-progress
reload. After the solve, the result card compares both marks and offers a return link plus screenshot-ready
copy, creating a safe back-and-forth challenge without transmitting a player name.

## Persistence

Preferences, first-visit state, statistics, and the in-progress game are stored in IndexedDB
through small safe wrappers. The preferences migration deletes the retired local profile record.
The schemas are versioned; preferences use schema 5 and in-progress games use schema 4. An in-progress game is restored only
when its persistence schema and generator version are current, preventing old clues or geometry
from leaking into a new release. If browser storage is unavailable, play still works without
persistence.
Restored challenges must also match the puzzle's seed, difficulty, variant, selected dimension,
and internal safe-content catalog; inconsistent records are discarded instead of silently changing
the received challenge.

## Add content

To add a theme, add safe characters, places, objects, and source words in
`src/domain/themes.ts`, then add localized titles in `src/domain/i18n.ts`.
Run `pnpm icons:build` after changing a theme icon; `pnpm verify` rejects stale or missing local
Fluent SVG data. See `THIRD_PARTY_NOTICES.md` for artwork attribution.

When generation rules change, bump `GENERATOR_VERSION` and run `pnpm templates:build`. Use
`pnpm templates:repair` when a canonical integrity check finds duplicate clue sets whose only
difference is clue order. The catalog
builder may generate extra candidates and discard impossible geometry or duplicates, but it must
stop at exactly 100 valid structures and retain all 18 spatial audience/difficulty/size buckets
plus the two hard structural building audience buckets. Runtime 3D guidance derives easy and medium
variants from those unique structures without storing an answer.

Planned product work is tracked in [`docs/product-backlog.md`](docs/product-backlog.md).

To add a clue type, extend the `Clue` union, partial evaluator, candidate generator, all
three template dictionaries, and solver tests. Update `GENERATOR_VERSION` when a change can
alter seed output.

## Verification and limitations

Tests cover solver edge cases, every constraint family, deterministic generation, all 100
answer-free templates, runtime uniqueness across all 18 advanced buckets, clue truth,
minimality, safe-content scanning, hundreds of seeds, reducer history, click and
keyboard play, localization, and manifest settings. `pnpm pwa:check` verifies the output
manifest, service worker, unique precache, and offline asset coverage after a production build;
`pnpm build` also fails when a release exceeds the checked-in bundle budgets.
The coverage command enforces global minimums of 84% statements, 78% branches, 84% functions, and
86% lines so new work cannot silently reduce the current regression evidence.
