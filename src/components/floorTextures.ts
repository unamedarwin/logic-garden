import type { ThemeId } from '../domain/types'

export type FloorMaterial =
  | 'artificial-turf'
  | 'carpet'
  | 'concrete'
  | 'cork'
  | 'grass'
  | 'metal'
  | 'mosaic'
  | 'parquet'
  | 'rubber'
  | 'sand'
  | 'soil'
  | 'stage'
  | 'stone'
  | 'water'

type AdvancedThemeId = Extract<
  ThemeId,
  | 'music-studio'
  | 'sports-festival'
  | 'creative-lab'
  | 'book-club'
  | 'city-garden'
  | 'weekend-market'
>

export interface FloorTexture {
  readonly baseColor: string
  readonly material: FloorMaterial
  readonly layers: readonly [string, string, string]
}

const svgPattern = (side: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">${body}</svg>`,
  )}")`

const patternPath = (
  side: number,
  path: string,
  fill: string,
  opacity: number,
  fillRule?: 'evenodd',
) =>
  svgPattern(
    side,
    `<path fill="${fill}" fill-opacity="${opacity}"${fillRule ? ` fill-rule="${fillRule}"` : ''} d="${path}"/>`,
  )

// Adapted from Hero Patterns by Steve Schoger (CC BY 4.0). The original square SVG tiles are
// recolored and layered locally; no texture is fetched while the game is running.
const heroPatterns = {
  parkay: (fill: string, opacity: number) =>
    patternPath(
      40,
      'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0zm4 0h2v20H4zm4 0h2v20H8zm4 0h2v20h-2zm4 0h2v20h-2zm4 4h20v2H20zm0 4h20v2H20zm0 4h20v2H20zm0 4h20v2H20z',
      fill,
      opacity,
    ),
  floorTile: (fill: string, opacity: number) =>
    patternPath(30, 'M0 10h10v10H0zm10-10h10v10H10z', fill, opacity),
  hideout: (fill: string, opacity: number) =>
    patternPath(
      40,
      'M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0zm38.59 38.6l-2.83-2.83 1.41-1.41L40 38.59V40zm1.41-38.59l-2.83 2.83-1.41-1.41L38.59 0H40zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41z',
      fill,
      opacity,
    ),
  pixelDots: (fill: string, opacity: number) =>
    patternPath(
      16,
      'M0 0h16v2h-6v6h6v8H8v-6H2v6H0zm4 4h2v2H4zm8 8h2v2h-2zm-8 0h2v2H4zm8-8h2v2h-2z',
      fill,
      opacity,
    ),
  tinyCheckers: (fill: string, opacity: number) =>
    patternPath(8, 'M0 0h4v4H0zm4 4h4v4H4z', fill, opacity, 'evenodd'),
  texture: (fill: string, opacity: number) =>
    patternPath(4, 'M1 3h1v1H1zm2-2h1v1H3z', fill, opacity),
  bathroomFloor: (fill: string, opacity: number) =>
    patternPath(
      80,
      'M0 0h40v40H0zm40 40h40v40H40zm0-40h2l-2 2zm0 4l4-4h2l-6 6zm0 4l8-8h2L40 10zm0 4L52 0h2L40 14zm0 4L56 0h2L40 18zm0 4L60 0h2L40 22zm0 4L64 0h2L40 26zm0 4L68 0h2L40 30zm0 4L72 0h2L40 34zm0 4L76 0h2L40 38zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z',
      fill,
      opacity,
      'evenodd',
    ),
  bubbles: (fill: string, opacity: number) =>
    patternPath(
      100,
      'M11 18a7 7 0 100-14 7 7 0 000 14zm48 25a7 7 0 100-14 7 7 0 000 14zM16 36a3 3 0 100-6 3 3 0 000 6zm63 31a3 3 0 100-6 3 3 0 000 6zM34 90a3 3 0 100-6 3 3 0 000 6zm56-76a3 3 0 100-6 3 3 0 000 6zM12 86a4 4 0 100-8 4 4 0 000 8zm28-65a4 4 0 100-8 4 4 0 000 8zm23-11a5 5 0 100-10 5 5 0 000 10zm-6 60a4 4 0 100-8 4 4 0 000 8zm29 22a5 5 0 100-10 5 5 0 000 10zM32 63a5 5 0 100-10 5 5 0 000 10zm57-13a5 5 0 100-10 5 5 0 000 10zm-9-21a2 2 0 100-4 2 2 0 000 4zM60 91a2 2 0 100-4 2 2 0 000 4zM35 41a2 2 0 100-4 2 2 0 000 4zM12 60a2 2 0 100-4 2 2 0 000 4z',
      fill,
      opacity,
    ),
  leaf: (fill: string, opacity: number) => {
    const leafPath =
      'M0 40a19.96 19.96 0 015.9-14.11 20.17 20.17 0 0119.44-5.2A20 20 0 0120.2 40H0zM65.32.75A20.02 20.02 0 0140.8 25.26 20.02 20.02 0 0165.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 01.75 5.25 20.08 20.08 0 01.07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 002 40zm5.38 0h9.8a17.98 17.98 0 006.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0063.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0017.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'
    return svgPattern(
      80,
      `<g fill="${fill}" fill-opacity="${opacity}"><path d="${leafPath}"/><path transform="translate(0 40)" d="${leafPath}"/></g>`,
    )
  },
}

const textureCatalog: Readonly<Record<FloorMaterial, Omit<FloorTexture, 'material'>>> = {
  parquet: {
    baseColor: '#d4b98d',
    layers: [
      heroPatterns.parkay('#38271d', 0.13),
      heroPatterns.texture('#fff9eb', 0.16),
      heroPatterns.pixelDots('#4a3426', 0.035),
    ],
  },
  mosaic: {
    baseColor: '#b8d0ca',
    layers: [
      heroPatterns.floorTile('#fffdf4', 0.2),
      heroPatterns.hideout('#3e5550', 0.075),
      heroPatterns.texture('#fffdf4', 0.14),
    ],
  },
  carpet: {
    baseColor: '#8d789f',
    layers: [
      heroPatterns.tinyCheckers('#fff7e8', 0.085),
      heroPatterns.pixelDots('#271f39', 0.045),
      heroPatterns.texture('#fff7e8', 0.16),
    ],
  },
  rubber: {
    baseColor: '#5e7581',
    layers: [
      heroPatterns.bubbles('#182a31', 0.075),
      heroPatterns.pixelDots('#fff8ec', 0.085),
      heroPatterns.texture('#fff8ec', 0.12),
    ],
  },
  cork: {
    baseColor: '#c9aa78',
    layers: [
      heroPatterns.bubbles('#5a432d', 0.045),
      heroPatterns.pixelDots('#3e3125', 0.085),
      heroPatterns.texture('#fff5dc', 0.17),
    ],
  },
  grass: {
    baseColor: '#a9c68e',
    layers: [
      heroPatterns.leaf('#315b3e', 0.12),
      heroPatterns.texture('#fff9dc', 0.1),
      heroPatterns.pixelDots('#55764a', 0.055),
    ],
  },
  soil: {
    baseColor: '#bd986b',
    layers: [
      heroPatterns.bubbles('#5c4630', 0.04),
      heroPatterns.pixelDots('#463626', 0.095),
      heroPatterns.texture('#fff0d1', 0.12),
    ],
  },
  stone: {
    baseColor: '#b9c1b9',
    layers: [
      heroPatterns.bathroomFloor('#475953', 0.08),
      heroPatterns.floorTile('#fffdf4', 0.12),
      heroPatterns.texture('#405049', 0.07),
    ],
  },
  sand: {
    baseColor: '#dfc88f',
    layers: [
      heroPatterns.bubbles('#775d36', 0.055),
      heroPatterns.pixelDots('#fff5d5', 0.08),
      heroPatterns.texture('#6b5738', 0.065),
    ],
  },
  water: {
    baseColor: '#84bcc8',
    layers: [
      heroPatterns.bubbles('#e7fbff', 0.2),
      heroPatterns.floorTile('#2f6f80', 0.035),
      heroPatterns.texture('#e7fbff', 0.12),
    ],
  },
  concrete: {
    baseColor: '#b9bcb6',
    layers: [
      heroPatterns.bubbles('#4f5652', 0.035),
      heroPatterns.pixelDots('#4b514e', 0.055),
      heroPatterns.texture('#fffdf5', 0.14),
    ],
  },
  metal: {
    baseColor: '#80989e',
    layers: [
      heroPatterns.bathroomFloor('#263a3f', 0.065),
      heroPatterns.tinyCheckers('#eaf5f4', 0.085),
      heroPatterns.hideout('#eaf5f4', 0.045),
    ],
  },
  stage: {
    baseColor: '#75535f',
    layers: [
      heroPatterns.parkay('#2b1720', 0.16),
      heroPatterns.floorTile('#ffdca8', 0.075),
      heroPatterns.hideout('#fff1d4', 0.1),
    ],
  },
  'artificial-turf': {
    baseColor: '#4f9273',
    layers: [
      heroPatterns.floorTile('#e7ffd8', 0.075),
      heroPatterns.pixelDots('#123f35', 0.075),
      heroPatterns.texture('#e7ffd8', 0.14),
    ],
  },
}

const themeMaterials: Readonly<Record<AdvancedThemeId, readonly FloorMaterial[]>> = {
  'music-studio': ['stage', 'carpet', 'metal', 'rubber', 'parquet', 'concrete'],
  'sports-festival': ['artificial-turf', 'rubber', 'concrete', 'grass', 'mosaic', 'cork'],
  'creative-lab': ['cork', 'concrete', 'metal', 'carpet', 'mosaic', 'parquet'],
  'book-club': ['parquet', 'carpet', 'parquet', 'cork', 'mosaic', 'concrete'],
  'city-garden': ['grass', 'soil', 'parquet', 'stone', 'stone', 'soil'],
  'weekend-market': ['stone', 'mosaic', 'concrete', 'parquet', 'sand', 'mosaic'],
}

const isAdvancedTheme = (themeId: ThemeId): themeId is AdvancedThemeId =>
  themeId in themeMaterials

export const floorMaterialIds = [
  'artificial-turf',
  'carpet',
  'concrete',
  'cork',
  'grass',
  'metal',
  'mosaic',
  'parquet',
  'rubber',
  'sand',
  'soil',
  'stage',
  'stone',
  'water',
] as const satisfies readonly FloorMaterial[]

export const floorTextureForMaterial = (material: FloorMaterial): FloorTexture => ({
  material,
  ...textureCatalog[material],
})

export const floorTextureForRoom = (themeId: ThemeId, roomIndex: number): FloorTexture => {
  const materials = isAdvancedTheme(themeId)
    ? themeMaterials[themeId]
    : themeMaterials['book-club']
  const material = materials[roomIndex % materials.length] ?? 'parquet'
  return floorTextureForMaterial(material)
}
