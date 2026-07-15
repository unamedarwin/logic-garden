# Illustrated Adventures

`Aventures il·lustrades` is the public, age-neutral name of the compact map collection. The internal
`children` collection and audience identifiers remain unchanged so old preferences, games, history,
and shared links stay compatible.

## Story model

The story is a local render-time view of the puzzle, never puzzle state:

- `theme + seed` selects one of three short mystery arcs reproducibly;
- the first generated character becomes the opening protagonist;
- each selected character receives one short localized memory prompt;
- every story fragment has exactly one `sourceClueId`, its referenced character ids, a story beat,
  and the `CluePart` values rendered from that same structured clue;
- the objective asks the player to reconstruct the mystery, and the completion dialog closes it.

`buildChildNarrative` is framework-independent. It does not alter constraints, the solver, the
answer-free catalog, PRNG consumption, game state, persistence, or the share payload. Changing the
interface language rebuilds the same story facts with another local dictionary.

The generator must not retain `has-item` or `does-not-have-item` as child context. Carried items are
fixed character data and those statements do not reduce a map position. Every character instead
retains at least one related spatial clue. Illustrated stories also exclude distance, step, row,
and column facts; they use named places, neighbors, visual order, corners, and relationships that
read naturally on the map.

## Automated experience gates

The release suite rejects the illustrated story when any of these observable checks fails:

1. Every locale uses an age-neutral public collection label.
2. The same locale, theme, and seed produce identical story copy.
3. Twenty-four sampled seeds expose all three arcs.
4. Introductions, objectives, endings, and character prompts stay within checked word limits.
5. The introduction names the localized theme and generated protagonist.
6. Every fragment resolves to one current structured clue and contains no unresolved placeholder.
7. Every character has at least one useful fragment.
8. Story fragments do not invent item icons for positional or relationship facts.
9. At `390 x 844`, 4-, 6-, and 8-person maps keep the prompt and first fragment above the fixed
   action rail before selection, after selection, and after placement.

These gates prove traceability, compactness, and interface integrity. They do not prove enjoyment.
The human thresholds remain those in [`content-quality-rubric.md`](content-quality-rubric.md): first
reading comprehension, correct interpretation of clue facts, recognized narrative closure, and a
voluntary replay rate measured on the exact release build.
