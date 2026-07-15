# Content quality and enjoyment rubric

This rubric scores the editorial and play experience separately from release engineering. It covers
the Illustrated Adventures, Puzzles 2D, and Puzzles 3D collections and is worth 100 points. A technically correct
puzzle can still score poorly when its clues feel mechanical, its theme lacks coherence, or its
first screen makes the game look harder than it is.

“Fun guaranteed” is not a defensible product claim. Enjoyment is subjective and can only be
supported by observed behavior from the intended audience. A score from 95 to 100 means strongly
evidenced enjoyment under the protocol below; it never means that every player will have fun.

## Required content corpus

- Materialize every theme at every compatible size and difficulty with fixed, recorded seeds.
- Render every clue in all supported locales. Review the structured fact, icon token, room or place,
  and final sentence together.
- Include first-play, partially solved, wrong-hypothesis, hint-assisted, and completed states.
- Inspect all 3D heights from 3 through 10, with particular attention to the three-floor easy entry
  game and the first decision on each floor.
- Retain the seed, generator version, collection, size, difficulty, locale, reviewer score, and
  anonymized observation. Do not retain names, recordings, account identifiers, or personal data.

## Scoring

Each dimension is split by public collection so a strong 2D result cannot hide a weak 3D or child
experience. Reviewers may award quarter points.

| Area                                 | Illustrated Adventures |     2D |     3D |   Total | Full-score observable evidence                                                                                                                                                                         |
| ------------------------------------ | ---------------------: | -----: | -----: | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logical correctness and fairness     |                      5 |      7 |      8 |      20 | An independent solver plus at least 100 seeds per theme, difficulty, and size or height cell confirm uniqueness, clue truth, checking, hints, persistence, blocked cells, and normal wrong hypotheses. |
| Perceived difficulty and progression |                      5 |      5 |      5 |      15 | Deduction traces measure forced moves, branching, and dependency chains while size is controlled; target players confirm ordered challenge without frustration cliffs.                                 |
| Narrative and clue quality           |                      5 |      5 |      5 |      15 | Facts are clear and natural, landmarks and icons match, objects appear only when relevant, roles and motivations fit the theme, and target players paraphrase at least 90% correctly.                  |
| Moment-to-moment play and reward     |                      5 |      5 |      5 |      15 | Complete start-to-solve journeys succeed with touch, keyboard, and assistive technology; wrong guesses, hints, checking, progress, and completion feel clear, responsive, and rewarding.               |
| Replayability and variety            |                      3 |      4 |      3 |      10 | Structural and perceptual novelty is measured across repeated seeds; near-duplicate exposure stays low and repeat players willingly start and complete more puzzles.                                   |
| Inclusivity and audience fit         |                      4 |      3 |      3 |      10 | Reading level, age fit, physical-device accessibility, and native review of every active locale pass without material cohort or locale disadvantage.                                                   |
| Real-user validation                 |                      5 |      5 |      5 |      15 | Same-build preregistered studies cover every collection, difficulty, and intended audience, followed by a repeat-session cohort with the thresholds below.                                             |
| **Total**                            |                 **32** | **34** | **34** | **100** | No collection may borrow unused points from another collection.                                                                                                                                        |

## Evidence caps

- A non-unique puzzle, trusted answer, false completion, prohibited content, or privacy breach caps
  the total at 49.
- An unresolved touch, keyboard, or screen-reader completion blocker caps the total at 59.
- Without eligible target-player evidence, real-user validation scores zero and the total is capped
  at 69.
- If a public collection is omitted, or Illustrated Adventures is not tested with children under an appropriate
  external consent process, the total is capped at 79.
- Without an objective deduction trace and observed difficulty calibration, the total is capped at 84.
- Without repeat-session evidence, the total is capped at 89.
- Without physical-device accessibility and native review across every active locale, the total is capped at 94.
- A representative seed sample earns at most half of an area that requires the complete content
  corpus. A locale without native editorial review earns at most half of its language contribution.
- An unresolved report that a collection appears too difficult limits that collection's perceived
  difficulty score to 2/5. The lowest applicable cap always wins.

## Anonymous playtest protocol

1. Test at least 30 first-time players per collection, including at least 10 per difficulty. Advanced
   studies must include both adolescent and adult audiences. Child participation and guardian
   consent are managed by the external research process; the app stores no identity or consent data.
2. Test Illustrated Adventures, Puzzles 2D, and Puzzles 3D independently; do not average away a weak collection.
3. Begin with the default easy and smallest-size setup before testing medium, hard, or larger sizes.
4. Do not explain the rules until the participant either makes a first intentional placement or asks
   for help. Record time to select a collection, time to first meaningful move, help requests, undo,
   hint, check, completion, and voluntary replay.
5. Ask four short post-session questions: perceived difficulty, clue clarity, enjoyment, and whether
   the player wants another puzzle. Use a five-point scale plus one optional free-text comment.
6. Require at least 95% unassisted setup, at least 90% clue-paraphrase accuracy, no critical blocker,
   monotonically ordered challenge ratings, and at least 70% replay intent. The lower bound of the
   95% confidence interval for enjoyment must be at least 3.8/5.
7. For the 3D entry game, require at least 85% to identify that only one floor is played at a time,
   at least 80% to make a justified first placement within 120 seconds, and no recurring confusion
   between floor switching and piece placement.
8. Retest at least 15 returning players per collection after 7 to 14 days and measure voluntary
   replay and completion. Research remains external and anonymous; do not add product telemetry.
9. Two reviewers score the content independently. A third resolves any area difference greater than
   two points. Any content change invalidates affected observations and requires a focused rerun.

## Interpretation

|  Score | Interpretation                                                               |
| -----: | ---------------------------------------------------------------------------- |
|   0–59 | Promising foundation, but important content or audience evidence is missing. |
|  60–74 | Playable content with material editorial or validation gaps.                 |
|  75–84 | Release-ready with known content gaps; enjoyment is not yet validated.       |
|  85–94 | Engaging and well-evidenced across collections, with limited residual gaps.  |
| 95–100 | Strongly evidenced content quality and enjoyment across the full protocol.   |

The current evidence-based score belongs in `docs/quality-assessment.md`. This rubric must remain
stable between assessments so points come from better content and stronger evidence rather than
easier criteria.
