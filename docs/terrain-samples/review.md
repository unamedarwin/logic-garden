# Terrain sample review

Review date: 2026-07-14. Each 744 x 312 PNG was inspected individually at original resolution, then
compared in `atlas.png`. The three panels intentionally keep the same seamless base material and
vary seeded motif occupancy, position, icon, semantic motif color, scale, and rotation. Motif colors
come from a fixed palette per element rather than from one shared material color list.

| Material        | Individual review                                                                                                              | Result |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Artificial turf | Alternating mow stripes and short fiber strokes read as synthetic sports grass rather than a generic green checker.            | Pass   |
| Carpet          | Soft woven lines and directional nap feel textile without the old shared micro-grid becoming a second visible checker.         | Pass   |
| Concrete        | Irregular aggregate, soft stains, and only a few hairline marks feel cast and matte rather than tiled.                         | Pass   |
| Cork            | Angular, uneven flakes and small pores read as compressed cork instead of a recolored granular floor.                          | Pass   |
| Grass           | Curved blade clusters and light highlights feel like trimmed lawn, while motifs stay readable as decorative accents.           | Pass   |
| Metal           | Sparse brushed bands and offset rivets read as engineered plating without competing with the board interaction layer.          | Pass   |
| Mosaic          | Uneven ceramic pieces with slight rotations and glaze marks read as hand-laid tilework instead of a checker pattern.           | Pass   |
| Parquet         | Offset board joints and visible wood grain feel warm and less mechanically basket-woven across adjacent cells.                 | Pass   |
| Rubber          | Raised round studs and restrained diagonal grip marks read as dark, matte gym flooring, distinct from metal.                   | Pass   |
| Sand            | Broad dune ripples with fine grains feel natural and airy while still leaving enough calm space for scene objects.             | Pass   |
| Soil            | A deeper earth base, irregular clumps, and pebble scatter separate planting beds from cork and sand at a glance.               | Pass   |
| Stage           | Vertical stage boards and subtle scuff sheen feel like a used performance floor rather than a recolored parquet copy.          | Pass   |
| Stone           | Warm offset slab joints and mineral speckles read as cut paving, clearly separated from cool cast concrete.                    | Pass   |
| Water           | Long ripples, soft highlights, and faint bubbles read as one pond surface across adjacent cells, with no accidental tile look. | Pass   |

All variants remain within the exact 25-75% decorated-cell rule. Decorative strokes occupy 30-46%
of one cell and have no fill plate or shadow, while playable people and fixed objects use full-color
Fluent SVG artwork on a raised plate. This distinction keeps stronger color visible without turning
floor marks into apparent controls.
