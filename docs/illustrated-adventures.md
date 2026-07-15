# Illustrated Adventures

`Aventures il·lustrades` is the public, age-neutral name of the compact map collection. The internal
`children` collection and audience identifiers remain unchanged so old preferences, games, history,
and shared links stay compatible.

## Story model

The story is a local render-time view of the puzzle, never puzzle state:

- `theme + seed` selects semantic story ids through the seeded PRNG, independently from the puzzle
  PRNG and interface language;
- every theme has three recognizable premises: a trail to reconstruct, a friendly surprise to
  prepare, and a shared event to complete. Forest garlands and picnics, lighthouse signs and island
  gifts, pearl trails and coral gardens, or footprints and park picnics therefore lead to genuinely
  different openings rather than one renamed notebook;
- six incidents (`scrambled-clues`, `missing-detail`, `mysterious-note`, `scattered-signs`,
  `conflicting-memories`, and `hidden-trail`) combine with the three premises, four objectives, and
  four endings;
- the first generated character becomes the opening protagonist;
- each selected character receives a short localized voice derived from the clues they contribute:
  witness, connector, finder, or skeptic;
- each character also gets one deterministic micro-adventure beat from six semantic arcs: remember,
  notice, help, question, connect, or prepare. The beat is a tiny story hook, not a new rule, and
  appears above that character's exact contextual clue;
- the compact mobile workspace keeps the premise and objective visible without replacing the full
  introduction in the complete story panel;
- four progress stages (`opening`, `gathering`, `connecting`, and `proposal`) follow how many
  hypotheses the player has placed. They never claim that a hypothesis is correct before a
  successful check;
- every story fragment has exactly one `sourceClueId`, its referenced character ids, a story beat,
  and the `CluePart` values rendered from that same structured clue;
- the objective asks the player to reconstruct the mystery, and the completion dialog closes it
  with a semantically compatible ending.

`buildChildNarrative` is framework-independent. It does not alter constraints, the solver, the
answer-free catalog, PRNG consumption, game state, persistence, or the share payload. Changing the
interface language rebuilds the same story facts with another local dictionary.

The generator must not retain `has-item` or `does-not-have-item` as illustrated context. Carried items are
fixed character data and those statements do not reduce a map position. Every character instead
retains at least one related spatial clue. Illustrated stories also exclude distance, step, row,
column, and floor facts; `buildChildNarrative` rejects those clue families even if a future generator
regression lets one through. Stories use named places, neighbors, visual order, corners, and
relationships that read naturally on the map.

Catalan is the only active release locale. Semantic story ids remain separate from copy so dormant
dictionaries can eventually render the same premise, mystery, objective, ending, role, and beat
without changing the selected story.

## Automated experience gates

The release suite rejects the illustrated story when any of these observable checks fails:

1. The active Catalan locale uses an age-neutral public collection label.
2. The same theme and seed produce identical Catalan story copy.
3. For every theme, 100 sampled seeds expose all three premises, all six incidents, at
   least 17 of the 18 premise/incident openings, and at least 55 complete signatures. Normalized
   incident entropy stays at or above 0.95, normalized premise entropy at or above 0.90, no incident
   exceeds 25%, and no premise exceeds 45%.
4. Removing the localized title and protagonist still leaves ten distinct theme openings.
5. Introductions, objectives, endings, semantic role prompts, and micro-adventure beats stay
   within checked word limits.
6. The introduction names the localized theme and generated protagonist.
7. Every fragment resolves to one current structured clue and contains no unresolved placeholder.
8. Every character has at least one useful fragment and a role derived from those fragments.
9. Unsupported item, distance, row, column, and floor clue families are rejected by the narrative
   boundary instead of being silently narrated.
10. Story fragments do not invent item icons for positional or relationship facts.
11. Every character thread has a short Catalan beat and remains deterministic.
12. Four progress stages use neutral localized story copy, change with placed hypotheses, and never
    describe an unchecked proposal as correct or solved.
13. At `390 x 844`, 4-, 6-, and 8-person maps keep the people row, story progress, and first fragment above the fixed
    action rail before selection, after selection, and after placement.
14. At `393 x 852`, the compact premise remains visible, the complete story panel can reach its last
    clue above the action rail, and scrolling the first setup step keeps the current four-step
    journey path visible.
15. The complete generated-content audit covers every illustrated theme at 4, 6, and 8 friends and
    every difficulty, renders every clue in Catalan, reruns uniqueness, and reconstructs
    the satisfying assignment from the deduction trace.

These gates prove traceability, compactness, and interface integrity. They do not prove enjoyment.
The human thresholds remain those in [`content-quality-rubric.md`](content-quality-rubric.md): first
reading comprehension, correct interpretation of clue facts, recognized narrative closure, and a
voluntary replay rate measured on the exact release build.
