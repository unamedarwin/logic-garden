# Release quality assessment

Assessed release candidate: generator version 22 (`2026-07-15`). All evidence below is
reproducible from the checked-in Docker and Playwright configuration.

This file contains two independent scores. The release score measures reproducible technical
evidence. The content score applies the separate
[`content quality and enjoyment rubric`](content-quality-rubric.md); neither score can substitute
for the other.

## Evidence score

| Area                                   |      Score | Reproducible evidence and limits                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------- | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Puzzle correctness and uniqueness      |      20/22 | The 100-entry answer-free catalog, canonical identity, deterministic replay, solver limit-two checks, all 2D sizes, all building heights, geometry, reducer, and validation invariants pass. A second independent solver is not retained.                                                                                                                                                        |
| Mobile usability and accessibility     |       8/18 | Chromium, Firefox, and WebKit pass the 390 x 844 fitted-board journeys. DOM tests cover tap, keyboard, drag, focus trapping, 44 px elevator targets, wrong hypotheses, and dialogs. Physical Android/iOS, screen-reader, contrast, and zoom audits remain.                                                                                                                                       |
| Visual quality and alignment           |       8/12 | The browser matrix covers child maps with 4, 6, and 8 textured places, 6 x 6, 9 x 9, 16 x 16 boards, and 3-, 6-, and 10-floor buildings in empty and placed states. It measures avatar centers to within 1 CSS px and checks walls, fit overflow, cells, and stacking. The full locale/state/desktop visual corpus remains.                                                                      |
| Localisation                           |      13/14 | Seven-locale parity and clue composition tests pass. Independent EU/GL and FR/DE reviews cover the generated clue corpus. Native review evidence is incomplete for the remaining locales.                                                                                                                                                                                                        |
| PWA, offline, sharing, and persistence |       6/12 | PWA build checks, GZIP/Base64 and legacy share round-trips, bounded corrupt input, persistence, history, and challenge tests pass. Physical Android/iOS installation and a retained offline journey remain.                                                                                                                                                                                      |
| Performance                            |        5/8 | Generator samples remain below the 1.5 s p95 requirement and checked-in JavaScript, CSS, chunk, and complete-dist budgets pass. Five-run Lighthouse and interaction-latency distributions are not retained.                                                                                                                                                                                      |
| Security, privacy, and content         |        5/6 | Static checks cover prohibited content, payload validation, local assets, secrets, and production dependencies. A retained runtime network archive is missing.                                                                                                                                                                                                                                   |
| Automated regression and release       |        7/8 | A frozen Docker install runs formatting, spelling, lint, catalog checks, TypeScript, 179 unit/integration tests, production build, PWA checks, and budgets. Thirty no-retry Chromium/Firefox/WebKit journeys pass, including a dedicated `393 x 852` illustrated-story journey. V8 coverage is 85.19% statements, 79.09% branches, 84.75% functions, and 87.05% lines. Mutation testing remains. |
| **Total**                              | **72/100** | This is an evidence score, not an inferred product-quality score.                                                                                                                                                                                                                                                                                                                                |

## Content and enjoyment score

| Area                                 |         Score | Current evidence and limit                                                                                                                                                                                               |
| ------------------------------------ | ------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logical correctness and fairness     |         10/20 | Strong solver, validation, catalog, reducer, and wrong-hypothesis invariants pass. The strict rubric limits representative automated samples to half credit without the full requested corpus and an independent oracle. |
| Perceived difficulty and progression |       5.75/15 | Direct-guidance counts exist, but no deduction trace proves ordered difficulty. An unstructured real-user report says 3D initially appears too difficult; the version 22 correction is not yet observed.                 |
| Narrative and clue quality           |       6.75/15 | Illustrated stories now have deterministic arcs, source-clue provenance, useful character threads, and no axis or item-tautology filler. Theme-specific dramatic progression and first-reading evidence remain.          |
| Moment-to-moment play and reward     |       9.25/15 | Tap, keyboard, drag, undo, hints, checks, dialogs, and fitted mobile journeys pass. Tests do not solve the full corpus or measure emotional reward.                                                                      |
| Replayability and variety            |        4.5/10 | One hundred structures, safe themes, seeded names, wording, and dressing provide breadth. 3D has one base structure per audience and height, and no repeat-play evidence exists.                                         |
| Inclusivity and audience fit         |        5.5/10 | Safe content, locale parity, keyboard alternatives, mobile targets, and an age-neutral collection label pass. Physical devices, screen readers, reading-level validation, and complete native review remain.             |
| Real-user validation                 |          0/15 | Qualitative product feedback is actionable but no eligible same-build cohort, protocol, confidence interval, or repeat-session study is retained.                                                                        |
| **Total**                            | **41.75/100** | **Strict evidence score: automated correctness is strong, but content calibration and enjoyment are not yet observed.**                                                                                                  |

| Collection             | Allocated score |
| ---------------------- | --------------: |
| Illustrated Adventures |        13.75/32 |
| Puzzles 2D             |           15/34 |
| Puzzles 3D             |           13/34 |

The 41.75/100 result applies the rubric's half-credit ceiling when only representative automated
samples exist. It is intentionally not raised for an implemented but unobserved fix. The next
assessment must begin with first-time three-floor easy 3D sessions, then run the full anonymous
protocol. A claim equivalent to “fun guaranteed” remains prohibited; 95-100 means strongly
evidenced enjoyment, not a universal promise.

## Commands retained

- `docker compose run --rm --build verify`: clean frozen install plus formatting, configured
  spelling, lint, icon catalog, 100-template catalog, TypeScript, 179 tests, production build,
  bundle budgets, manifest, service worker, and precache verification.
- `docker compose run --rm --build e2e`: 30 mobile journeys across Chromium, Firefox, and WebKit,
  with no retries.
- `docker compose run --rm dev pnpm run test:coverage`: all 179 tests pass with the coverage values
  above.

## Evidence required for 100

The remaining points cannot be awarded through code inspection. A same-commit assessment must add
the complete locale, desktop, incorrect, and completed screenshot corpus; keyboard and screen-reader
traces; WCAG contrast and zoom review; Android Chrome and iOS Safari install/offline journeys;
five-run Lighthouse and interaction-latency distributions; mutation testing; a runtime network
archive; and an independently maintained uniqueness oracle. Any resulting application change
requires a fresh assessment.
