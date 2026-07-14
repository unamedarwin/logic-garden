# Product backlog

## Navigation path

- Make the upper journey path interactive so players can move one step forward or backward while
  preserving the current collection, difficulty, puzzle, and in-progress placements.
- Keep the controls keyboard and screen-reader accessible, disable unavailable directions, and
  cover state restoration with route and interface tests.

## Deduction grading

- Add a framework-independent deduction trace that measures forced placements, branching pressure,
  and the longest dependency chain without reading a stored answer.
- Regenerate and grade every advanced template with non-overlapping difficulty bands based on that
  trace, while keeping `6 x 6`, `9 x 9`, and `16 x 16` available at every difficulty.

## Advanced three-dimensional puzzles: published foundation

- The published model now ranges from `5 x 5 x 3` through `5 x 5 x 10`, with one accessible floor
  slice at a time, `4(d-1)` semantic homes, two shops, `14(d-1) + 10` playable room cells, eight
  people, and crossing on horizontal, vertical, and adjacent-height axes.
- The answer-free catalog reserves 50 hard building templates, split between teen and adult.
  Runtime materialization is still checked with a two-solution limit, and height is selected
  uniformly before a template so the unequal per-height quotas do not bias play.
- The elevator, deterministic furniture and plants, local SVG rendering, shopkeeper clues, and
  blocked-cell semantics are implemented. Keep expanding building-specific social clue combinations
  only after the published mobile interaction checks remain stable. See `docs/building-system.md`.

## Catalog verification

- Materialize all 1,000 structures across rotating compatible themes in scheduled verification,
  checking uniqueness, node limits, localized clue rendering, and obstacle rejection without
  making the normal deployment workflow unreasonably slow.
