# Building puzzle system

The Puzzles 3D collection uses a semantic `5 x 5 x 5` building. It presents one accessible floor
slice at a time, so every destination remains a normal DOM control for touch, mouse, and keyboard
players. A compact elevator changes floors without turning the board into a perspective-only canvas.

## Geometry

- The building contains 125 visual cells: 25 cells on each of five floors.
- The ground floor contains shops, an entrance, a landing, and the stair core.
- Floors one through four contain homes, shared landings, and the stair core.
- Sixteen reviewed home anchors are solver destinations. Eight residents occupy eight of those
  anchors; all other cells are blocked semantic scenery.
- Shops, entrances, landings, stairs, and non-anchor home cells are rejected by the generator,
  solver, reducer, and accessible controls.
- Each floor is a complete orthogonal partition. Units touch along shared walls and never overlap
  or leave a gap.

The logical axes are column (`x`), row (`y`), and floor (`z`). On one floor, occupied anchors
conflict across the complete row and column. At the same row and column, the height conflict reaches
only the immediately adjacent floor above and below. Non-adjacent floors remain independent, which
keeps the deduction load bounded if the model grows taller.

## Elevator and scenery

The elevator is visually independent from the active-floor frame, leaving the full mobile width for
the `5 x 5` plan. It exposes floor buttons in ascending `PB, 1, 2, 3, 4` order, with lower-floor and
upper-floor controls at the corresponding ends. The active floor, placed-resident count, and
disabled limits are available without color, and arrow-key floor switching follows the same
non-wrapping order. Switching floors never changes placements or timer state.

Blocked cells use deterministic furniture, storage, plants, and shop fixtures from the same local
Fluent SVG subset as the rest of the scene. The selection is seeded by the puzzle, respects each
space type, remains behind the semantic controls, and never uses an icon carried by a resident.
Stairs stay visually clear, shared routes use sparse decoration, and decorations do not become
solver objects or destinations.

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

Generator version 14 selects the plan, structural template, residents, objects, furniture, and
wording from seeded streams. The answer-free template catalog contains 950 spatial structures and
50 building structures. The building subset contains 25 teen-themed and 25 adult-themed internal
content structures while the player sees one unified 3D collection. Runtime materialization always
reruns the solver with a two-solution limit before a puzzle is shown.

Share payload schema 4 records the `cube` variant; saved-game schema 4 validates the 125-cell board,
16 home anchors, eight residents, generator version, partial placements, and uniqueness before
restoration. Neither format stores a solution or personal data.

## Quality gates

- Assert exactly five layers, 125 visual cells, 16 playable anchors, and eight residents.
- Assert that all generated assignments are unique, cover every residential floor, include a real
  adjacent-floor relation, obey complete same-floor row/column lines, and apply height conflicts
  only to immediately neighboring floors.
- Verify that blocked building cells are never accepted by generation, solving, reducer actions,
  or semantic controls.
- At `390 x 844`, inspect every floor with an empty board and a placed resident. The title, timer,
  instruction, and fit/zoom controls must share compact rows above the detached elevator. Doors must remain
  centered on boundaries, cells and avatars must share one origin, and fit mode must not introduce
  horizontal or vertical board panning.
- Keep mobile fit-mode cells at least 44 CSS pixels wide. The elevator and contextual clue rail must
  remain above the fixed action rail, including with wrapped clue copy.
- Verify all five elevator destinations, contextual clues, click placement, keyboard placement,
  dragging an already placed resident, exact drop preview, crossing on all three axes, and return
  navigation. A non-adjacent floor at the same row and column must remain available.
- Reject furniture that covers a label, door, resident, destination, or carried-item icon.
