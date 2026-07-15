# Localization

Logic Garden currently publishes only `ca`. Browser detection, migrated preferences, settings, and
release tests all resolve to Catalan while the narrative voice is being refined. The existing
Spanish, English, Basque, Galician, French, and German dictionaries are dormant reference material:
they are not selectable, do not count as supported content, and may lag behind Catalan until a
separate translation pass is scheduled.

Locale selection remains separate from puzzle logic. Persisted games contain structured clues
rather than rendered sentences, so disabling or later reactivating a locale never changes a puzzle.

## Composition contract

Every clue renderer receives the same typed fact, character names, room label, and any scene icon
token that participates in that fact. A translation may reorder those parts to sound natural, but
it must preserve the exact logical relation and friendly motivation. Position and relationship
facts must not acquire a decorative carried object. Tests render every clue family in Catalan and
`auditClueTemplatePlaceholders` rejects a variant that drops a required
logical placeholder. Exact advanced placement copy additionally requires room, direction, and
landmark tokens. The landmark must be the labeled scene object stored on the blocked cell; a room
name is not a valid substitute. Theme-label parity rejects untranslated catalog labels.

The following example uses one fact: Aina is in the reading room, immediately above the lamp. It
documents the intended short, reusable Catalan composition style rather than storing puzzle copy:

| Locale | Composition example                                                         |
| ------ | --------------------------------------------------------------------------- |
| `ca`   | Aina prepara amb il·lusió la sala de lectura, a la casella damunt del llum. |

## Review workflow

1. Run `pnpm spellcheck` for project prose and non-catalog source.
2. Run the rendered-clue and Catalan readability tests.
3. Give each independent reviewer the structured fact and its rendered Catalan result so grammar
   is assessed as composition rather than isolated word substitution.
4. Correct the local template instead of adding an incorrect word to a dictionary.
5. Rerun `pnpm verify` because wording changes can affect mobile wrapping and clue height.

Catalan templates avoid concatenating bare articles with dynamic titles or names. Theme
introductions use the neutral form `A l'aventura «…»`, and relation templates are phrased so vowel
elision and grammatical gender do not depend on the inserted name.
They also name visible landmarks directly. In every locale, an item icon appears only when the
structured clue constrains that item, avoiding repeated decorative objects that do not help the
deduction.

Dormant translations must not be reactivated merely because their dictionary keys still exist.
Reactivation requires a dedicated native review, full composition tests, responsive screenshots,
and an explicit addition to `supportedLocales`.
