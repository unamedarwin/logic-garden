# Release quality assessment

Assessed application commit: `2a35523e` (`2026-07-14`). The follow-up documentation commit does
not change application code, dependencies, generated catalogs, or build output.

## Evidence score

| Area                                   |      Score | Reproducible evidence and limits                                                                                                                                                                                                |
| -------------------------------------- | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Puzzle correctness and uniqueness      |      20/22 | The 1,000-entry catalog check, deterministic replay, solver limit-two checks, all heights, geometry, and reducers pass. An independent oracle over every runtime theme combination was not retained.                            |
| Mobile usability and accessibility     |       3/18 | DOM tests cover tap, keyboard, drag alternatives, floor switching, incorrect hypotheses, and dialogs. The required browser, focus, contrast, zoom, Android, and iOS matrix is missing.                                          |
| Visual quality and alignment           |       2/12 | Geometry, icon identity, furniture, texture, and destination invariants are automated. No same-revision 390 x 844 screenshots or pixel-center measurements were produced because browser control failed during this assessment. |
| Localisation                           |      13/14 | Seven-locale parity and clue composition tests pass. Independent EU/GL and FR/DE reviewers found no remaining issue after two rounds, including 542 exact clues. Native review evidence is incomplete for the other locales.    |
| PWA, offline, sharing, and persistence |       6/12 | PWA build checks, GZIP/Base64 and legacy share round-trips, corrupt input, persistence, history, and challenge tests pass. Android/iOS installation and a recorded offline journey are missing.                                 |
| Performance                            |        3/8 | 100 hard advanced generations: p50 23.6 ms, p95 153.0 ms, p99 213.2 ms, max 224.6 ms. Lighthouse, interaction latency, and bundle-budget evidence are missing; Vite reports large-chunk warnings.                               |
| Security, privacy, and content         |        5/6 | `pnpm audit --prod` reports no known vulnerability; secret and prohibited-term scans are clean; payloads are size-bounded and validated. A retained runtime network archive is missing.                                         |
| Automated regression and release       |        4/8 | `pnpm verify` passes 135 tests. V8 coverage is 83.98% statements, 76.86% branches, 83.18% functions, and 85.55% lines. Mutation testing and Chromium/Firefox/WebKit journeys are missing.                                       |
| **Total**                              | **56/100** | This is an evidence score, not an inferred product-quality score.                                                                                                                                                               |

## Commands retained

- `pnpm run verify`: formatting, configured spelling, lint, icon catalog, template catalog,
  TypeScript, 135 tests, production build, manifest, service worker, and precache all pass.
- `pnpm run test:coverage`: all 135 tests pass with the coverage values above.
- `pnpm audit --prod`: no known vulnerabilities.
- The controlled 100-sample generation run alternated hard spatial and building puzzles across the
  two internal safe-content audiences.

## Evidence required for 100

The remaining points cannot be awarded through code inspection. A future same-commit assessment
must retain the complete 390 x 844 and desktop screenshot matrix, exact pixel-center measurements,
keyboard and screen-reader traces, Android Chrome and iOS Safari install/offline journeys,
Chromium/Firefox/WebKit end-to-end runs, five-run Lighthouse distributions, interaction latency,
bundle-budget results, mutation testing, and a runtime network archive. Any resulting code change
requires a fresh assessment.
