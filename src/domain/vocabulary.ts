import type { CharacterId, Clue, ItemId, Locale, PlaceId, PositionId, Puzzle } from './types'

type Templates = Record<Clue['type'], readonly string[]>

const mapTemplates: Record<Locale, Templates> = {
  ca: {
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
    'left-of': ["{a} és a l'esquerra de {b}.", "Posa {a} a l'esquerra de {b}."],
    'right-of': ['{a} és a la dreta de {b}.', 'Posa {a} a la dreta de {b}.'],
    above: ['{a} és damunt de {b}.', 'Posa {a} sobre {b}.'],
    below: ['{a} és sota de {b}.', 'Posa {a} sota de {b}.'],
    distance: ['{a} és a {n} passos de {b}.', 'Entre {a} i {b} hi ha {n} passos.'],
    between: ['{a} és entre {b} i {c}.', 'Busca {a} al mig de {b} i {c}.'],
    'has-item': ['{a} porta {i}.', '{a} té {i}.'],
    'does-not-have-item': ['{a} no porta {i}.', '{i} no és de {a}.'],
  },
  es: {
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
  },
  en: {
    'character-at-position': ['{a} is at {p}.', '{a} waits at {p}.'],
    'character-not-at-position': ['{a} is not at {p}.', 'Do not place {a} at {p}.'],
    'character-in-place': ['{a} is at {p}.', 'Find {a} at {p}.'],
    'character-not-in-place': ['{a} is not at {p}.', 'Do not find {a} at {p}.'],
    adjacent: ['{a} is next to {b}.', '{a} and {b} are neighbors.'],
    'not-adjacent': ['{a} is not next to {b}.', '{a} and {b} are not neighbors.'],
    'same-row': ['{a} and {b} are in the same row.', '{a} shares a row with {b}.'],
    'different-row': [
      '{a} and {b} are in different rows.',
      '{a} does not share a row with {b}.',
    ],
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
  },
}

const gridTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': ['{a}, amb {i}, ocupa {p} a la ruta {r}.'],
    'character-not-at-position': ['{a} no ocupa {p} a la ruta {r}.'],
    'character-in-place': ['{a}, amb {i}, és a {p}.'],
    'character-not-in-place': ['{a} no és a {p}.'],
    adjacent: ['{a} i {b} tenen espais veïns.'],
    'not-adjacent': ['{a} i {b} no tenen espais veïns.'],
    'same-row': ['{a} i {b} segueixen la mateixa ruta.'],
    'different-row': ['{a} i {b} segueixen rutes diferents.'],
    'same-column': ['{a} i {b} comparteixen zona.'],
    'different-column': ['{a} i {b} no comparteixen zona.'],
    'left-of': ["{a}, amb {i}, és a l'esquerra de {b}."],
    'right-of': ['{a}, amb {i}, és a la dreta de {b}.'],
    above: ['{a}, amb {i}, és per damunt de {b}.'],
    below: ['{a}, amb {i}, és per sota de {b}.'],
    distance: ['{a} i {b} mantenen la separació indicada al plànol.'],
    between: ['{a}, amb {i}, queda entre {b} i {c}.'],
    'has-item': ['{a} porta {i}.'],
    'does-not-have-item': ['{i} no acompanya {a}.'],
  },
  es: {
    'character-at-position': ['{a}, con {i}, ocupa {p} en la ruta {r}.'],
    'character-not-at-position': ['{a} no ocupa {p} en la ruta {r}.'],
    'character-in-place': ['{a}, con {i}, está en {p}.'],
    'character-not-in-place': ['{a} no está en {p}.'],
    adjacent: ['{a} y {b} tienen espacios vecinos.'],
    'not-adjacent': ['{a} y {b} no tienen espacios vecinos.'],
    'same-row': ['{a} y {b} siguen la misma ruta.'],
    'different-row': ['{a} y {b} siguen rutas distintas.'],
    'same-column': ['{a} y {b} comparten zona.'],
    'different-column': ['{a} y {b} no comparten zona.'],
    'left-of': ['{a}, con {i}, está a la izquierda de {b}.'],
    'right-of': ['{a}, con {i}, está a la derecha de {b}.'],
    above: ['{a}, con {i}, está por encima de {b}.'],
    below: ['{a}, con {i}, está por debajo de {b}.'],
    distance: ['{a} y {b} mantienen la separación indicada en el plano.'],
    between: ['{a}, con {i}, queda entre {b} y {c}.'],
    'has-item': ['{a} lleva {i}.'],
    'does-not-have-item': ['{i} no acompaña a {a}.'],
  },
  en: {
    'character-at-position': ['{a}, with {i}, takes {p} on route {r}.'],
    'character-not-at-position': ['{a} does not take {p} on route {r}.'],
    'character-in-place': ['{a}, with {i}, is in {p}.'],
    'character-not-in-place': ['{a} is not in {p}.'],
    adjacent: ['{a} and {b} have neighboring spaces.'],
    'not-adjacent': ['{a} and {b} do not have neighboring spaces.'],
    'same-row': ['{a} and {b} follow the same route.'],
    'different-row': ['{a} and {b} follow different routes.'],
    'same-column': ['{a} and {b} share a zone.'],
    'different-column': ['{a} and {b} do not share a zone.'],
    'left-of': ['{a}, with {i}, is left of {b}.'],
    'right-of': ['{a}, with {i}, is right of {b}.'],
    above: ['{a}, with {i}, is above {b}.'],
    below: ['{a}, with {i}, is below {b}.'],
    distance: ['{a} and {b} keep the separation marked on the plan.'],
    between: ['{a}, with {i}, is between {b} and {c}.'],
    'has-item': ['{a} carries {i}.'],
    'does-not-have-item': ['{i} is not with {a}.'],
  },
}

const valueOrFallback = <Id extends string>(
  values: readonly { readonly id: Id; readonly name?: string; readonly label?: string }[],
  id: Id,
) =>
  values.find((value) => value.id === id)?.name ??
  values.find((value) => value.id === id)?.label ??
  'here'

const placeLabel = (puzzle: Puzzle, placeId: PlaceId) =>
  puzzle.positions.find((position) => position.placeId === placeId)?.label ?? 'here'

const gridPlaceLabel = (label: string) => label.replace(/\s·\s\d+$/u, '')

export const renderClue = (puzzle: Puzzle, clue: Clue, locale: Locale = 'ca') => {
  const characterName = (id: CharacterId) => valueOrFallback(puzzle.characters, id)
  const positionFor = (id: PositionId) =>
    puzzle.positions.find((position) => position.id === id)
  const itemName = (id: ItemId) => valueOrFallback(puzzle.items, id)
  const itemForCharacter = (id: CharacterId) => {
    const character = puzzle.characters.find((candidate) => candidate.id === id)
    return character ? itemName(character.itemId) : 'object'
  }
  const values: Record<string, string> = {}

  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position': {
      const position = positionFor(clue.positionId)
      values.a = characterName(clue.characterId)
      values.i = itemForCharacter(clue.characterId)
      values.p = position
        ? puzzle.boardMode === 'logic-grid'
          ? gridPlaceLabel(position.label)
          : position.label
        : 'here'
      values.r = position ? String(position.row + 1) : '1'
      break
    }
    case 'character-in-place':
    case 'character-not-in-place':
      values.a = characterName(clue.characterId)
      values.i = itemForCharacter(clue.characterId)
      values.p =
        puzzle.boardMode === 'logic-grid'
          ? gridPlaceLabel(placeLabel(puzzle, clue.placeId))
          : placeLabel(puzzle, clue.placeId)
      break
    case 'has-item':
    case 'does-not-have-item':
      values.a = characterName(clue.characterId)
      values.i = itemName(clue.itemId)
      break
    case 'between':
      values.a = characterName(clue.characterId)
      values.i = itemForCharacter(clue.characterId)
      values.b = characterName(clue.firstCharacterId)
      values.c = characterName(clue.secondCharacterId)
      break
    case 'distance':
      values.a = characterName(clue.firstCharacterId)
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = characterName(clue.secondCharacterId)
      values.n = String(clue.distance)
      break
    default:
      values.a = characterName(clue.firstCharacterId)
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = characterName(clue.secondCharacterId)
  }

  const templateSet = puzzle.boardMode === 'logic-grid' ? gridTemplates : mapTemplates
  const variants = templateSet[locale][clue.type]
  const template = variants[clue.phraseVariant % variants.length]
  return template.replace(/\{(\w+)\}/gu, (_whole, key: string) => values[key] ?? key)
}
