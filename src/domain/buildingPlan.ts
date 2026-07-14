import type { BuildingSize, Locale, Position } from './types'

export type BuildingCellKind = 'home' | 'shop' | 'landing' | 'stairs' | 'entrance'

export const BUILDING_ROWS = 5
export const BUILDING_COLUMNS = 5
export const BUILDING_DEPTHS = [3, 4, 5, 6, 7, 8, 9, 10] as const
export type BuildingDepth = BuildingSize
export const MAX_BUILDING_DEPTH: BuildingDepth = 10
export const BUILDING_CHARACTER_COUNT = 8

export const isBuildingDepth = (value: unknown): value is BuildingDepth =>
  typeof value === 'number' && BUILDING_DEPTHS.includes(value as BuildingDepth)

export const buildingDepthForPositions = (positions: readonly Position[]): BuildingDepth => {
  const layers = positions.flatMap((position) =>
    position.layer === undefined ? [] : [position.layer],
  )
  const depth = layers.length === 0 ? 0 : Math.max(...layers) + 1
  if (!isBuildingDepth(depth)) throw new Error(`Alçada d'edifici desconeguda: ${depth}`)
  if (positions.length !== depth * BUILDING_ROWS * BUILDING_COLUMNS) {
    throw new Error(`Nombre de cel·les d'edifici incorrecte: ${positions.length}`)
  }
  const coordinates = new Set<string>()
  for (const position of positions) {
    if (
      !Number.isInteger(position.layer) ||
      !Number.isInteger(position.row) ||
      !Number.isInteger(position.column) ||
      position.layer === undefined ||
      position.layer < 0 ||
      position.layer >= depth ||
      position.row < 0 ||
      position.row >= BUILDING_ROWS ||
      position.column < 0 ||
      position.column >= BUILDING_COLUMNS
    ) {
      throw new Error(`Coordenada d'edifici incorrecta: ${position.id}`)
    }
    const coordinate = `${position.layer}:${position.row}:${position.column}`
    if (coordinates.has(coordinate)) {
      throw new Error(`Coordenada d'edifici repetida: ${coordinate}`)
    }
    coordinates.add(coordinate)
    const canonical = buildingCellAt(position.layer, position.row, position.column)
    if (
      position.buildingUnitId !== canonical.unitId ||
      position.buildingKind !== canonical.kind ||
      Boolean(position.blocked) !== canonical.blocked
    ) {
      throw new Error(`Geometria d'edifici alterada: ${coordinate}`)
    }
  }
  return depth
}

export const hasCanonicalBuildingGeometry = (positions: readonly Position[]) => {
  try {
    buildingDepthForPositions(positions)
    return true
  } catch {
    return false
  }
}

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

// Every blocked room cell receives visible furniture in LogicCubeBoard. All other
// home and shop cells are genuine solver and interaction candidates.
const fixtureCells = new Set([
  '0:0:1',
  '0:2:0',
  '0:3:1',
  '0:0:3',
  '0:1:4',
  '0:3:3',
  '1:0:1',
  '1:2:0',
  '1:0:3',
  '1:2:4',
  '1:3:1',
  '1:4:3',
  '2:0:0',
  '2:2:1',
  '2:0:4',
  '2:2:3',
  '2:4:0',
  '2:3:4',
  '3:0:1',
  '3:2:0',
  '3:1:3',
  '3:2:4',
  '3:3:0',
  '3:4:4',
  '4:1:0',
  '4:2:1',
  '4:0:3',
  '4:1:4',
  '4:4:1',
  '4:3:3',
])

export const buildingCellAt = (
  layer: number,
  row: number,
  column: number,
): BuildingCellDefinition => {
  if (layer < 0 || layer >= MAX_BUILDING_DEPTH) {
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
  // Residential fixture layouts repeat every four floors. This keeps every
  // blocked room cell visibly furnished without making tall buildings clones.
  const fixtureLayer = layer === 0 ? 0 : ((layer - 1) % 4) + 1
  const key = `${fixtureLayer}:${row}:${column}`
  const isRoom = kind === 'home' || kind === 'shop'
  return { unitId, kind, blocked: !isRoom || fixtureCells.has(key) }
}

const playableBuildingCells = (depth: BuildingDepth) =>
  Array.from({ length: depth * BUILDING_ROWS * BUILDING_COLUMNS }, (_, index) => {
    const floorSize = BUILDING_ROWS * BUILDING_COLUMNS
    const layer = Math.floor(index / floorSize)
    const row = Math.floor((index % floorSize) / BUILDING_COLUMNS)
    const column = index % BUILDING_COLUMNS
    return buildingCellAt(layer, row, column)
  }).filter((cell) => !cell.blocked)

export const buildingHomeCount = (depth: BuildingDepth) =>
  playableBuildingCells(depth).filter((cell) => cell.kind === 'home').length

export const buildingShopCount = (depth: BuildingDepth) =>
  playableBuildingCells(depth).filter((cell) => cell.kind === 'shop').length

export const buildingPlayableCount = (depth: BuildingDepth) =>
  playableBuildingCells(depth).length

// cspell:disable -- eu/gl/fr/de labels are covered by locale parity review.
const floorNames: Record<Locale, readonly string[]> = {
  ca: [
    'Planta baixa',
    'Primer pis',
    'Segon pis',
    'Tercer pis',
    'Quart pis',
    'Cinquè pis',
    'Sisè pis',
    'Setè pis',
    'Vuitè pis',
    'Novè pis',
  ],
  es: [
    'Planta baja',
    'Primer piso',
    'Segundo piso',
    'Tercer piso',
    'Cuarto piso',
    'Quinto piso',
    'Sexto piso',
    'Séptimo piso',
    'Octavo piso',
    'Noveno piso',
  ],
  en: [
    'Ground floor',
    'First floor',
    'Second floor',
    'Third floor',
    'Fourth floor',
    'Fifth floor',
    'Sixth floor',
    'Seventh floor',
    'Eighth floor',
    'Ninth floor',
  ],
  eu: [
    'Beheko solairua',
    'Lehen solairua',
    'Bigarren solairua',
    'Hirugarren solairua',
    'Laugarren solairua',
    'Bosgarren solairua',
    'Seigarren solairua',
    'Zazpigarren solairua',
    'Zortzigarren solairua',
    'Bederatzigarren solairua',
  ],
  gl: [
    'Planta baixa',
    'Primeiro andar',
    'Segundo andar',
    'Terceiro andar',
    'Cuarto andar',
    'Quinto andar',
    'Sexto andar',
    'Sétimo andar',
    'Oitavo andar',
    'Noveno andar',
  ],
  fr: [
    'Rez-de-chaussée',
    'Premier étage',
    'Deuxième étage',
    'Troisième étage',
    'Quatrième étage',
    'Cinquième étage',
    'Sixième étage',
    'Septième étage',
    'Huitième étage',
    'Neuvième étage',
  ],
  de: [
    'Erdgeschoss',
    'Erster Stock',
    'Zweiter Stock',
    'Dritter Stock',
    'Vierter Stock',
    'Fünfter Stock',
    'Sechster Stock',
    'Siebter Stock',
    'Achter Stock',
    'Neunter Stock',
  ],
}

const shortFloorNames: Record<Locale, readonly string[]> = {
  ca: ['PB', '1r', '2n', '3r', '4t', '5è', '6è', '7è', '8è', '9è'],
  es: ['PB', '1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º'],
  en: ['G', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  eu: ['BS', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'],
  gl: ['PB', '1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º'],
  fr: ['RDC', '1er', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e'],
  de: ['EG', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'],
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
  eu: {
    'shop-left': 'Izkinako denda',
    'shop-right': 'Patioko denda',
    'home-a': 'Etxe eguzkitsua',
    'home-b': 'Balkoiko etxea',
    'home-c': 'Etxe lasaia',
    'home-d': 'Etxe berdea',
    landing: 'Eskailburua',
    stairs: 'Eskailerak',
    entrance: 'Sarrera',
  },
  gl: {
    'shop-left': 'A tenda da esquina',
    'shop-right': 'A tenda do patio',
    'home-a': 'O fogar soleado',
    'home-b': 'O fogar do balcón',
    'home-c': 'O fogar tranquilo',
    'home-d': 'O fogar verde',
    landing: 'O relanzo',
    stairs: 'As escaleiras',
    entrance: 'A entrada',
  },
  fr: {
    'shop-left': "La boutique d'angle",
    'shop-right': 'La boutique de la cour',
    'home-a': 'Le logement ensoleillé',
    'home-b': 'Le logement avec balcon',
    'home-c': 'Le logement tranquille',
    'home-d': 'Le logement vert',
    landing: 'Le palier',
    stairs: "L'escalier",
    entrance: "L'entrée",
  },
  de: {
    'shop-left': 'Der Eckladen',
    'shop-right': 'Der Laden am Innenhof',
    'home-a': 'Das sonnige Zuhause',
    'home-b': 'Das Zuhause mit Balkon',
    'home-c': 'Das ruhige Zuhause',
    'home-d': 'Das grüne Zuhause',
    landing: 'Der Treppenabsatz',
    stairs: 'Die Treppe',
    entrance: 'Der Eingang',
  },
}

export const buildingFloorLabel = (locale: Locale, layer: number) =>
  floorNames[locale][layer] ?? floorNames[locale][0]!

export const buildingFloorShortLabel = (locale: Locale, layer: number) =>
  shortFloorNames[locale][layer] ?? shortFloorNames[locale][0]!

export const buildingSummary = (locale: Locale, depth: BuildingDepth) => {
  const homes = (depth - 1) * 4
  return {
    ca: `${homes} llars + 2 botigues`,
    es: `${homes} hogares + 2 tiendas`,
    en: `${homes} homes + 2 shops`,
    eu: `${homes} etxebizitza + 2 denda`,
    gl: `${homes} fogares + 2 tendas`,
    fr: `${homes} logements + 2 boutiques`,
    de: `${homes} Wohnungen + 2 Geschäfte`,
  }[locale]
}

// cspell:enable

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
