# Quality scorecard

Logic Garden uses an evidence-based 100-point release score. A score is awarded only when the
required evidence is reproducible for the same commit. Missing evidence scores zero; reviewers
must not infer that an untested behavior works.

## Required evidence corpus

- Logic: all 1,000 structural templates, every compatible theme application, and deterministic
  replay from fixed seeds. Uniqueness checks stop after two solutions.
- Interface: 390 x 844 at DPR 3 and 1440 x 900 at DPR 1; all seven locales, collections,
  difficulties, advanced grid sizes, representative 3-, 6-, and 10-floor buildings with every
  floor inspected, and empty, placed, incorrect, and
  completed states.
- Release: commit SHA, clean install, raw logs, structured test output, screenshots, browser traces,
  network archive, and measurements must refer to the same source revision.

## Scoring

| Area                                   | Points | Full-score observable evidence                                                                                                                                                                                                          |
| -------------------------------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Puzzle correctness and uniqueness      |     22 | Every published puzzle has exactly one solution; catalog identity, determinism, geometry, reducer, solver, hints, difficulty, and size-selection invariants pass over the full corpus and large seeded property samples.                |
| Mobile usability and accessibility     |     18 | The complete mobile matrix has no hidden controls or unexpected fit-mode scrolling; tap, keyboard, and drag are equivalent; targets are at least 44 px; WCAG 2.2 AA manual and automated checks have no major findings.                 |
| Visual quality and alignment           |     12 | Object, avatar, preview, artwork, and semantic-cell centers differ by at most 1 CSS px; walls, labels, doors, textures, ponds, icons, and obstacles pass collision and semantic consistency checks in every required board state.       |
| Localisation                           |     14 | `ca`, `es`, `en`, `eu`, `gl`, `fr`, and `de` have complete key and template parity with no fallback; spelling and independent language composition review pass; structured clues preserve logic, social tone, and matching icon tokens. |
| PWA, offline, sharing, and persistence |     12 | Android and iOS installation, foreground update, full offline play, validated challenge round-trips, Web Share fallback, corrupt-storage recovery, and state retention pass in all collections.                                         |
| Performance                            |      8 | Mobile Lighthouse is at least 90, LCP at most 2.5 s, CLS at most 0.1, TBT at most 200 ms; generation p95 is at most 1.5 s and p99 at most 3 s; interaction p95 is at most 100 ms; cache and bundle budgets pass.                        |
| Security, privacy, and content         |      6 | Static and runtime audits show no tracking, ads, personal data, remote scene assets, unsafe content, unvalidated payloads, high/critical production vulnerabilities, or unlicensed assets.                                              |
| Automated regression and release       |      8 | A clean frozen install and `pnpm verify` pass; critical modules meet coverage and mutation thresholds; Chromium, Firefox, and WebKit mobile journeys and visual snapshots remain below 1% flakiness.                                    |

## Partial scoring rules

- A representative automated sample without full-corpus evidence can earn at most half of a
  criterion.
- Automated accessibility without keyboard, focus, contrast, zoom, and real-device review earns at
  most one fifth of the accessibility criterion.
- A mechanically complete locale without native composition review earns at most half of the
  composition criterion.
- Visual review without pixel-center measurements earns at most one fifth of alignment points.
- One browser engine or one viewport earns at most half of the relevant cross-platform criterion.

## Score caps

- A non-unique puzzle, trusted/stored answer, prohibited content, or personal-data leak caps the
  release at 49.
- A keyboard/touch completion blocker, essential offline failure, or save corruption caps it at 69.
- Any failing `pnpm verify` check caps it at 79.

## Independent reassessment

1. Freeze the commit, lockfile, runtime, browser, and device versions.
2. Start with a clean checkout, dependency store, IndexedDB, cache, and service worker.
3. Run product solver checks plus an independently maintained uniqueness oracle.
4. Run the automated interface matrix and manual Android Chrome and iOS Safari checks.
5. Give each native-language reviewer the structured fact and rendered sentence without a reference
   translation.
6. Record five controlled performance runs per route and retain median, p95, and p99 data.
7. Have two reviewers score independently; a third resolves differences greater than two points.
8. Any fix creates a new revision and requires rerunning every affected area plus `pnpm verify`.

The current score and evidence links belong in `docs/quality-assessment.md`; the rubric remains
stable so a higher score reflects product improvement rather than changed criteria.
