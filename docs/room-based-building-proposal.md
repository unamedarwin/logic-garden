# Room-based 3D building proposal

## Verdict

The proposal is viable and is a strong candidate for a more approachable 3D entry mode. Keep the
existing floor plan, elevator, walls, doors, textures, and furniture, but separate visual cells from
logical destinations. In room mode, one whole home or shop is one destination, no matter where the
player taps or drops inside it.

This should be an explicit `Rooms` submode marked as recommended, while the current `Cells` submode
remains advanced. Do not silently change the rules only because the player selected Easy: size,
difficulty, and placement scale must remain understandable and independently shareable.

## Player rules

- Every residential floor exposes four homes and the ground floor exposes two shops.
- A building of depth `d` therefore has `2 + 4(d - 1)` room destinations. At three floors, eight
  people occupy eight of ten destinations.
- One person occupies one whole room. Clicking or dropping anywhere in that room resolves to the
  same canonical room assignment.
- A room can contain at most one person in the first version. Supporting housemates later requires
  an explicit room-capacity model and must not be simulated by assigning two people to one position.
- The current same-floor row and column crossing rule does not apply. Moving between different
  rooms never removes another person merely because their visual cells share an axis.
- Deduction comes from room facts: same or different floor, neighboring doors, the home immediately
  above or below, corner homes, exact homes, and ground-floor shop roles.
- Wrong room hypotheses remain legal. Checking reports overall progress without moving a person.

## Domain design

Keep `boardMode: 'logic-cube'` and `PuzzleVariant: 'cube'` because both 3D modes share the building
renderer and elevator. Add exactly one discriminant, `buildingPlacement: 'rooms' | 'cells'`, to the
puzzle and challenge metadata. Do not add a second room-specific variant that could contradict it.
Links, history, and saved games must persist this field explicitly.

Add pure building helpers that derive one canonical destination per home or shop from
`buildingUnitId` and `layer`. The complete `25d` position map remains available for visual geometry,
materials, furniture, doors, and walls, but a shared candidate selector returns only canonical room
destinations in room mode. The solver, reducer, validation, hints, persistence validation, and DOM
must all consume that selector rather than independently filtering every unblocked cell.

Centralize both decisions in pure helpers such as `placementDestinations(puzzle)` and
`placementsConflict(puzzle, first, second)`. Cell mode keeps its current axis conflicts; room mode
conflicts only when two people claim the same room. No caller may reimplement these rules.

In room mode, partial-assignment validity enforces unique rooms but skips `shareCubeAxisLine`.
Relationship clues continue to use `buildingUnitsAreNeighbors`, `isBuildingAbove`, and floor data.
This keeps the solver framework-independent and avoids special UI-only rules.

## Rendering and interaction

Reuse the current graphical component and all its scene layers. Hide only the visible cell grid,
cell crosses, and individual cell targets; keep the current walls, doors, continuous floor textures,
furniture, elevator, labels, and avatars. Render one semantic button per home or shop as a transparent
room overlay derived from the same unit-cell map as the walls. Orthogonal room outlines can use a
traced local polygon while the keyboard and screen-reader surface remains a normal button.

- Highlight the entire room on selection and drag, not one cell. The highlight follows the room
  outline without drawing internal grid lines.
- Center the avatar on a deterministic, label-safe room anchor.
- Keep furniture and blocked fixture cells visible but non-interactive.
- Give each room one accessible name and one tab stop; do not expose several identical cell buttons
  for the same room.
- Preserve click, keyboard, drag, undo, redo, hint, and return-to-tray parity.
- Keep doors upright and use them as visual support for neighboring-room clues.

## Generation and templates

Generate room assignments and room-level clue tuples independently from cell assignments, then
verify uniqueness with a solver limit of two. Room-mode clues must not be produced by merely
removing coordinates from an existing sentence: projection can make a previously unique cell puzzle
ambiguous.

The 100-entry catalog does not need to grow. Each of the existing 16 audience/height building
structures can carry a second answer-free room-clue set derived during offline generation. It still
stores no answer, names, localized phrases, concrete objects, or personal data. Canonical identity
must include both clue sets, and runtime theme application reruns the appropriate solver.

Easy, Medium, and Hard remain available at every height inside each submode. Difficulty should be
graded from forced room placements, branching pressure, and dependency-chain length, not from the
height or the number of visual cells.

## Setup and compatibility

Add one conditional journey decision after selecting Puzzles 3D:

- `Per estances · recomanat` / `Rooms · recommended`
- `Per caselles · avançat` / `Cells · advanced`

Then retain the independent height, difficulty, and adventure steps. A future implementation needs
a new generator version, share payload schema, saved-game schema, preference field, and history
field. Legacy `cube` links without `buildingPlacement` resolve explicitly to `cells`; new room links
declare `buildingPlacement: 'rooms'` and still contain no answer.

## Implementation slices

1. Add the placement discriminant, canonical room targets, shared candidate selector, and pure
   solver/reducer tests without changing the interface.
2. Generate answer-free room clue sets for every audience and height, add deduction traces, and
   rerun uniqueness checks for all difficulties.
3. Add room overlays, whole-room drag previews, accessible keyboard targets, and the conditional
   setup step.
4. Version sharing, persistence, history, and challenge restoration; retain legacy cell links.
5. Run the complete Docker and three-engine mobile matrix, then first-time player tests before
   awarding perceived-difficulty or enjoyment points.

## Required regression tests

- Exactly `2 + 4(d - 1)` room targets for every height from 3 through 10.
- Eight people, unique room assignments, two shops, six homes, and one unique solution in every
  audience, difficulty, and height bucket.
- Two visual cells in one room resolve to the same assignment; cells in different rooms never
  conflict solely by row or column.
- Room replacement, wrong hypotheses, undo, persistence, checks, and hints preserve current player
  agency rules.
- Whole-room pointer preview and final assignment agree; every room has one keyboard target.
- Shared and restored games reproduce placement scale, height, difficulty, audience, theme, and
  seed exactly.
- Three-, six-, and ten-floor mobile journeys pass in Chromium, Firefox, and WebKit with no hidden
  room, label, clue, or action.

The main engineering risk is the semantic whole-room interaction layer, especially non-rectangular
orthogonal rooms. The solver change is moderate because current room identifiers and relationship
helpers already exist. The main product risk is calibration: this mode must still require deduction
rather than becoming a sequence of direct placements.
