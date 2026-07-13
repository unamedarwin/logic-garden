# Visual asset policy

Logic Garden keeps every visual asset inside the compiled application. The game never downloads
art from a CDN, marketplace, or runtime API. Imported art is selected by meaning and room context;
it is never picked from an unrestricted random pool.

## Source order

1. **Kenney** is the primary source for general scene art, characters, furniture, nature, food,
   sports, music, and market objects. Prefer current packs from `kenney.nl/assets` over archived or
   third-party repository mirrors. Kenney's asset-page downloads are CC0. Record the pack name,
   version, source URL, and selected files even though attribution is optional.
2. **Game-icons.net** fills semantic icon gaps when Kenney has no suitable object. Its artwork is
   CC BY 3.0, so every imported icon must retain its slug and author metadata and receive an
   accessible credit in the application plus an entry in `THIRD_PARTY_NOTICES.md`.
3. **itch.io** is reserved for a specific pixel-art direction that the first two sources cannot
   provide. itch.io is a marketplace, not one shared asset license. Review and record the exact
   creator, pack, version, redistribution terms, modification terms, and attribution requirement
   before adding any file.

## Selection rules

- Import only the curated files the game uses; never vendor a whole general-purpose archive.
- Keep character portraits, carried clue items, room objects, terrain decorations, and interface
  icons in separate semantic catalogs. Automated tests must reject cross-category reuse.
- Do not mix pixel, outlined monochrome, flat vector, and illustrated assets inside one scene
  without an explicit art-direction review. A theme should read as one coherent set.
- Prefer SVG when the source supplies clean vector files. Use lossless PNG at a verified native
  size for pixel art and other raster-only packs; do not blur pixel art through arbitrary scaling.
- Normalize view boxes, transparent padding, optical size, and baseline before an asset enters a
  room catalog. Check the result at 6x6, 9x9, and 16x16 board scales.
- Reject assets that are semantically ambiguous, visually indistinguishable at their rendered
  size, inconsistent with the room, or outside the product safety rules.
- Keep the current local Fluent Emoji subset only as an explicit fallback while each category is
  migrated. Do not silently alternate between Fluent and a replacement for the same object.

## Migration workflow

1. Build a small contact sheet for one complete theme using Kenney assets.
2. Compare it with the current Fluent scene at mobile board sizes and with a placed character.
3. Validate labels, clues, contrast, alignment, category separation, and bundle size.
4. Add source and license metadata, then switch the whole reviewed category together.
5. Run icon invariants, multilingual tests, the production build, and the visual QA matrix before
   publishing.

Initial candidates are Kenney Generic Items for objects, Modular Characters for people, and Board
Game Icons for neutral controls. Tiny Town and RPG Urban remain optional pixel-art references; they
must not be mixed into the current warm illustrated themes without a dedicated theme redesign.
