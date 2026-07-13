# Fixed terrain samples

Run `pnpm terrain:samples` after changing floor textures, motif catalogs, decoration density, scale,
or color ranges. The command creates one PNG per material with three deterministic variants, a
combined `atlas.png`, and machine-readable `metrics.json`.

The samples use the same local SVG layers, Lucide motifs, seeded PRNG, 25-75% density rule, colors,
offsets, rotations, and relative motif sizes as the game. They intentionally show a 4 x 4 movement
grid so visual marks can be judged against real cell dimensions.

Review every material individually. Reject a sample when:

- two variants are visually identical;
- a motif resembles a character or fixed scene object;
- the seamless pattern has an obvious break at a cell edge;
- contrast is so weak that the floor looks flat;
- contrast is so strong that labels, crosses, or game objects would become unreadable;
- a motif is semantically inappropriate for the material;
- more than 75% or fewer than 25% of cells contain a motif.

Garden pond cells share one texture phase so adjacent water reads as a single surface. At runtime,
the renderer derives the pond perimeter from orthogonal cell adjacency: it draws a continuous stone
rim on every water-to-land edge and never draws stone between two water cells. Geometry tests cover
single cells, straight clusters, L-shaped clusters, and square clusters without assuming one fixed
pond shape.

The generated PNG files are committed as stable visual regression references. They are documentation
artifacts and are not loaded by the PWA at runtime.
