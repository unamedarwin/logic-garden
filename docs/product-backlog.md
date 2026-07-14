# Product backlog

## Navigation path: implemented

- The upper journey path now moves among collection, board size, difficulty, and adventure. Each
  setup screen shows only its own decision. Adventure is a real horizontal theme picker and play
  starts only from that fourth step. The theme choice is converted to a normally replayable seeded
  puzzle, so shared links need no answer or extra theme payload. Returning to a
  picker suspends rather than clears the current puzzle, placements, timer, and challenge; moving
  forward resumes the same state.
- Every collection now has an explicit persisted and shared size choice: 4/6/8 friends for
  Children, `6 x 6`/`9 x 9`/`16 x 16` for Puzzles 2D, and 3-10 floors for Puzzles 3D. New
  installs default to four friends, `6 x 6`, and three floors; every `16 x 16` template uses
  eight people.
- Direction controls expose disabled endpoints, step buttons use `aria-current`, every target is
  at least 44 pixels, future steps cannot skip required setup decisions, and interface tests cover
  both the one-decision-per-step flow and placement restoration.
- Child easy, medium, and hard modes now differ deductively at the same 4/6/8 size: easy protects
  direct friendly clues for most friends, medium protects fewer, and hard prioritizes relations.

## Deduction grading

- Add a framework-independent deduction trace that measures forced placements, branching pressure,
  and the longest dependency chain without reading a stored answer.
- Regenerate and grade every advanced template with non-overlapping difficulty bands based on that
  trace, while keeping `6 x 6`, `9 x 9`, and `16 x 16` available at every difficulty.

## Advanced three-dimensional puzzles: published foundation

- The published model now ranges from `5 x 5 x 3` through `5 x 5 x 10`, with one accessible floor
  slice at a time, `4(d-1)` semantic homes, two shops, `14(d-1) + 10` playable room cells, eight
  people, and crossing on horizontal, vertical, and adjacent-height axes.
- The answer-free catalog reserves 16 hard building templates, one per internal audience and height.
  Runtime materialization is still checked with a two-solution limit, and height is selected
  uniformly before a template so the unequal per-height quotas do not bias play.
- The level step is now real for every height: easy ensures direct home or landmark guidance for at
  least four people, medium ensures it for at least two, and hard uses the unassisted structural
  clue set. Existing direct facts count toward those targets instead of being repeated. Every
  guided result is rerun through the solver with a two-solution limit and shares its selected level
  normally.
- The elevator, deterministic furniture and plants, local SVG rendering, shopkeeper clues, and
  blocked-cell semantics are implemented. Keep expanding building-specific social clue combinations
  only after the published mobile interaction checks remain stable. See `docs/building-system.md`.

## Catalog verification

- Materialize all 100 structures across rotating compatible themes in scheduled verification,
  checking uniqueness, node limits, localized clue rendering, and obstacle rejection without
  making the normal deployment workflow unreasonably slow.
