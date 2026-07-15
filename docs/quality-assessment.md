# Release quality assessment

Assessed release candidate: generator version 23 (`2026-07-15`). The assessment covers the current
worktree and becomes immutable only when the verified files are committed together. Technical and
content quality remain separate scores; neither can substitute for the other.

## Technical evidence score

| Area                                   |      Score | Reproducible evidence and limits                                                                                                                                                                                                                    |
| -------------------------------------- | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Puzzle correctness and uniqueness      |      17/22 | The 100 answer-free templates, 288 public combinations, deterministic replay, geometry, wrong hypotheses, hints, checking, persistence, and limit-two uniqueness checks pass. A second independent oracle and large samples per combination remain. |
| Mobile usability and accessibility     |       9/18 | Tap, keyboard, drag, focus, fitted boards, and 44 px elevator controls pass at the retained mobile viewport. Desktop, physical devices, screen readers, contrast, and zoom audits remain.                                                           |
| Visual quality and alignment           |       5/12 | Thirty-three Chromium, Firefox, and WebKit journeys cover child 4/6/8, 2D 6/9/16, and 3D 3/6/10 states. Pixel baselines and complete label/object/door collision detection remain.                                                                  |
| Active localisation                    |      10/14 | Catalan is the only active locale. Browser detection and stored inactive locales migrate to `ca`; the selector is hidden; Catalan spelling, composition, and clue-readability checks pass. Independent native review remains.                       |
| PWA, offline, sharing, and persistence |       6/12 | Installable output, service worker, offline precache, GZIP/Base64 and legacy shares, corrupt input, history, challenge, and state retention pass. Physical Android/iOS offline journeys remain.                                                     |
| Performance                            |        3/8 | Checked-in bundle and complete-`dist` budgets pass. Retained Lighthouse, interaction latency, and representative p95/p99 generation distributions remain.                                                                                           |
| Security, privacy, and content         |        4/6 | Static rules cover prohibited content, payload bounds, local assets, secrets, and production dependencies. Runtime network and full license audits remain.                                                                                          |
| Automated regression and release       |        5/8 | Frozen Docker verification passes 189 tests; V8 coverage passes all four thresholds; 33 no-retry browser journeys pass. Mutation testing, visual baselines, and longitudinal flakiness evidence remain.                                             |
| **Total**                              | **59/100** | Strict reproducible score for the current release candidate.                                                                                                                                                                                        |

## Content and enjoyment score

| Area                                 |      Score | Current evidence and limit                                                                                                                                                                                                                                   |
| ------------------------------------ | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logical correctness and fairness     |      10/20 | Solver, reducer, validation, catalog, wrong-hypothesis, and full generated-combination checks pass. The rubric applies half credit without 100 seeds per combination and an independent oracle.                                                              |
| Perceived difficulty and progression |    9.25/15 | Size and difficulty are independent and the deduction trace measures local pressure. It still follows a solved branch when local deduction stalls, and the unresolved report that 3D appears difficult limits 3D to 2/5.                                     |
| Narrative and clue quality           |   11.25/15 | Mystery, objective, and ending use explicit compatibility tables. Catalan directional actions are coherent, the objective names the placement task, and decorative clue prefixes and role repetition are removed. Target-player paraphrase evidence remains. |
| Moment-to-moment play and reward     |   11.25/15 | Tap, keyboard, drag, undo, hint, check, progress, sharing, and completion mechanics pass. Emotional reward and complete start-to-solve behavior are not observed with target players.                                                                        |
| Replayability and variety            |    7.25/10 | One hundred structures, safe themes, seeded dressing, six incidents, three premises, and at least 55 coherent signatures per 100 story seeds pass. Repeat-session behavior remains unknown.                                                                  |
| Inclusivity and audience fit         |       7/10 | Safe content, an age-neutral illustrated collection, Catalan editorial gates, keyboard alternatives, and mobile controls pass. Physical accessibility and audience reading-level studies remain.                                                             |
| Real-user validation                 |       0/15 | No eligible same-build cohort, confidence interval, or repeat-session study is retained. Fun is not validated.                                                                                                                                               |
| **Total**                            | **56/100** | Strict automated and editorial evidence score; it is capped by missing external validation.                                                                                                                                                                  |

| Collection             | Allocated score |
| ---------------------- | --------------: |
| Illustrated Adventures |         19.5/32 |
| Puzzles 2D             |        20.25/34 |
| Puzzles 3D             |        16.25/34 |

## Reproduced commands

- `docker compose --profile tools run --rm --build verify`: formatting, Catalan spelling, lint,
  icon and 100-template checks, TypeScript, 189 tests including the 288-combination content corpus,
  production build, bundle budgets, manifest, service worker, and offline precache pass.
- `docker compose --profile tools run --rm verify pnpm run test:coverage`: 189 tests pass and the
  checked-in minimums of 84% statements, 78% branches, 84% functions, and 86% lines are met.
- `docker compose --profile tools run --rm --build e2e`: 33 no-retry mobile journeys pass in
  Chromium, Firefox, and WebKit.

## Remaining evidence

The score cannot honestly reach 100 through more internal assertions alone. The largest remaining
automatable gaps are an independent constraint oracle, visual pixel baselines and collision checks,
desktop and complete-state E2E journeys, mutation testing, Lighthouse distributions, and runtime
network evidence. Physical Android/iOS installation, screen-reader review, native Catalan review,
and the anonymous target-player protocol require external evidence. Enjoyment remains unvalidated
until that protocol passes on the exact release build.
