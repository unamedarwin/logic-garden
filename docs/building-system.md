# Building puzzle system

The optional advanced building puzzle is a semantic `5 x 5 x 3` board. It uses three
accessible floor slices instead of a perspective-only canvas, so every destination remains a
normal DOM control for touch, mouse, and keyboard players.

## Geometry

- The building contains 75 visual cells: 25 cells on each of three floors.
- The ground floor contains two shops, an entrance, a landing, and the stair core.
- The first and second floors contain four homes, a landing, and the stair core.
- Only eight reviewed home anchors are solver destinations. Five residents are assigned to five
  of those anchors; all other cells are blocked semantic scenery.
- Shops, entrance cells, landings, stairs, and non-anchor home cells are rejected by the
  generator, solver, reducer, and accessible controls.
- Each floor is a complete orthogonal partition. Units touch along shared walls and never overlap
  or leave a gap.

The logical axes are column (`x`), row (`y`), and floor (`z`). On one floor, occupied anchors
conflict across the complete row and column. At the same row and column, the height conflict reaches
only the immediately adjacent floor above and below. This local-neighbor rule keeps the deduction
load bounded when later plans grow beyond three floors.

## Doors

Doors are wall fixtures rather than cell objects. A local Lucide `DoorOpen` icon is centered on a
shared boundary between a home or shop and its landing, stair, or entrance route. It is rendered
above the floor art with `pointer-events: none`, does not consume either adjacent cell, and cannot
be selected as a destination. The same boundary-fixture rule is used for doors on spatial 2D
plans.

## Clues

Building clues are structured facts localized only by the interface. The current families cover:

- exact home and floor;
- neighbors on the same landing;
- directly above or below another resident;
- the same or a different floor;
- a visible corner or a non-corner home;
- carried items used as social scene details.

Corner clues are supporting variety, not the main deduction vocabulary. Copy pairs the precise
fact with a short positive action or motivation and avoids steps, distances, rows, columns, and
bare coordinates. Catalan, Spanish, and English use the same structured clue data.

## Generation and persistence

Generator version 13 selects the plan, structural template, residents, objects, and wording from
seeded streams. The answer-free template catalog contains 950 spatial structures and 50 building
structures, split equally between teen and adult audiences. Runtime materialization always reruns
the solver with a two-solution limit before a puzzle is shown.

Share payload schema 4 records the `cube` variant; saved-game schema 4 validates board shape,
generator version, partial placements, and uniqueness before restoration. Neither format stores a
solution or profile data.

## Quality gates

- Assert exactly three layers, 75 visual cells, eight playable anchors, and five residents.
- Assert that all generated assignments are unique, obey complete same-floor row/column lines, and
  apply height conflicts only to immediately neighboring floors.
- Verify that blocked building cells are never accepted by generation, solving, reducer actions,
  or semantic controls.
- At `390 x 844`, inspect every floor with an empty board and a placed resident. Doors must remain
  centered on boundaries, cells and avatars must share one origin, and fit mode must not introduce
  horizontal or vertical board panning.
- Keep the mobile fit-mode cells at least 44 CSS pixels wide. Compact floor previews before making
  semantic destinations too small, and describe the eight playable homes instead of calling all 75
  visual cells options.
- At the same viewport, the contextual clue rail must end above the fixed action rail for both short
  and wrapped clue copy; a floor preview tab must remain at least 44 CSS pixels high.
- Verify floor switching, contextual clues, click placement, keyboard placement, dragging an
  already placed resident, exact drop preview, crossing on all three axes, and return navigation.
