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

## Advanced three-dimension puzzles

- Model the optional advanced mode as three independent assignment dimensions, such as person,
  place, and carried object. Dimension lengths may differ, for example `3 x 2 x 4`.
- Extend constraints, partial evaluation, template tuples, and the solver before designing the
  renderer. Every themed puzzle must still be checked with a two-solution limit after materializing
  names, rooms, and objects.
- Prototype accessible layer or slice navigation that keeps the semantic controls usable without
  relying on a perspective-only 3D canvas. Keep this mode out of the published difficulty picker
  until mobile interaction and clue wording pass the same usability checks as the 2D mode.

## Catalog verification

- Materialize all 1,000 structures across rotating compatible themes in scheduled verification,
  checking uniqueness, node limits, localized clue rendering, and obstacle rejection without
  making the normal deployment workflow unreasonably slow.
