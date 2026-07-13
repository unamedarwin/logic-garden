import type { Locale, Position } from './types'

export type BuildingCellKind = 'home' | 'shop' | 'landing' | 'stairs' | 'entrance'

export const BUILDING_ROWS = 5
export const BUILDING_COLUMNS = 5
export const BUILDING_DEPTH = 5
export const BUILDING_CHARACTER_COUNT = 8

interface BuildingCellDefinition {
  readonly unitId: string
  readonly kind: BuildingCellKind
  readonly blocked: boolean
}

const groundFloor = [
  ['shop-left', 'shop-left', 'landing', 'shop-right', 'shop-right'],
  ['shop-left', 'shop-left', 'landing', 'shop-right', 'shop-right'],
  ['shop-left', 'shop-left', 'stairs', 'shop-right', 'shop-right'],
  ['shop-left', 'shop-left', 'landing', 'shop-right', 'shop-right'],
  ['entrance', 'entrance', 'landing', 'entrance', 'entrance'],
] as const

const residentialFloor = [
  ['home-a', 'home-a', 'landing', 'home-b', 'home-b'],
  ['home-a', 'home-a', 'landing', 'home-b', 'home-b'],
  ['home-a', 'home-a', 'stairs', 'home-b', 'home-b'],
  ['home-c', 'home-c', 'landing', 'home-d', 'home-d'],
  ['home-c', 'home-c', 'landing', 'home-d', 'home-d'],
] as const

const unitAt = (layer: number, row: number, column: number) =>
  (layer === 0 ? groundFloor : residentialFloor)[row]?.[column]

const homeAnchors = new Set([
  '1:0:0',
  '1:0:4',
  '1:4:0',
  '1:4:4',
  '2:0:0',
  '2:1:4',
  '2:4:1',
  '2:3:3',
  '3:1:0',
  '3:1:4',
  '3:4:1',
  '3:3:4',
  '4:1:1',
  '4:0:3',
  '4:4:0',
  '4:3:4',
])

export const BUILDING_HOME_COUNT = homeAnchors.size

export const buildingCellAt = (
  layer: number,
  row: number,
  column: number,
): BuildingCellDefinition => {
  if (layer < 0 || layer >= BUILDING_DEPTH) {
    throw new Error(`Pis d'edifici desconegut: ${layer}`)
  }
  const unitId = unitAt(layer, row, column)
  if (!unitId) throw new Error(`Cel·la d'edifici desconeguda: ${layer}:${row}:${column}`)
  const kind: BuildingCellKind = unitId.startsWith('home-')
    ? 'home'
    : unitId.startsWith('shop-')
      ? 'shop'
      : unitId === 'stairs'
        ? 'stairs'
        : unitId === 'entrance'
          ? 'entrance'
          : 'landing'
  return { unitId, kind, blocked: !homeAnchors.has(`${layer}:${row}:${column}`) }
}

const floorNames: Record<Locale, readonly string[]> = {
  ca: ['Planta baixa', 'Primer pis', 'Segon pis', 'Tercer pis', 'Quart pis'],
  es: ['Planta baja', 'Primer piso', 'Segundo piso', 'Tercer piso', 'Cuarto piso'],
  en: ['Ground floor', 'First floor', 'Second floor', 'Third floor', 'Fourth floor'],
}

const shortFloorNames: Record<Locale, readonly string[]> = {
  ca: ['PB', '1r', '2n', '3r', '4t'],
  es: ['PB', '1.º', '2.º', '3.º', '4.º'],
  en: ['G', '1', '2', '3', '4'],
}

const unitNames: Record<Locale, Record<string, string>> = {
  ca: {
    'shop-left': 'La botiga del xamfrà',
    'shop-right': 'La botiga del pati',
    'home-a': 'La llar assolellada',
    'home-b': 'La llar del balcó',
    'home-c': 'La llar tranquil·la',
    'home-d': 'La llar verda',
    landing: 'El replà',
    stairs: "L'escala",
    entrance: "L'entrada",
  },
  es: {
    'shop-left': 'La tienda de la esquina',
    'shop-right': 'La tienda del patio',
    'home-a': 'El hogar soleado',
    'home-b': 'El hogar del balcón',
    'home-c': 'El hogar tranquilo',
    'home-d': 'El hogar verde',
    landing: 'El rellano',
    stairs: 'La escalera',
    entrance: 'La entrada',
  },
  en: {
    'shop-left': 'The corner shop',
    'shop-right': 'The courtyard shop',
    'home-a': 'The sunny home',
    'home-b': 'The balcony home',
    'home-c': 'The quiet home',
    'home-d': 'The green home',
    landing: 'The landing',
    stairs: 'The stairs',
    entrance: 'The entrance',
  },
}

export const buildingFloorLabel = (locale: Locale, layer: number) =>
  floorNames[locale][layer] ?? floorNames[locale][0]!

export const buildingFloorShortLabel = (locale: Locale, layer: number) =>
  shortFloorNames[locale][layer] ?? shortFloorNames[locale][0]!

export const buildingSummary = (locale: Locale) =>
  ({
    ca: '5 plantes · 16 llars',
    es: '5 plantas · 16 hogares',
    en: '5 floors · 16 homes',
  })[locale]

export const buildingUnitLabel = (locale: Locale, unitId: string, layer: number) => {
  const unit = unitNames[locale][unitId] ?? unitId
  return `${unit} · ${buildingFloorLabel(locale, layer)}`
}

const buildingUnits = [
  'shop-left',
  'shop-right',
  'entrance',
  'landing',
  'stairs',
  'home-a',
  'home-b',
  'home-c',
  'home-d',
] as const

export const buildingPlaceIndex = (layer: number, unitId: string) => {
  const unitIndex = buildingUnits.indexOf(unitId as (typeof buildingUnits)[number])
  if (unitIndex < 0) throw new Error(`Unitat d'edifici desconeguda: ${unitId}`)
  return layer * buildingUnits.length + unitIndex
}

export const buildingUnitsAreNeighbors = (first: Position, second: Position) => {
  if (
    first.layer === undefined ||
    second.layer === undefined ||
    first.layer !== second.layer ||
    !first.buildingUnitId ||
    !second.buildingUnitId ||
    first.buildingUnitId === second.buildingUnitId
  ) {
    return false
  }
  const layer = first.layer
  for (let row = 0; row < BUILDING_ROWS; row += 1) {
    for (let column = 0; column < BUILDING_COLUMNS; column += 1) {
      if (unitAt(layer, row, column) !== first.buildingUnitId) continue
      const neighbors = [
        [row - 1, column],
        [row + 1, column],
        [row, column - 1],
        [row, column + 1],
      ] as const
      if (
        neighbors.some(
          ([nextRow, nextColumn]) =>
            unitAt(layer, nextRow, nextColumn) === second.buildingUnitId,
        )
      ) {
        return true
      }
    }
  }
  return false
}

export const isBuildingAbove = (first: Position, second: Position) =>
  first.layer !== undefined &&
  second.layer !== undefined &&
  first.layer === second.layer + 1 &&
  first.buildingUnitId !== undefined &&
  first.buildingUnitId === second.buildingUnitId
