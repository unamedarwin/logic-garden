# Localization

Logic Garden supports `ca`, `es`, `en`, `eu`, `gl`, `fr`, and `de`. Locale selection is separate
from puzzle logic: the browser language is used only for a first installation, a saved choice wins
afterwards, and persisted games contain structured clues rather than rendered sentences.

## Composition contract

Every clue renderer receives the same typed fact, character names, room label, and any scene icon
token that participates in that fact. A translation may reorder those parts to sound natural, but
it must preserve the exact logical relation and friendly motivation. Position and relationship
facts must not acquire a decorative carried object. Tests render every clue family in
every supported locale and `auditClueTemplatePlaceholders` rejects a variant that drops a required
logical placeholder. Exact advanced placement copy additionally requires room, direction, and
landmark tokens. The landmark must be the labeled scene object stored on the blocked cell; a room
name is not a valid substitute. Theme-label parity rejects untranslated catalog labels.

The following example uses one fact: Aina is in the reading room, immediately above the lamp.
These sentences document the intended short, reusable composition style rather than
storing puzzle copy:

| Locale | Composition example                                                                |
| ------ | ---------------------------------------------------------------------------------- |
| `ca`   | Aina prepara amb il·lusió la sala de lectura, a la casella damunt del llum.        |
| `es`   | Aina prepara con ilusión la sala de lectura, en la casilla sobre la lámpara.       |
| `en`   | Aina happily prepares the reading room, in the cell above the lamp.                |
| `eu`   | Ainak gogotsu prestatzen du irakurketa-gela, lanpararen gaineko laukian.           |
| `gl`   | Aina prepara con ilusión a sala de lectura, na cela sobre a lámpada.               |
| `fr`   | Aina prépare avec plaisir la salle de lecture, dans la case au-dessus de la lampe. |
| `de`   | Aina bereitet mit Freude den Leseraum vor, im Feld über der Lampe.                 |

## Review workflow

1. Run `pnpm spellcheck` for project prose and non-catalog source with the existing Catalan,
   Spanish, and English dictionaries.
2. Run the locale parity and rendered-clue tests for all seven locales.
3. Give each independent reviewer the structured fact and its rendered result, without a reference
   translation, so grammar is assessed as composition rather than word substitution.
4. Correct the local template instead of adding an incorrect word to a dictionary.
5. Rerun `pnpm verify` because wording changes can affect mobile wrapping and clue height.

Catalan templates avoid concatenating bare articles with dynamic titles or names. Theme
introductions use the neutral form `A l'aventura «…»`, and relation templates are phrased so vowel
elision and grammatical gender do not depend on the inserted name.
They also name visible landmarks directly. In every locale, an item icon appears only when the
structured clue constrains that item, avoiding repeated decorative objects that do not help the
deduction.

French clue composition applies `de` to `d’` elision at render time before a dynamic vowel-initial
name. Basque templates introduce the carried item through an explicit singular noun such as
`objektua`; this keeps the auxiliary independent of whether the localized item label is singular or
plural.
