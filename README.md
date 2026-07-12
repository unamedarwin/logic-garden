# Logic Garden

Logic Garden is an offline-first logic puzzle game for children, teens, and adults. A local
profile selects the visual direction and age-appropriate themes before play. Children place
friendly characters on a map; teens and adults use a deduction grid where a placed character
crosses out its row and column. Every visible puzzle is generated locally, has exactly one
solver-verified answer, and can be reproduced from its seed.

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
| `pnpm verify`                  | Run every required check and production build. |

## Architecture

```text
src/
  app/          shared-link parsing
  components/   accessible React UI, PixiJS grid artwork, and drag/drop presentation
  domain/       types, themes, translations, structured clue wording
  generator/    seeded world, solution, clue, and clue-reduction generation
  solver/       framework-independent backtracking constraint solver
  game/         reducer, selectors, validation, solver-based hints
  storage/      IndexedDB profile, preferences, statistics, and saved game
  pwa/          manifest and service-worker registration
  tests/        unit, integration, and property tests
```

The UI never stores a private answer. It asks the solver to validate a completed board or
derive a hint. The generator and solver do not import React, IndexedDB, or presentation
code.

## Unique seeded puzzles

`src/generator/seededRandom.ts` implements a deterministic PRNG. Theme, characters,
positions, solution, clue variants, and clue ordering all come from one seeded stream. The
same generator version, difficulty, and seed therefore create the same puzzle.

The generator makes a complete internal assignment, creates only true structured clues,
and adds clues until `countSolutions(puzzle, { limit: 2 })` returns `1`. It removes a clue
only when uniqueness remains, then runs one final solver check. The public `Puzzle` never
contains the internal answer.

The solver uses backtracking with partial-constraint pruning, unique positions, and a
minimum-remaining-values variable order. It stops when it reaches the requested solution
limit, normally two for uniqueness checking.

## Profiles, difficulty, and play

The first screen asks for a local name, a generic avatar, and one of three audiences. The
profile stays only on the device and can be changed from the home screen. Each audience has
its own visual language and local themes:

| Audience | Interaction     | Themes                                             |
| -------- | --------------- | -------------------------------------------------- |
| Children | Illustrated map | Forests, farms, trips, and gentle discoveries      |
| Teens    | Deduction grid  | Music studio, sports festival, and creative lab    |
| Adults   | Deduction grid  | Book club, neighborhood garden, and weekend market |

Children keep the compact map difficulties below. Seeded rectangular boards alternate their
orientation, so a `2 x 3` board can also appear as `3 x 2`.

| Difficulty | Map   | Friends |
| ---------- | ----- | ------- |
| Easy       | 2 × 2 | 4       |
| Medium     | 2 × 3 | 6       |
| Hard       | 2 × 4 | 8       |

Players can drag with a pointer or touch, or use the equivalent keyboard-friendly flow:
focus and activate a character button, then activate a location button. Touching a placed
character returns it to the waiting tray. In a deduction grid, occupied rows and columns are
blocked in both the interface and the reducer, so drag interactions cannot bypass the rule.
The game provides visible focus, ARIA live announcements, 44-pixel touch targets, and
reduced-motion support. Hints are derived from the solver, never a stored answer.

During a game, `Canvia el nivell` returns to the level picker and clears the temporary saved
game. The same action is available from the header and the completion dialog, so a player can
always choose another difficulty before starting a new adventure.

## Visual direction

Children use the illustrated field-guide direction: warm paper, garden colors, inked outlines,
a playful title scene, and a map that stays visually dominant during play. Teen profiles use a
poster-like, high-contrast scene; adult profiles use a calm editorial layout. The deduction
grid is painted locally with PixiJS and layered with locally bundled Lucide SVG objects, while
the real interaction remains semantic HTML buttons.

On narrow screens, the game uses a compact `Tauler` / `Pistes` switcher. The map and friend
tray stay together in the board view; clues open in their own view, so moving a friend never
requires scrolling between the puzzle board and its tray.

## Languages and wording

Catalan, Spanish, and English are available in settings. Every clue is a discriminated
union value; `renderClue` converts it into a short local template for the selected language.
This makes phrases simple, reusable, and logically identical across languages.

`cspell.json` loads Catalan and Spanish dictionaries alongside the built-in English one.
`pnpm spellcheck` is part of `pnpm verify`. Add only intentional names and technical terms
to that dictionary, never a spelling mistake.

## PWA and offline play

`vite-plugin-pwa` creates the standalone manifest, maskable SVG icon, and Workbox service
worker. Essential assets are precached. After the first successful visit, the app can load,
start a game, generate a puzzle, play, validate, and create another game offline. It shows
connection status and offers an update when a service-worker version is ready.

Share links never contain the answer. They store only a version, difficulty, seed, and audience
in a URL-safe Base64 payload:

```text
/logic-garden/?p=<url-safe-base64-payload>
```

## Persistence

The local profile, preferences, statistics, and in-progress game are stored in IndexedDB
through small safe wrappers. The schemas are versioned. If browser storage is unavailable,
play still works without persistence.

## Add content

To add a theme, add safe characters, places, objects, and source words in
`src/domain/themes.ts`, then add localized titles in `src/domain/i18n.ts`.

To add a clue type, extend the `Clue` union, partial evaluator, candidate generator, all
three template dictionaries, and solver tests. Update `GENERATOR_VERSION` when a change can
alter seed output.

## Verification and limitations

Tests cover solver edge cases, every constraint family, deterministic generation, clue
truth, minimality, safe-content scanning, hundreds of seeds, reducer history, click and
keyboard play, localization, and manifest settings. `pnpm pwa:check` verifies the output
manifest, service worker, and precache after a production build.

Known limitation: place and object names currently retain their original Catalan theme
vocabulary in Spanish and English. The narrative, controls, and clues are translated;
localized vocabulary tables are the next content-expansion step.
