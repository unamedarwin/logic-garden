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

const patternMarkup = (side: number, parts: readonly string[]) =>
  svgPattern(side, parts.join(''))

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

const bespokePatterns = {
  parquetSeams: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="2.6" fill="none">`,
      '<path d="M0 0h62v48H0zM62 0h34v48H62zM0 48h34v48H0zM34 48h62v48H34z"/>',
      '<path d="M18 0v48M44 0v48M78 48v48M52 48v48"/>',
      '<path d="M0 14h62M0 34h62M34 66h62M34 84h62"/>',
      '</g>',
    ]),
  woodGrain: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.25" fill="none" stroke-linecap="round">`,
      '<path d="M4 10c12-4 24-4 36 0M2 22c14 5 28 5 42 0M6 34c11-4 21-4 32 0"/>',
      '<path d="M56 58c11-4 23-4 35 0M52 70c14 5 27 5 40 0M54 82c11-4 22-4 34 0"/>',
      '<path d="M58 10c9-3 19-3 28 0M10 58c10-3 20-3 30 0"/>',
      '</g>',
    ]),
  mosaicTiles: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<rect x="3" y="3" width="25" height="19" rx="4" transform="rotate(-2 15 12.5)"/>',
      '<rect x="33" y="2" width="29" height="23" rx="5" transform="rotate(3 47 13.5)"/>',
      '<rect x="69" y="4" width="24" height="18" rx="4" transform="rotate(-4 81 13)"/>',
      '<rect x="2" y="31" width="20" height="28" rx="4" transform="rotate(4 12 45)"/>',
      '<rect x="28" y="31" width="31" height="25" rx="5" transform="rotate(-3 43.5 43.5)"/>',
      '<rect x="66" y="30" width="28" height="27" rx="5" transform="rotate(2 80 43.5)"/>',
      '<rect x="4" y="68" width="29" height="25" rx="5" transform="rotate(-3 18.5 80.5)"/>',
      '<rect x="39" y="66" width="21" height="28" rx="4" transform="rotate(4 49.5 80)"/>',
      '<rect x="67" y="68" width="26" height="24" rx="5" transform="rotate(-2 80 80)"/>',
      '</g>',
    ]),
  mosaicGlaze: (fill: string, opacity: number) =>
    patternMarkup(72, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.4" fill="none" stroke-linecap="round">`,
      '<path d="M3 24h66M3 48h66M24 3v66M48 3v66"/>',
      '<path d="M8 10c3 2 6 2 9 0M32 14c4 2 7 2 10 0M56 10c3 2 6 2 9 0"/>',
      '<path d="M12 38c3 2 6 2 9 0M36 34c4 2 7 2 10 0M54 40c4 2 8 2 11 0"/>',
      '<path d="M8 58c3 2 6 2 9 0M30 60c4 2 8 2 12 0M56 58c3 2 6 2 9 0"/>',
      '</g>',
    ]),
  carpetWeave: (fill: string, opacity: number) =>
    patternMarkup(48, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="3" stroke-linecap="round">`,
      '<path d="M0 6h48M0 18h48M0 30h48M0 42h48"/>',
      '<path d="M6 0v48M18 0v48M30 0v48M42 0v48"/>',
      '</g>',
    ]),
  carpetNap: (fill: string, opacity: number) =>
    patternMarkup(48, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.4" fill="none" stroke-linecap="round">`,
      '<path d="M2 10c4-2 8-2 12 0M20 6c4-2 8-2 12 0M34 14c4-2 8-2 12 0"/>',
      '<path d="M4 26c5 2 9 2 13 0M18 22c4 2 8 2 12 0M32 30c5 2 9 2 13 0"/>',
      '<path d="M6 38c4-2 8-2 12 0M22 42c4-2 8-2 12 0M36 38c4-2 8-2 12 0"/>',
      '</g>',
    ]),
  rubberStuds: (fill: string, opacity: number) =>
    patternMarkup(54, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<circle cx="9" cy="9" r="4.6"/><circle cx="27" cy="9" r="4.6"/><circle cx="45" cy="9" r="4.6"/>',
      '<circle cx="18" cy="27" r="4.6"/><circle cx="36" cy="27" r="4.6"/>',
      '<circle cx="9" cy="45" r="4.6"/><circle cx="27" cy="45" r="4.6"/><circle cx="45" cy="45" r="4.6"/>',
      '</g>',
    ]),
  rubberGrip: (fill: string, opacity: number) =>
    patternMarkup(54, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.25" fill="none" stroke-linecap="round">`,
      '<path d="M6 18h6M24 18h6M42 18h6M15 36h6M33 36h6"/>',
      '<path d="M6 0l12 12M24 0l12 12M42 0l12 12M-3 18l12 12M15 18l12 12M33 18l12 12"/>',
      '</g>',
    ]),
  corkFlakes: (fill: string, opacity: number) =>
    patternMarkup(84, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<path d="M5 13l6-5l7 2l4 7l-5 7l-9 1l-5-5z"/>',
      '<path d="M33 7l9-3l8 5l-1 9l-7 5l-10-3l-3-7z"/>',
      '<path d="M61 16l8-4l8 4l1 8l-7 6l-9-2l-4-6z"/>',
      '<path d="M14 43l8-4l9 5l1 8l-7 7l-10-2l-4-7z"/>',
      '<path d="M47 37l8-3l8 5l-1 8l-8 5l-9-3l-3-7z"/>',
      '<path d="M66 54l7-4l8 4l1 8l-6 7l-9-2l-4-7z"/>',
      '<path d="M7 68l7-5l8 3l3 7l-5 8l-9-1l-5-6z"/>',
      '<path d="M36 65l9-4l8 5l1 8l-7 7l-10-2l-4-7z"/>',
      '</g>',
    ]),
  corkPores: (fill: string, opacity: number) =>
    patternMarkup(84, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<circle cx="12" cy="14" r="1.6"/><circle cx="24" cy="20" r="1.4"/><circle cx="40" cy="16" r="1.5"/>',
      '<circle cx="58" cy="24" r="1.4"/><circle cx="72" cy="18" r="1.6"/><circle cx="18" cy="48" r="1.5"/>',
      '<circle cx="34" cy="38" r="1.4"/><circle cx="54" cy="44" r="1.5"/><circle cx="70" cy="58" r="1.5"/>',
      '<circle cx="12" cy="70" r="1.6"/><circle cx="42" cy="72" r="1.4"/><circle cx="62" cy="68" r="1.5"/>',
      '</g>',
    ]),
  grassBlades: (fill: string, opacity: number) =>
    patternMarkup(80, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.6" fill="none" stroke-linecap="round">`,
      '<path d="M8 24c3-11 8-19 16-24M16 26c4-10 11-18 20-24M24 24c5-8 12-14 20-18"/>',
      '<path d="M42 44c3-11 8-19 16-24M50 46c4-10 11-18 20-24M58 44c5-8 12-14 20-18"/>',
      '<path d="M8 66c4-10 10-18 18-24M18 70c4-10 10-18 18-24M28 66c4-8 10-14 18-18"/>',
      '</g>',
    ]),
  grassHighlights: (fill: string, opacity: number) =>
    patternMarkup(80, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1" fill="none" stroke-linecap="round">`,
      '<path d="M6 18c8 4 16 4 24 0M38 38c8 4 16 4 24 0M10 60c8 4 16 4 24 0"/>',
      '<path d="M24 8c3 7 8 12 15 15M56 28c3 7 8 12 15 15M34 50c3 7 8 12 15 15"/>',
      '</g>',
    ]),
  soilClumps: (fill: string, opacity: number) =>
    patternMarkup(84, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<path d="M5 14l5-6l9 1l5 5l-3 7l-8 3l-7-4z"/>',
      '<path d="M29 10l8-5l10 2l5 6l-4 7l-10 2l-8-4z"/>',
      '<path d="M56 17l7-5l11 2l5 6l-4 8l-10 2l-8-5z"/>',
      '<path d="M12 42l8-5l10 3l4 7l-5 7l-10 2l-8-5z"/>',
      '<path d="M41 37l10-5l10 4l4 8l-6 8l-11 1l-8-6z"/>',
      '<path d="M64 54l7-5l9 2l3 7l-5 7l-9 1l-6-5z"/>',
      '<path d="M8 70l8-5l10 3l3 7l-5 7l-10 1l-7-5z"/>',
      '<path d="M38 67l8-5l10 3l4 7l-5 8l-10 0l-7-5z"/>',
      '</g>',
    ]),
  soilPebbles: (fill: string, opacity: number) =>
    patternMarkup(84, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<circle cx="10" cy="12" r="1.7"/><circle cx="28" cy="22" r="1.5"/><circle cx="42" cy="18" r="1.6"/>',
      '<circle cx="58" cy="28" r="1.5"/><circle cx="74" cy="14" r="1.7"/><circle cx="18" cy="48" r="1.6"/>',
      '<circle cx="38" cy="44" r="1.5"/><circle cx="60" cy="42" r="1.7"/><circle cx="70" cy="64" r="1.6"/>',
      '<circle cx="10" cy="72" r="1.7"/><circle cx="34" cy="66" r="1.5"/><circle cx="56" cy="72" r="1.7"/>',
      '</g>',
    ]),
  stoneSlabs: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="2.4" fill="none">`,
      '<path d="M0 18h54v24H0zM54 0h42v28H54zM60 28h36v26H60zM0 42h34v26H0z"/>',
      '<path d="M34 42h30v26H34zM64 54h32v24H64zM0 68h44v28H0zM44 70h52v26H44z"/>',
      '</g>',
    ]),
  stoneSpeckles: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<circle cx="10" cy="10" r="1.8"/><circle cx="28" cy="26" r="1.4"/><circle cx="72" cy="12" r="1.6"/>',
      '<circle cx="88" cy="22" r="1.8"/><circle cx="18" cy="54" r="1.7"/><circle cx="50" cy="46" r="1.5"/>',
      '<circle cx="82" cy="58" r="1.8"/><circle cx="24" cy="82" r="1.6"/><circle cx="66" cy="84" r="1.7"/>',
      '</g>',
    ]),
  sandRipples: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.4" fill="none" stroke-linecap="round">`,
      '<path d="M2 16c10 4 22 4 34 0c12-4 24-4 36 0c8 3 16 3 24 0"/>',
      '<path d="M0 34c10 4 22 4 34 0c12-4 24-4 36 0c8 3 16 3 24 0"/>',
      '<path d="M2 54c10 4 22 4 34 0c12-4 24-4 36 0c8 3 16 3 24 0"/>',
      '<path d="M0 74c10 4 22 4 34 0c12-4 24-4 36 0c8 3 16 3 24 0"/>',
      '</g>',
    ]),
  sandGrains: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<circle cx="8" cy="12" r="1.3"/><circle cx="26" cy="20" r="1.1"/><circle cx="42" cy="14" r="1.2"/>',
      '<circle cx="64" cy="24" r="1.1"/><circle cx="82" cy="18" r="1.3"/><circle cx="18" cy="44" r="1.2"/>',
      '<circle cx="36" cy="50" r="1.1"/><circle cx="58" cy="42" r="1.2"/><circle cx="76" cy="58" r="1.1"/>',
      '<circle cx="10" cy="78" r="1.3"/><circle cx="30" cy="70" r="1.1"/><circle cx="50" cy="76" r="1.2"/><circle cx="72" cy="82" r="1.1"/>',
      '</g>',
    ]),
  waterRipples: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.8" fill="none" stroke-linecap="round">`,
      '<path d="M6 18c8-5 16-5 24 0s16 5 24 0s16-5 24 0s8 5 12 3"/>',
      '<path d="M0 40c8-5 16-5 24 0s16 5 24 0s16-5 24 0s16 5 24 0"/>',
      '<path d="M6 62c8-5 16-5 24 0s16 5 24 0s16-5 24 0s8 5 12 3"/>',
      '<path d="M0 84c8-5 16-5 24 0s16 5 24 0s16-5 24 0s16 5 24 0"/>',
      '</g>',
    ]),
  waterHighlights: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<ellipse cx="14" cy="20" rx="8" ry="3"/><ellipse cx="42" cy="38" rx="10" ry="3.5"/>',
      '<ellipse cx="74" cy="18" rx="9" ry="3"/><ellipse cx="24" cy="62" rx="10" ry="3.5"/>',
      '<ellipse cx="62" cy="72" rx="11" ry="3.8"/><ellipse cx="84" cy="50" rx="7" ry="2.8"/>',
      '</g>',
    ]),
  concreteAggregate: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<path d="M8 15l4-4l6 1l3 5l-4 5l-6 0z"/><path d="M25 9l4-3l5 2l1 5l-4 3l-5-2z"/>',
      '<path d="M43 17l4-4l6 2l2 5l-5 4l-6-2z"/><path d="M65 11l5-3l6 2l2 5l-5 4l-7-2z"/>',
      '<path d="M82 21l4-4l6 2l2 5l-4 4l-7-2z"/><path d="M17 41l5-3l6 2l2 5l-4 4l-7-2z"/>',
      '<path d="M39 39l4-4l6 1l3 5l-4 5l-7-1z"/><path d="M59 45l5-3l6 2l1 5l-5 4l-6-2z"/>',
      '<path d="M77 55l4-4l6 2l2 5l-4 4l-7-2z"/><path d="M11 73l5-4l6 2l2 5l-4 4l-7-2z"/>',
      '<path d="M31 65l4-3l6 2l2 5l-4 4l-7-2z"/><path d="M53 75l5-4l6 2l2 5l-4 4l-7-2z"/>',
      '<path d="M73 81l4-3l6 2l1 5l-4 4l-6-2z"/>',
      '</g>',
    ]),
  concreteCracks: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g fill="${fill}" fill-opacity="${opacity * 0.28}">`,
      '<ellipse cx="18" cy="18" rx="13" ry="5" transform="rotate(-18 18 18)"/>',
      '<ellipse cx="69" cy="27" rx="17" ry="5" transform="rotate(12 69 27)"/>',
      '<ellipse cx="31" cy="72" rx="15" ry="4" transform="rotate(8 31 72)"/>',
      '<ellipse cx="80" cy="76" rx="10" ry="4" transform="rotate(-20 80 76)"/>',
      '</g>',
      `<g stroke="${fill}" stroke-opacity="${opacity * 0.55}" stroke-width="0.8" fill="none" stroke-linecap="round" stroke-linejoin="round">`,
      '<path d="M7 51l9-3l6 2l8-4"/>',
      '<path d="M57 6l6 3l5-2"/>',
      '</g>',
    ]),
  metalBrushed: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.1" fill="none" stroke-linecap="round">`,
      '<path d="M0 12h96M0 28h96M0 46h96M0 65h96M0 83h96"/>',
      '<path d="M18 0l9 9M58 0l9 9M84 18l12 12M4 58l12 12M46 76l10 10"/>',
      '</g>',
    ]),
  metalRivets: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.5" fill="none">`,
      '<circle cx="16" cy="18" r="4.5"/><circle cx="81" cy="29" r="4.5"/><circle cx="39" cy="78" r="4.5"/><circle cx="75" cy="76" r="3.5"/>',
      '<path d="M8 53c18-4 32-4 48 0" stroke-width="0.8"/>',
      '</g>',
    ]),
  turfStripes: (fill: string, opacity: number) =>
    patternMarkup(72, [
      `<g fill="${fill}" fill-opacity="${opacity}">`,
      '<rect x="0" y="0" width="24" height="72"/><rect x="48" y="0" width="24" height="72"/>',
      '</g>',
    ]),
  turfFibers: (fill: string, opacity: number) =>
    patternMarkup(72, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.4" fill="none" stroke-linecap="round">`,
      '<path d="M4 10l4-8M10 14l4-8M16 8l4-7M24 12l4-8M32 8l4-7M40 14l4-8M48 10l4-8M58 14l4-8M66 8l4-7"/>',
      '<path d="M4 34l4-8M12 40l4-8M20 32l4-7M28 38l4-8M38 34l4-8M46 40l4-8M56 34l4-8M64 40l4-8"/>',
      '<path d="M8 58l4-8M16 64l4-8M26 56l4-7M34 62l4-8M44 58l4-8M54 64l4-8M64 56l4-7"/>',
      '</g>',
    ]),
  stageBoards: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="2.4" fill="none">`,
      '<path d="M0 0h24v96H0zM24 0h24v96H24zM48 0h24v96H48zM72 0h24v96H72z"/>',
      '<path d="M12 0v96M36 0v96M60 0v96M84 0v96"/>',
      '</g>',
    ]),
  stageScuffs: (fill: string, opacity: number) =>
    patternMarkup(96, [
      `<g stroke="${fill}" stroke-opacity="${opacity}" stroke-width="1.2" fill="none" stroke-linecap="round">`,
      '<path d="M6 18c8-3 16-3 24 0M34 34c8-3 16-3 24 0M62 18c8-3 16-3 24 0"/>',
      '<path d="M10 58c8-3 16-3 24 0M42 72c8-3 16-3 24 0M66 54c8-3 16-3 24 0"/>',
      '</g>',
    ]),
}

const textureCatalog: Readonly<Record<FloorMaterial, Omit<FloorTexture, 'material'>>> = {
  parquet: {
    baseColor: '#d3b382',
    layers: [
      bespokePatterns.parquetSeams('#6a4c33', 0.42),
      bespokePatterns.woodGrain('#f8edd8', 0.28),
      bespokePatterns.woodGrain('#4a3426', 0.1),
    ],
  },
  mosaic: {
    baseColor: '#bcd4ce',
    layers: [
      bespokePatterns.mosaicTiles('#fff8ef', 0.18),
      bespokePatterns.mosaicGlaze('#40615b', 0.24),
      bespokePatterns.mosaicGlaze('#fffdf4', 0.12),
    ],
  },
  carpet: {
    baseColor: '#90799d',
    layers: [
      bespokePatterns.carpetWeave('#f6e8dc', 0.12),
      bespokePatterns.carpetNap('#4d3659', 0.18),
      bespokePatterns.carpetNap('#fff7e8', 0.1),
    ],
  },
  rubber: {
    baseColor: '#3f5053',
    layers: [
      bespokePatterns.rubberStuds('#20323a', 0.2),
      bespokePatterns.rubberGrip('#f4efe4', 0.16),
      bespokePatterns.rubberGrip('#fff8ec', 0.08),
    ],
  },
  cork: {
    baseColor: '#c7a16a',
    layers: [
      bespokePatterns.corkFlakes('#8c6439', 0.18),
      bespokePatterns.corkPores('#5b4328', 0.2),
      bespokePatterns.corkPores('#fff5dc', 0.1),
    ],
  },
  grass: {
    baseColor: '#a7c88a',
    layers: [
      bespokePatterns.grassBlades('#3a6a42', 0.22),
      bespokePatterns.grassHighlights('#eaf7c8', 0.16),
      bespokePatterns.grassHighlights('#688755', 0.07),
    ],
  },
  soil: {
    baseColor: '#856044',
    layers: [
      bespokePatterns.soilClumps('#6c4a2d', 0.18),
      bespokePatterns.soilPebbles('#4f3928', 0.2),
      bespokePatterns.soilPebbles('#eed1a4', 0.1),
    ],
  },
  stone: {
    baseColor: '#bdb8a8',
    layers: [
      bespokePatterns.stoneSlabs('#64736c', 0.24),
      bespokePatterns.stoneSpeckles('#eef1eb', 0.16),
      bespokePatterns.stoneSpeckles('#50635b', 0.08),
    ],
  },
  sand: {
    baseColor: '#e0c88c',
    layers: [
      bespokePatterns.sandRipples('#af9061', 0.22),
      bespokePatterns.sandGrains('#fff1cb', 0.18),
      bespokePatterns.sandGrains('#7d643f', 0.05),
    ],
  },
  water: {
    baseColor: '#7ebfcc',
    layers: [
      bespokePatterns.waterRipples('#d8f8ff', 0.34),
      bespokePatterns.waterHighlights('#f3feff', 0.16),
      heroPatterns.bubbles('#2d7386', 0.04),
    ],
  },
  concrete: {
    baseColor: '#b9bbb5',
    layers: [
      bespokePatterns.concreteAggregate('#666a65', 0.14),
      bespokePatterns.concreteCracks('#f3f2e8', 0.2),
      bespokePatterns.concreteAggregate('#50534f', 0.08),
    ],
  },
  metal: {
    baseColor: '#a5b3b0',
    layers: [
      bespokePatterns.metalBrushed('#274147', 0.2),
      bespokePatterns.metalRivets('#eef6f4', 0.18),
      bespokePatterns.metalBrushed('#eff7f5', 0.08),
    ],
  },
  stage: {
    baseColor: '#73515d',
    layers: [
      bespokePatterns.stageBoards('#2b171f', 0.28),
      bespokePatterns.stageScuffs('#ffd8a3', 0.18),
      bespokePatterns.stageScuffs('#f7ecd2', 0.08),
    ],
  },
  'artificial-turf': {
    baseColor: '#4c9472',
    layers: [
      bespokePatterns.turfStripes('#d9f0c6', 0.08),
      bespokePatterns.turfFibers('#194a3a', 0.26),
      bespokePatterns.turfFibers('#eefbd8', 0.1),
    ],
  },
}

const themeMaterials: Readonly<Record<ThemeId, readonly FloorMaterial[]>> = {
  'forest-party': ['grass', 'soil', 'parquet', 'grass', 'parquet', 'water', 'stone', 'grass'],
  'treasure-island': ['sand', 'grass', 'stone', 'stone', 'parquet', 'sand', 'water', 'stone'],
  'kind-magic-school': [
    'parquet',
    'carpet',
    'stone',
    'stone',
    'cork',
    'grass',
    'stage',
    'mosaic',
  ],
  'space-trip': ['metal', 'stage', 'stone', 'grass', 'metal', 'concrete', 'carpet', 'metal'],
  'fun-farm': ['soil', 'cork', 'parquet', 'grass', 'water', 'stone', 'grass', 'parquet'],
  'sea-garden': ['water', 'stone', 'grass', 'sand', 'stone', 'mosaic', 'water', 'sand'],
  'dino-park': ['grass', 'water', 'stone', 'grass', 'grass', 'parquet', 'stone', 'grass'],
  'friendly-monster-town': [
    'stone',
    'mosaic',
    'concrete',
    'stone',
    'carpet',
    'parquet',
    'grass',
    'parquet',
  ],
  'color-fair': ['rubber', 'cork', 'stage', 'grass', 'carpet', 'parquet', 'cork', 'stone'],
  'mountain-trip': ['parquet', 'stone', 'grass', 'water', 'grass', 'parquet', 'stone', 'stone'],
  'music-studio': ['stage', 'carpet', 'metal', 'rubber', 'parquet', 'concrete'],
  'sports-festival': ['artificial-turf', 'rubber', 'concrete', 'grass', 'mosaic', 'cork'],
  'creative-lab': ['cork', 'concrete', 'metal', 'carpet', 'mosaic', 'parquet'],
  'book-club': ['parquet', 'carpet', 'parquet', 'cork', 'mosaic', 'concrete'],
  'city-garden': ['grass', 'soil', 'parquet', 'stone', 'stone', 'soil'],
  'weekend-market': ['stone', 'mosaic', 'concrete', 'parquet', 'sand', 'mosaic'],
}

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
  const materials = themeMaterials[themeId]
  const material = materials[roomIndex % materials.length] ?? 'parquet'
  return floorTextureForMaterial(material)
}
