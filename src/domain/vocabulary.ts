import type { CharacterId, Clue, ItemId, Locale, PlaceId, PositionId, Puzzle } from './types'

type Templates = Record<Clue['type'], readonly string[]>

const ca: Templates = {
  'character-at-position': ['{a} és a {p}.', '{a} espera a {p}.'],
  'character-not-at-position': ['{a} no és a {p}.', 'No posis {a} a {p}.'],
  'character-in-place': ['{a} és a {p}.', 'Busca {a} a {p}.'],
  'character-not-in-place': ['{a} no és a {p}.', 'No busquis {a} a {p}.'],
  adjacent: ['{a} és al costat de {b}.', '{a} té {b} de veí.'],
  'not-adjacent': ['{a} no és al costat de {b}.', '{a} i {b} no són veïns.'],
  'same-row': ['{a} i {b} són a la mateixa fila.', '{a} comparteix fila amb {b}.'],
  'different-row': ['{a} i {b} són en files diferents.', '{a} no comparteix fila amb {b}.'],
  'same-column': ['{a} i {b} són a la mateixa columna.', '{a} comparteix columna amb {b}.'],
  'different-column': [
    '{a} i {b} són en columnes diferents.',
    '{a} no comparteix columna amb {b}.',
  ],
  'left-of': ['{a} és a l’esquerra de {b}.', 'Posa {a} a l’esquerra de {b}.'],
  'right-of': ['{a} és a la dreta de {b}.', 'Posa {a} a la dreta de {b}.'],
  above: ['{a} és damunt de {b}.', 'Posa {a} sobre {b}.'],
  below: ['{a} és sota de {b}.', 'Posa {a} sota {b}.'],
  distance: ['{a} és a {n} passos de {b}.', 'Entre {a} i {b} hi ha {n} passos.'],
  between: ['{a} és entre {b} i {c}.', 'Busca {a} al mig de {b} i {c}.'],
  'has-item': ['{a} porta {i}.', '{a} té {i}.'],
  'does-not-have-item': ['{a} no porta {i}.', '{i} no és de {a}.'],
}

const es: Templates = {
  'character-at-position': ['{a} está en {p}.', '{a} espera en {p}.'],
  'character-not-at-position': ['{a} no está en {p}.', 'No pongas a {a} en {p}.'],
  'character-in-place': ['{a} está en {p}.', 'Busca a {a} en {p}.'],
  'character-not-in-place': ['{a} no está en {p}.', 'No busques a {a} en {p}.'],
  adjacent: ['{a} está junto a {b}.', '{a} y {b} son vecinos.'],
  'not-adjacent': ['{a} no está junto a {b}.', '{a} y {b} no son vecinos.'],
  'same-row': ['{a} y {b} están en la misma fila.', '{a} comparte fila con {b}.'],
  'different-row': ['{a} y {b} están en filas distintas.', '{a} no comparte fila con {b}.'],
  'same-column': ['{a} y {b} están en la misma columna.', '{a} comparte columna con {b}.'],
  'different-column': [
    '{a} y {b} están en columnas distintas.',
    '{a} no comparte columna con {b}.',
  ],
  'left-of': ['{a} está a la izquierda de {b}.', 'Pon a {a} a la izquierda de {b}.'],
  'right-of': ['{a} está a la derecha de {b}.', 'Pon a {a} a la derecha de {b}.'],
  above: ['{a} está encima de {b}.', 'Pon a {a} sobre {b}.'],
  below: ['{a} está debajo de {b}.', 'Pon a {a} debajo de {b}.'],
  distance: ['{a} está a {n} pasos de {b}.', 'Hay {n} pasos entre {a} y {b}.'],
  between: ['{a} está entre {b} y {c}.', 'Busca a {a} entre {b} y {c}.'],
  'has-item': ['{a} lleva {i}.', '{a} tiene {i}.'],
  'does-not-have-item': ['{a} no lleva {i}.', '{i} no es de {a}.'],
}

const en: Templates = {
  'character-at-position': ['{a} is at {p}.', '{a} waits at {p}.'],
  'character-not-at-position': ['{a} is not at {p}.', 'Do not place {a} at {p}.'],
  'character-in-place': ['{a} is at {p}.', 'Find {a} at {p}.'],
  'character-not-in-place': ['{a} is not at {p}.', 'Do not find {a} at {p}.'],
  adjacent: ['{a} is next to {b}.', '{a} and {b} are neighbors.'],
  'not-adjacent': ['{a} is not next to {b}.', '{a} and {b} are not neighbors.'],
  'same-row': ['{a} and {b} are in the same row.', '{a} shares a row with {b}.'],
  'different-row': ['{a} and {b} are in different rows.', '{a} does not share a row with {b}.'],
  'same-column': ['{a} and {b} are in the same column.', '{a} shares a column with {b}.'],
  'different-column': [
    '{a} and {b} are in different columns.',
    '{a} does not share a column with {b}.',
  ],
  'left-of': ['{a} is left of {b}.', 'Place {a} left of {b}.'],
  'right-of': ['{a} is right of {b}.', 'Place {a} right of {b}.'],
  above: ['{a} is above {b}.', 'Place {a} above {b}.'],
  below: ['{a} is below {b}.', 'Place {a} below {b}.'],
  distance: ['{a} is {n} steps from {b}.', 'There are {n} steps between {a} and {b}.'],
  between: ['{a} is between {b} and {c}.', 'Find {a} between {b} and {c}.'],
  'has-item': ['{a} has {i}.', '{a} carries {i}.'],
  'does-not-have-item': ['{a} does not have {i}.', '{i} is not with {a}.'],
}

const templates: Record<Locale, Templates> = { ca, es, en }

const valueOrFallback = <Id extends string>(
  values: readonly { readonly id: Id; readonly name?: string; readonly label?: string }[],
  id: Id,
) =>
  values.find((value) => value.id === id)?.name ??
  values.find((value) => value.id === id)?.label ??
  'here'

export const renderClue = (puzzle: Puzzle, clue: Clue, locale: Locale = 'ca') => {
  const characterName = (id: CharacterId) => valueOrFallback(puzzle.characters, id)
  const positionName = (id: PositionId) => valueOrFallback(puzzle.positions, id)
  const placeName = (id: PlaceId) =>
    puzzle.positions.find((position) => position.placeId === id)?.label ?? 'here'
  const itemName = (id: ItemId) => valueOrFallback(puzzle.items, id)
  const values: Record<string, string> = {}

  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
      values.a = characterName(clue.characterId)
      values.p = positionName(clue.positionId)
      break
    case 'character-in-place':
    case 'character-not-in-place':
      values.a = characterName(clue.characterId)
      values.p = placeName(clue.placeId)
      break
    case 'has-item':
    case 'does-not-have-item':
      values.a = characterName(clue.characterId)
      values.i = itemName(clue.itemId)
      break
    case 'between':
      values.a = characterName(clue.characterId)
      values.b = characterName(clue.firstCharacterId)
      values.c = characterName(clue.secondCharacterId)
      break
    case 'distance':
      values.a = characterName(clue.firstCharacterId)
      values.b = characterName(clue.secondCharacterId)
      values.n = String(clue.distance)
      break
    default:
      values.a = characterName(clue.firstCharacterId)
      values.b = characterName(clue.secondCharacterId)
  }

  const variants = templates[locale][clue.type]
  const template = variants[clue.phraseVariant % variants.length]
  return template.replace(/\{(\w+)\}/gu, (_whole, key: string) => values[key] ?? key)
}
