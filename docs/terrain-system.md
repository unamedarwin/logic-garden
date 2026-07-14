# Advanced terrain system

Advanced boards combine architecture, seamless local textures, sparse decorative motifs, fixed
scene objects, and semantic DOM controls. These layers are independent: a spatial plan contains
geometry only, while the seeded puzzle selects the theme, material treatment, objects, and wording.
Each advanced theme also defines six place-specific object subsets. A fixed scene object must be
valid for the room that contains it; global random object assignment is not allowed.

## Material catalog

Every material uses three square, repeatable SVG layers bundled into the application. The catalog
uses bespoke local material drawings with deliberately different scale, geometry, and contrast for
each surface. Water alone also keeps a very subtle adapted Hero Patterns bubble layer; no common
micro-grid is shared across the catalog, so parquet, stone, rubber, turf, and the other surfaces do
not collapse into palette swaps. The PWA never fetches scene art at runtime.

| Material        | Intended use                                                 |
| --------------- | ------------------------------------------------------------ |
| Parquet         | Reading rooms, studios, workshops, and indoor market areas   |
| Mosaic          | Cafes, circulation areas, creative rooms, and market stalls  |
| Carpet          | Quiet reading, recording, and lounge spaces                  |
| Rubber          | Sports and rehearsal areas that need a dense resilient floor |
| Cork            | Workshops, classrooms, and warm acoustic rooms               |
| Grass           | Gardens and outdoor community spaces                         |
| Soil            | Planting beds and compost work areas                         |
| Stone           | Paths, garden edges, courtyards, and robust market floors    |
| Sand            | Outdoor stalls and informal activity areas                   |
| Water           | Blocked pond patches only; never a complete playable room    |
| Concrete        | Labs, service areas, and contemporary shared spaces          |
| Metal           | Technical booths and equipment areas                         |
| Stage           | Rehearsal and performance spaces                             |
| Artificial turf | Teen sports scenarios and all-weather activity zones         |

The texture phase is aligned to the full board. Adjacent cells therefore show a continuous surface
instead of restarting the pattern at every cell or room edge.

## Seeded detail

For each room, the seeded PRNG chooses an exact proportion between 25% and 75% of its unblocked
cells. Only those cells receive a small Lucide motif. Material-specific catalogs constrain motif,
scale, position, and rotation, while every `MotifId` has its own semantic three-color palette: flowers
use petal colors, shells use warm mineral colors, bolts use cool metal colors, and water droplets use
blue water colors. The seeded color choice therefore cannot make every extra element look like the
same generic mark. Motifs occupy 30-46% of one cell and use transparent line art without a token
background, so density differences remain visible without resembling playable pieces. Blocked cells
and untouched cells receive no decorative motif.

The same generator version, difficulty, audience, spatial plan, and seed must reproduce the same
composition. Runtime randomness, CSS randomness, remote generation, and unseeded object placement
are not allowed.

## Garden pond

The pond is terrain and an obstacle at the same time. The pond room itself uses a playable shore or
paved texture. Inside that room, the generator replaces ordinary fixed objects with one contiguous
orthogonal water patch:

| Board   | Water cells |
| ------- | ----------: |
| 6 x 6   |           1 |
| 9 x 9   |           2 |
| 16 x 16 |           4 |

Every water cell is rejected by generation, solving, reducers, pointer interaction, and keyboard
interaction. The visual layer paints one aligned water texture over those cells, while the object
layer uses only curated pond objects such as a water lily, drop, frog, or duck. Playable character
anchors remain on the shore beside a visible pond object.

The renderer derives the pond perimeter from orthogonal water-cell adjacency. Shared water-to-water
edges stay open. Only water-to-land edges receive a continuous repeated stone rim, including outer
corners, so the cluster reads as one pond instead of several framed blue tiles.

The 1/2/4-cell blocked cluster is structural plan geometry and therefore exists in every advanced
theme. Other themes fill the same cells with their own ordinary fixed objects. Only the city garden
renders the cluster as water. This keeps answer-free structural templates independent from runtime
theme selection.

## Shared geometry and labels

Pixi walls, room textures, pond patches, motifs, fixed objects, semantic cells, drop previews, and
avatars all use one square interior surface. The normalized plan catalog is never painted directly.
For `6 x 6`, `9 x 9`, or `16 x 16`, the renderer samples the already assigned room of every cell and
traces that complete map back into orthogonal polygons. The result covers the full surface, places
every wall on a cell edge, and preserves every logical room assignment.

Room titles are plaques attached to horizontal wall segments. Candidate placement accounts for
the actual label box, fixed object boxes, occupied character boxes, other labels, and board bounds.
The plaque prefers the room-facing side; an internal wall may use its other free side when that is
the only collision-free placement. Object and avatar centers are derived directly from the same
row and column center used by the semantic drop target.

## Layer order and QA

The visual stack is floor plan, room texture, terrain patch, sparse motifs, walls and labels, fixed
objects, crossed cells, and placed characters. The semantic HTML grid stays above decorative PixiJS
and SVG layers.

Room-label collision boxes use the narrow fitted mobile board as their reference. This is the
worst case for 16 x 16 labels because the minimum font size remains fixed while the percentage
label width shrinks. The planner reserves the complete wrapped height before choosing a wall
segment; desktop layouts may gain whitespace but must never lose the mobile collision margin.

After a terrain change, inspect teen and adult boards at 390 x 844 for 6 x 6, 9 x 9, and 16 x 16,
both empty and with a character placed. Reject flat rooms, broken pattern continuity, decorative
marks that resemble game pieces, clipped labels, tiny or duplicated objects, water gaps, blocked
cells that accept a character, artwork that hides a touch target, or a fixed action rail that
overlaps the selected person's contextual clue.
During an active drag, one continuous top-layer grid traces every row and column from the same
board variables as the semantic cells. It cannot be interrupted or recolored by room textures,
labels, objects, crossed cells, or avatars. Valid semantic cells receive a separate light wash;
blocked and occupied cells remain distinct, and the hidden source token must not interrupt the
grid. Measure fixed-object and avatar centers against their `data-grid-position` cell when
reviewing alignment.
