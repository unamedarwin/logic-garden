# Logic Garden

Logic Garden is an offline-first logic puzzle game with three public collections: Children,
Puzzles 2D, and Puzzles 3D. Children place friendly characters on compact illustrated maps. The
2D collection uses irregular deduction plans, and the 3D collection uses a five-floor building
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

The published build is available at `https://unamedarwin.github.io/logic-garden/`.
`main` is deployed with `.github/workflows/deploy-pages.yml`; it builds the app and publishes
only `dist` through GitHub Pages.

## Scripts

| Command                        | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `pnpm dev`                     | Start Vite.                                    |
| `pnpm build`                   | Type-check and build for production.           |
| `pnpm preview`                 | Serve the production build.                    |
| `pnpm format` / `format:check` | Format or validate formatting.                 |
| `pnpm spellcheck`              | Check Catalan, Spanish, and English text.      |
| `pnpm lint`                    | Run ESLint.                                    |
| `pnpm typecheck`               | Run strict TypeScript checking.                |
| `pnpm test`                    | Run unit, property, and interface tests.       |
| `pnpm test:coverage`           | Run tests with V8 coverage.                    |
| `pnpm pwa:check`               | Validate generated PWA files.                  |
| `pnpm templates:build`         | Regenerate 1,000 structural puzzle templates.  |
| `pnpm templates:check`         | Check the generated catalog version and size.  |
| `pnpm icons:build`             | Refresh the local Fluent SVG subset.           |
| `pnpm terrain:samples`         | Rebuild the 14 fixed terrain PNG references.   |
| `pnpm verify`                  | Run every required check and production build. |

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
generator version, variant, audience, difficulty, and seed therefore create the same puzzle.

The 2D and 3D collections select one of 1,000 pre-generated structural templates. The catalog
contains 950 spatial templates across the internal teen and adult content catalogs, all three
difficulties, and `6 x 6`, `9 x 9`, and `16 x 16` plans, plus 50 hard `5 x 5 x 5` building
templates split evenly between those content catalogs. A template
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

The 3D collection presents 125 visual cells as five accessible floor slices. Sixteen reviewed home
anchors and two ground-floor shop anchors are logical destinations for two shopkeepers and six
residents; entrances, landings, stairs, fixtures, and non-anchor cells remain blocked throughout
generation, solving, reducer actions, and the DOM. A placement crosses the complete row and column
on that floor plus the same position one floor above and below; non-adjacent floors remain
independent so the model can grow further in height. A detached elevator ordered from ground floor
to fourth floor switches floors without narrowing or hiding the active plan. Doors are
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
| Puzzles 3D | Five-floor building    | Friendly neighbors, shared landings, homes, and local shops |

Children keep the compact map difficulties below. Seeded rectangular boards alternate their
orientation, so a `2 x 3` board can also appear as `3 x 2`.

| Difficulty | Map   | Friends |
| ---------- | ----- | ------- |
| Easy       | 2 x 2 | 4       |
| Medium     | 2 x 3 | 6       |
| Hard       | 2 x 4 | 8       |

Players can drag with a pointer or touch, or use the equivalent keyboard-friendly flow:
focus and activate a character button, then activate a location button. Touching a placed
character returns it to the waiting tray. A placed character can also be dragged again: its old
cell is excluded while valid destinations light up, a cell-sized preview shows the exact drop
target under the pointer, and dropping on the current cell does not count as a move. A single
top-layer guide draws the complete drag grid, so room textures and scene art cannot interrupt or
change individual grid lines. The 2D collection uses the same deduction rules across its internal
teen and adult content catalogs.
Every advanced difficulty can use `6 x 6`, `9 x 9`, or `16 x 16`; grid size does not define
difficulty and never dictates the number of people. The seeded selector chooses one of the three
sizes first, with equal probability, and only then chooses a template from that size. Easy
templates keep landmark choices narrow, while harder templates allow broader candidate domains.
Groups target 4, 6, and 8 people and are capped by the selected grid dimension. Visible scenery
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

During a game, `Canvia el nivell` returns to the level picker and clears the temporary saved
game. The same action is available from the header and the completion dialog, so a player can
always choose another difficulty before starting a new adventure.

## Visual direction

Children use the illustrated field-guide direction: warm paper, garden colors, inked outlines,
a playful title scene, and a map that stays visually dominant during play. The 2D collection
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
Flat SVGs through Iconify, with no CDN or runtime request. Each advanced theme has a curated room
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

Floor materials use three layered, square, seamless SVG tiles adapted from Hero Patterns. The
14-material catalog covers parquet, mosaic, carpet, rubber, cork, grass, soil, stone, sand, water,
concrete, metal, stage flooring, and artificial turf. A second seeded layer scatters small curated
Lucide motifs inside cells. Each room decorates an exact seeded proportion between 25% and 75% of
its unblocked cells; every motif varies within restrained color, scale, offset, and rotation ranges.
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
or action targets, leaving the contextual clue fully above that fixed rail. A visible game counter
records elapsed time without blocking play. New games
reset document position and board zoom rather than inheriting a previous view.

## Languages and wording

Catalan, Spanish, and English are available from the collection picker and in settings. Every clue
is a discriminated union value; `renderClue` converts it into a short local template for the selected language.
This makes phrases simple, reusable, and logically identical across languages.
Reducer and solver feedback is also stored as structured message data; the interface localizes it
at render time, so saved games never retain wording from a previously selected language.
Spatial cells inherit the room that geometrically contains them. Exact spatial clues add a short,
positive social action before identifying one playable cell by naming its room, a visible adjacent
obstacle, and the direction from that obstacle. They never expose route, row, column, step, or
distance wording.

`cspell.json` loads Catalan and Spanish dictionaries alongside the built-in English one.
`pnpm spellcheck` is part of `pnpm verify`. Add only intentional names and technical terms
to that dictionary, never a spelling mistake.

## PWA and offline play

`vite-plugin-pwa` creates the standalone manifest, maskable SVG icon, and Workbox service
worker. Essential assets are precached. New releases activate automatically and the app checks
again whenever a foreground window regains focus, preventing an installed mobile PWA from keeping
an obsolete board bundle. After the first successful visit, the app can load,
start a game, generate a puzzle, play, validate, and create another game offline. It shows
an offline status only when connectivity is lost. On a first mobile
visit, Android receives the native install action when available; iPhone and iPad receive the
short Share > Add to Home Screen instruction.

Share links are available during play and after completion, and never contain the answer or
personal data. Payload schema 4 stores a generator version,
variant, difficulty, seed, audience, and an optional bounded completion-time benchmark
in a URL-safe Base64 payload:

```text
/logic-garden/?p=<url-safe-base64-payload>
```

After a solve, the local history stores the theme identifier, audience, difficulty, generator version,
elapsed time, moves, hint count, and seed. It never stores the answer or personal data. Each saved result exposes the
same share action, using the platform share sheet on supported Android and Apple devices and
copying the link as a fallback. Opening a timed link shows an accessible challenge dialog; after
the timer starts only when that dialog is accepted, and its benchmark survives an in-progress
reload. After the solve, the result card compares both marks and offers a return link plus screenshot-ready
copy, creating a safe back-and-forth challenge without transmitting a player name.

## Persistence

Preferences, first-visit state, statistics, and the in-progress game are stored in IndexedDB
through small safe wrappers. The preferences migration deletes the retired local profile record.
The schemas are versioned; in-progress games currently use schema 4. An in-progress game is restored only
when its persistence schema and generator version are current, preventing old clues or geometry
from leaking into a new release. If browser storage is unavailable, play still works without
persistence.

## Add content

To add a theme, add safe characters, places, objects, and source words in
`src/domain/themes.ts`, then add localized titles in `src/domain/i18n.ts`.
Run `pnpm icons:build` after changing a theme icon; `pnpm verify` rejects stale or missing local
Fluent SVG data. See `THIRD_PARTY_NOTICES.md` for artwork attribution.

When generation rules change, bump `GENERATOR_VERSION` and run `pnpm templates:build`. Use
`pnpm templates:repair` when a canonical integrity check finds duplicate clue sets whose only
difference is clue order. The catalog
builder may generate extra candidates and discard impossible geometry or duplicates, but it must
stop at exactly 1,000 valid structures and retain all 18 spatial audience/difficulty/size buckets
plus the two hard building audience buckets.

Planned product work is tracked in [`docs/product-backlog.md`](docs/product-backlog.md).

To add a clue type, extend the `Clue` union, partial evaluator, candidate generator, all
three template dictionaries, and solver tests. Update `GENERATOR_VERSION` when a change can
alter seed output.

## Verification and limitations

Tests cover solver edge cases, every constraint family, deterministic generation, all 1,000
answer-free templates, runtime uniqueness across all 18 advanced buckets, clue truth,
minimality, safe-content scanning, hundreds of seeds, reducer history, click and
keyboard play, localization, and manifest settings. `pnpm pwa:check` verifies the output
manifest, service worker, and precache after a production build.
