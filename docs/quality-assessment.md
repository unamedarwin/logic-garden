# Release quality assessment

Assessed release candidate: generator version 20 (`2026-07-14`). All evidence below is
reproducible from the checked-in Docker and Playwright configuration.

## Evidence score

| Area                                   |      Score | Reproducible evidence and limits                                                                                                                                                                                                                                                                                                      |
| -------------------------------------- | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Puzzle correctness and uniqueness      |      20/22 | The 100-entry answer-free catalog, canonical identity, deterministic replay, solver limit-two checks, all 2D sizes, all building heights, geometry, reducer, and validation invariants pass. A second independent solver is not retained.                                                                                             |
| Mobile usability and accessibility     |       8/18 | Chromium, Firefox, and WebKit pass the 390 x 844 fitted-board journeys. DOM tests cover tap, keyboard, drag, focus trapping, 44 px elevator targets, wrong hypotheses, and dialogs. Physical Android/iOS, screen-reader, contrast, and zoom audits remain.                                                                            |
| Visual quality and alignment           |       8/12 | The browser matrix covers 6 x 6, 9 x 9, 16 x 16 and 3-, 6-, and 10-floor boards in empty and placed states. It measures avatar centers to within 1 CSS px and checks walls, fit overflow, cells, and stacking. The full locale/state/desktop visual corpus remains.                                                                   |
| Localisation                           |      13/14 | Seven-locale parity and clue composition tests pass. Independent EU/GL and FR/DE reviews cover the generated clue corpus. Native review evidence is incomplete for the remaining locales.                                                                                                                                             |
| PWA, offline, sharing, and persistence |       6/12 | PWA build checks, GZIP/Base64 and legacy share round-trips, bounded corrupt input, persistence, history, and challenge tests pass. Physical Android/iOS installation and a retained offline journey remain.                                                                                                                           |
| Performance                            |        5/8 | Generator samples remain below the 1.5 s p95 requirement and checked-in JavaScript, CSS, chunk, and complete-dist budgets pass. Five-run Lighthouse and interaction-latency distributions are not retained.                                                                                                                           |
| Security, privacy, and content         |        5/6 | Static checks cover prohibited content, payload validation, local assets, secrets, and production dependencies. A retained runtime network archive is missing.                                                                                                                                                                        |
| Automated regression and release       |        7/8 | A frozen Docker install runs formatting, spelling, lint, catalog checks, TypeScript, 169 unit/integration tests, production build, PWA checks, and budgets. Eighteen no-retry Chromium/Firefox/WebKit journeys pass. V8 coverage is 84.62% statements, 78.50% branches, 84.51% functions, and 86.47% lines. Mutation testing remains. |
| **Total**                              | **72/100** | This is an evidence score, not an inferred product-quality score.                                                                                                                                                                                                                                                                     |

## Commands retained

- `docker compose run --rm --build verify`: clean frozen install plus formatting, configured
  spelling, lint, icon catalog, 100-template catalog, TypeScript, 169 tests, production build,
  bundle budgets, manifest, service worker, and precache verification.
- `docker compose run --rm --build e2e`: 18 mobile journeys across Chromium, Firefox, and WebKit,
  with no retries.
- `docker compose exec -T dev pnpm run test:coverage`: all 169 tests pass with the coverage values
  above.

## Evidence required for 100

The remaining points cannot be awarded through code inspection. A same-commit assessment must add
the complete locale, desktop, incorrect, and completed screenshot corpus; keyboard and screen-reader
traces; WCAG contrast and zoom review; Android Chrome and iOS Safari install/offline journeys;
five-run Lighthouse and interaction-latency distributions; mutation testing; a runtime network
archive; and an independently maintained uniqueness oracle. Any resulting application change
requires a fresh assessment.
