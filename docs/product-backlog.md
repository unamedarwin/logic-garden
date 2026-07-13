# Product backlog

## Navigation path

- Make the upper journey path interactive so players can move one step forward or backward while
  preserving the current profile, difficulty, puzzle, and in-progress placements.
- Keep the controls keyboard and screen-reader accessible, disable unavailable directions, and
  cover state restoration with route and interface tests.

## Deduction grading

- Add a framework-independent deduction trace that measures forced placements, branching pressure,
  and the longest dependency chain without reading a stored answer.
- Regenerate and grade every advanced template with non-overlapping difficulty bands based on that
  trace, while keeping `6 x 6`, `9 x 9`, and `16 x 16` available at every difficulty.

## Advanced three-dimension puzzles: published foundation

- The first model is a `5 x 5 x 3` building with three accessible floor slices, eight semantic
  home anchors, five residents, and crossing on horizontal, vertical, and height axes.
- The answer-free catalog reserves 50 hard building templates, split between teen and adult.
  Runtime materialization is still checked with a two-solution limit.
- Keep expanding building-specific social clue combinations and visual furnishing only after the
  published mobile interaction checks remain stable. See `docs/building-system.md`.

## Catalog verification

- Materialize all 1,000 structures across rotating compatible themes in scheduled verification,
  checking uniqueness, node limits, localized clue rendering, and obstacle rejection without
  making the normal deployment workflow unreasonably slow.
