import type {
  CharacterId,
  Clue,
  ItemId,
  Locale,
  PlaceId,
  Position,
  PositionId,
  Puzzle,
} from './types'
import { localizeThemeLabel } from './themeVocabulary'
import { buildingUnitLabel } from './buildingPlan'

type Templates = Record<Clue['type'], readonly string[]>

const mapTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': ['{a} és a {p}.', '{a} espera a {p}.'],
    'character-not-at-position': ['{a} no és a {p}.', 'No posis {a} a {p}.'],
    'character-in-place': ['{a} és a {p}.', 'Busca {a} a {p}.'],
    'character-not-in-place': ['{a} no és a {p}.', 'No busquis {a} a {p}.'],
    'in-corner': ['{a} és en una cantonada acollidora.'],
    'not-in-corner': ['{a} no és en cap cantonada.'],
    'character-next-to-obstacle': ['{a} és al costat de {o}, a {p}.'],
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
    'item-in-place': ['{i} és a {p}.'],
    'item-not-in-place': ['{i} no és a {p}.'],
    'same-floor': ['{a} i {b} comparteixen zona.'],
    'different-floor': ['{a} i {b} són en zones diferents.'],
  },
  es: {
    'character-at-position': ['{a} está en {p}.', '{a} espera en {p}.'],
    'character-not-at-position': ['{a} no está en {p}.', 'No pongas a {a} en {p}.'],
    'character-in-place': ['{a} está en {p}.', 'Busca a {a} en {p}.'],
    'character-not-in-place': ['{a} no está en {p}.', 'No busques a {a} en {p}.'],
    'in-corner': ['{a} está en un rincón acogedor.'],
    'not-in-corner': ['{a} no está en ningún rincón.'],
    'character-next-to-obstacle': ['{a} está junto a {o}, en {p}.'],
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
    'item-in-place': ['{i} está en {p}.'],
    'item-not-in-place': ['{i} no está en {p}.'],
    'same-floor': ['{a} y {b} comparten zona.'],
    'different-floor': ['{a} y {b} están en zonas distintas.'],
  },
  en: {
    'character-at-position': ['{a} is at {p}.', '{a} waits at {p}.'],
    'character-not-at-position': ['{a} is not at {p}.', 'Do not place {a} at {p}.'],
    'character-in-place': ['{a} is at {p}.', 'Find {a} at {p}.'],
    'character-not-in-place': ['{a} is not at {p}.', 'Do not find {a} at {p}.'],
    'in-corner': ['{a} is in a welcoming corner.'],
    'not-in-corner': ['{a} is not in a corner.'],
    'character-next-to-obstacle': ['{a} is next to {o}, in {p}.'],
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
    'item-in-place': ['{i} is in {p}.'],
    'item-not-in-place': ['{i} is not in {p}.'],
    'same-floor': ['{a} and {b} share a zone.'],
    'different-floor': ['{a} and {b} are in different zones.'],
  },
}

const gridTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': [
      'A {a} li agrada molt participar. A la zona «{p}», és a la casella {d} del marcador {o} i porta {i}.',
      '{a} ha arribat amb moltes ganes a la zona «{p}». És a la casella {d} del marcador {o} i porta {i}.',
      '{a} ajuda a preparar la zona «{p}». La seva casella és {d} del marcador {o}, i hi porta {i}.',
    ],
    'character-not-at-position': [
      '{a} prefereix donar un cop de mà en un altre espai: no és a la casella {d} del marcador {o}, a «{p}».',
    ],
    'character-in-place': [
      '{a} entra per la porta de «{p}» amb {i} i saluda tothom.',
      '{a} se sent a gust a «{p}» i hi porta {i}.',
    ],
    'character-not-in-place': ['{a} prefereix ajudar en un altre espai, no a «{p}».'],
    'in-corner': ['{a}, amb {i}, prepara una cantonada lluminosa de l’espai.'],
    'not-in-corner': ['{a}, amb {i}, treballa lluny de les cantonades.'],
    'character-next-to-obstacle': [
      '{a} prepara amb il·lusió la zona «{p}», al costat de {o}, i hi porta {i}.',
      'A «{p}», {a} dona un cop de mà al costat de {o} i porta {i}.',
      '{a} té cura de «{p}» des d’un espai al costat de {o}, amb {i}.',
    ],
    adjacent: ['{a} i {b} preparen junts dos espais veïns.'],
    'not-adjacent': ['{a} i {b} col·laboren en espais que no són veïns.'],
    'same-row': ['{a} i {b} ajuden des de la mateixa franja del plànol.'],
    'different-row': ['{a} i {b} ajuden des de franges diferents del plànol.'],
    'same-column': ['{a} i {b} col·laboren dins la mateixa zona.'],
    'different-column': ['{a} i {b} col·laboren en zones diferents.'],
    'left-of': ["{a}, amb {i}, ajuda en un espai a l'esquerra de {b}."],
    'right-of': ['{a}, amb {i}, ajuda en un espai a la dreta de {b}.'],
    above: ['{a}, amb {i}, prepara un espai per damunt de {b}.'],
    below: ['{a}, amb {i}, prepara un espai per sota de {b}.'],
    distance: ['{a} i {b} col·laboren amb la separació indicada al plànol.'],
    between: ['{a}, amb {i}, ajuda des d’un espai entre {b} i {c}.'],
    'has-item': ['{a} porta {i}.'],
    'does-not-have-item': ['{i} no acompanya {a}.'],
    'item-in-place': ['A «{p}» tenen preparat {i} per a l’activitat.'],
    'item-not-in-place': ['A «{p}» han triat una altra cosa, no {i}.'],
    'same-floor': ['{a} i {b} comparteixen la mateixa zona.'],
    'different-floor': ['{a} i {b} preparen zones diferents.'],
  },
  es: {
    'character-at-position': [
      'A {a} le hace ilusión participar. En la zona «{p}», está en la casilla {d} del marcador {o} y lleva {i}.',
      '{a} ha llegado con muchas ganas a la zona «{p}». Está en la casilla {d} del marcador {o} y lleva {i}.',
      '{a} ayuda a preparar la zona «{p}». Su casilla está {d} del marcador {o} y lleva {i}.',
    ],
    'character-not-at-position': [
      '{a} prefiere colaborar en otro espacio: no está en la casilla {d} del marcador {o}, en «{p}».',
    ],
    'character-in-place': [
      '{a} entra por la puerta de «{p}» con {i} y saluda a todos.',
      '{a} se siente a gusto en «{p}» y lleva {i}.',
    ],
    'character-not-in-place': ['{a} prefiere ayudar en otro espacio, no en «{p}».'],
    'in-corner': ['{a}, con {i}, prepara un rincón luminoso del espacio.'],
    'not-in-corner': ['{a}, con {i}, trabaja lejos de los rincones.'],
    'character-next-to-obstacle': [
      '{a} prepara con ilusión la zona «{p}», junto a {o}, y lleva {i}.',
      'En «{p}», {a} echa una mano junto a {o} y lleva {i}.',
      '{a} cuida de «{p}» desde un espacio junto a {o}, con {i}.',
    ],
    adjacent: ['{a} y {b} preparan juntos dos espacios vecinos.'],
    'not-adjacent': ['{a} y {b} colaboran en espacios que no son vecinos.'],
    'same-row': ['{a} y {b} ayudan desde la misma franja del plano.'],
    'different-row': ['{a} y {b} ayudan desde franjas distintas del plano.'],
    'same-column': ['{a} y {b} colaboran dentro de la misma zona.'],
    'different-column': ['{a} y {b} colaboran en zonas distintas.'],
    'left-of': ['{a}, con {i}, ayuda en un espacio a la izquierda de {b}.'],
    'right-of': ['{a}, con {i}, ayuda en un espacio a la derecha de {b}.'],
    above: ['{a}, con {i}, prepara un espacio por encima de {b}.'],
    below: ['{a}, con {i}, prepara un espacio por debajo de {b}.'],
    distance: ['{a} y {b} colaboran con la separación indicada en el plano.'],
    between: ['{a}, con {i}, ayuda desde un espacio entre {b} y {c}.'],
    'has-item': ['{a} lleva {i}.'],
    'does-not-have-item': ['{i} no acompaña a {a}.'],
    'item-in-place': ['En «{p}» tienen preparado {i} para la actividad.'],
    'item-not-in-place': ['En «{p}» han elegido otra cosa, no {i}.'],
    'same-floor': ['{a} y {b} comparten la misma zona.'],
    'different-floor': ['{a} y {b} preparan zonas distintas.'],
  },
  en: {
    'character-at-position': [
      '{a} is excited to join in. In the “{p}” zone, they are in the cell {d} the {o} marker and carry {i}.',
      '{a} has arrived ready to help in the “{p}” zone. Their cell is {d} the {o} marker, and they carry {i}.',
      '{a} is helping prepare the “{p}” zone. Their cell is {d} the {o} marker, and they carry {i}.',
    ],
    'character-not-at-position': [
      '{a} would rather help elsewhere and is not in the cell {d} the {o} marker in “{p}”.',
    ],
    'character-in-place': [
      '{a} comes through the door of “{p}” with {i} and greets everyone.',
      '{a} feels at home in “{p}” and carries {i}.',
    ],
    'character-not-in-place': ['{a} would rather help elsewhere, not in “{p}”.'],
    'in-corner': ['{a}, with {i}, prepares a bright corner of the space.'],
    'not-in-corner': ['{a}, with {i}, works away from the corners.'],
    'character-next-to-obstacle': [
      '{a} is excited to prepare “{p}” beside {o}, carrying {i}.',
      'In “{p}”, {a} lends a hand beside {o} and carries {i}.',
      '{a} looks after “{p}” from a space beside {o}, with {i}.',
    ],
    adjacent: ['{a} and {b} prepare two neighboring spaces together.'],
    'not-adjacent': ['{a} and {b} help in spaces that are not neighbors.'],
    'same-row': ['{a} and {b} help from the same strip of the plan.'],
    'different-row': ['{a} and {b} help from different strips of the plan.'],
    'same-column': ['{a} and {b} work together in the same zone.'],
    'different-column': ['{a} and {b} work together in different zones.'],
    'left-of': ['{a}, with {i}, helps in a space left of {b}.'],
    'right-of': ['{a}, with {i}, helps in a space right of {b}.'],
    above: ['{a}, with {i}, prepares a space above {b}.'],
    below: ['{a}, with {i}, prepares a space below {b}.'],
    distance: ['{a} and {b} help with the separation marked on the plan.'],
    between: ['{a}, with {i}, helps from a space between {b} and {c}.'],
    'has-item': ['{a} carries {i}.'],
    'does-not-have-item': ['{i} is not with {a}.'],
    'item-in-place': ['The activity in “{p}” has {i} ready.'],
    'item-not-in-place': ['The team in “{p}” chose something else, not {i}.'],
    'same-floor': ['{a} and {b} share the same zone.'],
    'different-floor': ['{a} and {b} prepare different zones.'],
  },
}

const cubeTemplates: Record<Locale, Templates> = {
  ca: {
    ...gridTemplates.ca,
    'character-at-position': [
      '{a} viu a «{p}» i sempre hi té {i} a punt per compartir.',
      '{a} fa comunitat a «{p}» i hi guarda {i}.',
    ],
    'character-not-at-position': ['{a} viu en una altra llar, no a «{p}».'],
    'character-in-place': ['La porta de {a} s’obre a «{p}», on sempre saluda el veïnat.'],
    'character-not-in-place': ['{a} viu en una altra zona de l’edifici, no a «{p}».'],
    'in-corner': ['La llar de {a} fa cantonada i rep llum per dos costats.'],
    'not-in-corner': ['La llar de {a} no fa cantonada; té veïns als dos costats.'],
    'has-item': ['{a} té cura de {i} a casa.'],
    'does-not-have-item': ['{a} té un altre objecte preferit, no {i}.'],
    adjacent: ['{a} i {b} obren portes veïnes al mateix replà.'],
    'not-adjacent': ['Les portes de {a} i {b} no són veïnes.'],
    above: ['{a} viu al pis de sobre de {b}, a la mateixa ala.'],
    below: ['{a} viu al pis de sota de {b}, a la mateixa ala.'],
    'same-floor': ['{a} i {b} comparteixen replà i sempre es saluden.'],
    'different-floor': ['{a} i {b} viuen en pisos diferents i es troben a l’entrada.'],
  },
  es: {
    ...gridTemplates.es,
    'character-at-position': [
      '{a} vive en «{p}» y siempre tiene {i} listo para compartir.',
      '{a} hace comunidad en «{p}» y guarda allí {i}.',
    ],
    'character-not-at-position': ['{a} vive en otro hogar, no en «{p}».'],
    'character-in-place': [
      'La puerta de {a} se abre en «{p}», donde siempre saluda al vecindario.',
    ],
    'character-not-in-place': ['{a} vive en otra zona del edificio, no en «{p}».'],
    'in-corner': ['El hogar de {a} hace esquina y recibe luz por dos lados.'],
    'not-in-corner': ['El hogar de {a} no hace esquina; tiene vecinos a ambos lados.'],
    'has-item': ['{a} cuida de {i} en casa.'],
    'does-not-have-item': ['{a} tiene otro objeto favorito, no {i}.'],
    adjacent: ['{a} y {b} abren puertas vecinas en el mismo rellano.'],
    'not-adjacent': ['Las puertas de {a} y {b} no son vecinas.'],
    above: ['{a} vive en el piso de encima de {b}, en la misma ala.'],
    below: ['{a} vive en el piso de debajo de {b}, en la misma ala.'],
    'same-floor': ['{a} y {b} comparten rellano y siempre se saludan.'],
    'different-floor': ['{a} y {b} viven en pisos distintos y se encuentran en la entrada.'],
  },
  en: {
    ...gridTemplates.en,
    'character-at-position': [
      '{a} lives in “{p}” and keeps {i} ready to share.',
      '{a} builds community in “{p}” and keeps {i} there.',
    ],
    'character-not-at-position': ['{a} lives in another home, not in “{p}”.'],
    'character-in-place': [
      "{a}'s door opens into “{p}”, where they always greet the neighbors.",
    ],
    'character-not-in-place': ['{a} lives elsewhere in the building, not in “{p}”.'],
    'in-corner': ["{a}'s home is on a corner and gets light from two sides."],
    'not-in-corner': ["{a}'s home is not on a corner and has neighbors on both sides."],
    'has-item': ['{a} looks after {i} at home.'],
    'does-not-have-item': ['{a} has another favorite object, not {i}.'],
    adjacent: ['{a} and {b} open neighboring doors on the same landing.'],
    'not-adjacent': ["{a} and {b}'s doors are not neighbors."],
    above: ['{a} lives one floor above {b}, in the same wing.'],
    below: ['{a} lives one floor below {b}, in the same wing.'],
    'same-floor': ['{a} and {b} share a landing and always say hello.'],
    'different-floor': ['{a} and {b} live on different floors and meet by the entrance.'],
  },
}

const valueOrFallback = <Id extends string>(
  values: readonly { readonly id: Id; readonly name?: string; readonly label?: string }[],
  id: Id,
) =>
  values.find((value) => value.id === id)?.name ??
  values.find((value) => value.id === id)?.label ??
  'here'

const placeLabel = (puzzle: Puzzle, placeId: PlaceId, locale: Locale) => {
  const position = puzzle.positions.find((candidate) => candidate.placeId === placeId)
  return position
    ? position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : localizeThemeLabel(locale, puzzle.theme, gridPlaceLabel(position.label))
    : { ca: 'aquí', es: 'aquí', en: 'here' }[locale]
}

const gridPlaceLabel = (label: string) => label.replace(/\s·\s\d+(?:\.\d+)?$/u, '')

const landmarkDirection = (position: Position, obstacle: Position, locale: Locale) => {
  const directions = {
    ca: {
      left: "a l'esquerra",
      right: 'a la dreta',
      above: 'damunt',
      below: 'sota',
    },
    es: {
      left: 'a la izquierda',
      right: 'a la derecha',
      above: 'encima',
      below: 'debajo',
    },
    en: {
      left: 'to the left of',
      right: 'to the right of',
      above: 'above',
      below: 'below',
    },
  } as const
  const set = directions[locale]
  if (position.column < obstacle.column) return set.left
  if (position.column > obstacle.column) return set.right
  if (position.row < obstacle.row) return set.above
  return set.below
}

export type CluePart =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'icon'; readonly emoji: string; readonly label: string }

interface ClueValue {
  readonly text: string
  readonly emoji?: string
}

const textValue = (text: string): ClueValue => ({ text })

const clueValues = (puzzle: Puzzle, clue: Clue, locale: Locale) => {
  const characterName = (id: CharacterId) => valueOrFallback(puzzle.characters, id)
  const positionFor = (id: PositionId) =>
    puzzle.positions.find((position) => position.id === id)
  const itemValue = (id: ItemId): ClueValue => {
    const item = puzzle.items.find((candidate) => candidate.id === id)
    return item
      ? {
          text: localizeThemeLabel(locale, puzzle.theme, item.label),
          emoji: item.emoji,
        }
      : textValue('object')
  }
  const localizedPlace = (position: Position) =>
    position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : localizeThemeLabel(locale, puzzle.theme, gridPlaceLabel(position.label))
  const obstacleValue = (position: Position, fallback: string): ClueValue => ({
    text: localizeThemeLabel(locale, puzzle.theme, position.obstacleLabel ?? fallback),
    emoji: position.obstacleEmoji,
  })
  const itemForCharacter = (id: CharacterId): ClueValue => {
    const character = puzzle.characters.find((candidate) => candidate.id === id)
    return character?.itemId ? itemValue(character.itemId) : textValue('object')
  }
  const values: Record<string, ClueValue> = {}

  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position': {
      const position = positionFor(clue.positionId)
      values.a = textValue(characterName(clue.characterId))
      values.i = position?.itemId
        ? itemValue(position.itemId)
        : itemForCharacter(clue.characterId)
      values.p = textValue(position ? localizedPlace(position) : 'here')
      const obstacle = position
        ? puzzle.positions.find(
            (candidate) =>
              candidate.blocked &&
              candidate.placeId === position.placeId &&
              Math.abs(candidate.row - position.row) +
                Math.abs(candidate.column - position.column) ===
                1,
          )
        : undefined
      const near = { ca: 'prop de', es: 'junto a', en: 'near' } as const
      values.d = textValue(
        position && obstacle ? landmarkDirection(position, obstacle, locale) : near[locale],
      )
      values.o = obstacle ? obstacleValue(obstacle, values.p.text) : values.p
      break
    }
    case 'character-in-place':
    case 'character-not-in-place':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.p = textValue(placeLabel(puzzle, clue.placeId, locale))
      break
    case 'in-corner':
    case 'not-in-corner':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      break
    case 'character-next-to-obstacle': {
      const obstacle = positionFor(clue.obstaclePositionId)
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.p = textValue(obstacle ? localizedPlace(obstacle) : 'here')
      values.o = obstacle ? obstacleValue(obstacle, values.p.text) : values.p
      break
    }
    case 'has-item':
    case 'does-not-have-item':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemValue(clue.itemId)
      break
    case 'item-in-place':
    case 'item-not-in-place':
      values.i = itemValue(clue.itemId)
      values.p = textValue(placeLabel(puzzle, clue.placeId, locale))
      break
    case 'between':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.b = textValue(characterName(clue.firstCharacterId))
      values.c = textValue(characterName(clue.secondCharacterId))
      break
    case 'distance':
      values.a = textValue(characterName(clue.firstCharacterId))
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = textValue(characterName(clue.secondCharacterId))
      values.n = textValue(String(clue.distance))
      break
    default:
      values.a = textValue(characterName(clue.firstCharacterId))
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = textValue(characterName(clue.secondCharacterId))
  }

  return values
}

export const renderClueParts = (
  puzzle: Puzzle,
  clue: Clue,
  locale: Locale = 'ca',
): readonly CluePart[] => {
  const values = clueValues(puzzle, clue, locale)
  const templateSet =
    puzzle.boardMode === 'logic-cube'
      ? cubeTemplates
      : puzzle.boardMode === 'logic-grid'
        ? gridTemplates
        : mapTemplates
  const variants = templateSet[locale][clue.type]
  const template = variants[clue.phraseVariant % variants.length]
  const parts: CluePart[] = []
  let cursor = 0
  for (const match of template.matchAll(/\{(\w+)\}/gu)) {
    const index = match.index
    if (index > cursor) parts.push({ type: 'text', text: template.slice(cursor, index) })
    const key = match[1] ?? ''
    const value = values[key] ?? textValue(key)
    if (value.emoji) {
      parts.push({ type: 'icon', emoji: value.emoji, label: value.text })
      parts.push({ type: 'text', text: ` ${value.text}` })
    } else {
      parts.push({ type: 'text', text: value.text })
    }
    cursor = index + match[0].length
  }
  if (cursor < template.length) parts.push({ type: 'text', text: template.slice(cursor) })
  return parts
}

export const renderClue = (puzzle: Puzzle, clue: Clue, locale: Locale = 'ca') =>
  renderClueParts(puzzle, clue, locale)
    .map((part) => (part.type === 'icon' ? part.emoji : part.text))
    .join('')
