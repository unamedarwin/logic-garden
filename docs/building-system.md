# Building puzzle system

The Puzzles 3D collection uses a semantic `5 x 5 x d` building, where seeded height `d` ranges
from 3 through 10. It presents one accessible floor slice at a time, so every destination remains
a normal DOM control for touch, mouse, and keyboard players. A compact elevator changes floors
without turning the board into a perspective-only canvas.

## Geometry

- The building contains `25d` visual cells: 25 cells on each of 3 to 10 floors.
- The ground floor contains shops, an entrance, a landing, and the stair core.
- Every upper floor contains four homes, shared landings, and the stair core.
- The `4(d-1)` semantic homes expose `14(d-1)` playable cells and the two shops expose 10 playable
  cells. Every game places two shopkeepers on the ground floor and six residents across at most five
  residential floors. Buildings above six floors deliberately keep some floors without residents.
- Entrances, landings, stairs, and `6d` curated furniture cells are rejected by the generator, solver,
  reducer, and accessible controls. Every blocked room cell has a visible object; every visually
  empty room cell is a real candidate, whether or not it belongs to the final solution.
- Each floor is a complete orthogonal partition. Units touch along shared walls and never overlap
  or leave a gap.

The logical axes are column (`x`), row (`y`), and floor (`z`). On one floor, occupied anchors
conflict across the complete row and column. At the same row and column, the height conflict reaches
only the immediately adjacent floor above and below. Non-adjacent floors remain independent, which
keeps the deduction load bounded if the model grows taller.

Crossed anchors communicate that an existing placement conflicts with that destination; they do not
form a dead end. Choosing one gives the new placement priority, returns every conflicting person to
the waiting rail, announces the change, and records the whole operation as one reversible move.

## Elevator and scenery

The elevator is visually independent from the active-floor frame, leaving the full mobile width for
the `5 x 5` plan. It exposes floor buttons in ascending order from `PB` to the selected top floor,
with lower-floor and upper-floor controls at the corresponding ends on wider screens. The active
floor, placed-person count, and
disabled limits are available without color, and arrow-key floor switching follows the same
non-wrapping order. Switching floors never changes placements or timer state.

Blocked cells use deterministic furniture, storage, plants, and shop fixtures from the same local
Fluent SVG subset as the rest of the scene. The selection is seeded by the puzzle, respects each
space type, remains behind the semantic controls, and never uses an icon carried by a person.
Stairs stay visually clear, shared routes use sparse decoration, and decorations do not become
solver objects or destinations.

Every blocked home and shop fixture stores its structured icon key and catalog label on the
corresponding position. Exact clues render that same icon and localized label; they never replace a
missing landmark with the room name.

The reducer accepts any structurally valid placement on the `14(d-1) + 10` free cells. Clue truth is checked
only by `Comprovar`, the solver, and hints, so an incorrect hypothesis remains movable, undoable, and
persisted across reloads.

## Doors

Doors are wall fixtures rather than cell objects. A local Lucide `DoorOpen` icon is centered on a
shared boundary between a home or shop and its landing, stair, or entrance route. It is rendered
above the floor art with `pointer-events: none`, does not consume either adjacent cell, and cannot
be selected as a destination. The same boundary-fixture rule is used for doors on spatial 2D
plans. Every door glyph remains upright regardless of whether its boundary is horizontal or
vertical; only its center position changes, because rotating the pictogram makes it harder to
recognize. When a shared boundary offers multiple valid positions, the seeded layout first avoids
room titles and then prefers cells without gameplay objects or placed people. A room title retains
visual priority on a short boundary where the two fixtures cannot be separated.

## Clues

Building clues are structured facts localized only by the interface. The current families cover:

- exact homes, shops, and floors;
- shop opening, neighborhood service, and window-display details;
- neighbors on the same landing;
- directly above or below another resident;
- the same or a different floor;
- a visible corner or a non-corner home;
- carried items used as social scene details.

Corner clues are supporting variety, not the main deduction vocabulary. Copy pairs the precise
fact with a short positive action or motivation and avoids steps, distances, rows, columns, and
bare coordinates. Catalan, Spanish, English, Basque, Galician, French, and German use the same
structured clue data.

## Generation and persistence

Generator version 18 selects the height, plan, structural template, people, objects, furniture, and
wording from seeded streams. The answer-free template catalog contains 950 spatial structures and
50 building structures. The building subset contains 25 teen-themed and 25 adult-themed internal
content structures while the player sees one unified 3D collection. Runtime materialization always
reruns the solver with a two-solution limit before a puzzle is shown.

Share payload schema 4 records the `cube` variant; the seed and generator version reproduce its
height without duplicating it in the URL. New JSON payloads are GZIP-compressed before URL-safe
Base64 encoding and retain legacy uncompressed read compatibility. Saved-game schema 4 validates
all `25d` canonical coordinates, room kinds, blocked fixtures, playable counts, eight people,
generator version, partial placements, and uniqueness before restoration. Neither format stores a
solution or personal data.

The in-game action rail exposes a native share action before completion. Its URL reproduces the
current seed, audience, difficulty, variant, and generator version for testing or challenging
someone, but deliberately omits placements and the answer.

## Quality gates

- Assert every height from 3 through 10, `25d` visual cells, `14(d-1) + 10` playable room cells,
  `6d` blocked room fixtures, and eight people.
- Assert that every solution uses one cell in each shop, contains six home cells, covers every
  residential floor only when `d <= 6`, occupies at most five residential floors otherwise,
  includes a real adjacent-floor relation, obeys complete same-floor row/column
  lines, and applies height conflicts
  only to immediately neighboring floors.
- Verify that blocked building cells are never accepted by generation, solving, reducer actions,
  or semantic controls.
- Verify that every blocked home or shop cell renders furniture, every furniture-free room cell is
  enabled, and a known clue-incorrect placement survives reducer and persistence round trips.
- At `390 x 844`, inspect every floor with an empty board and a placed person. The title, timer,
  instruction, and fit/zoom controls must share compact rows above the detached elevator. Doors must remain
  centered on boundaries, cells and avatars must share one origin, and fit mode must not introduce
  horizontal or vertical board panning.
- Keep mobile fit-mode cells at least 44 CSS pixels wide. The elevator and contextual clue rail must
  remain above the fixed action rail, including with wrapped clue copy.
- Verify every elevator destination for representative 3-, 6-, and 10-floor seeds, contextual
  clues, click placement, keyboard placement,
  dragging an already placed person, exact drop preview, crossing on all three axes, and return
  navigation. A non-adjacent floor at the same row and column must remain available.
- Reject furniture that covers a label, door, person, destination, or carried-item icon.
