import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { format } from 'prettier'
import sharp from 'sharp'
import { floorDecorationScale, floorMaterialDetails } from '../src/components/floorDecorations'
import { floorMotifIcons } from '../src/components/floorMotifIcons'
import {
  floorMaterialIds,
  floorTextureForMaterial,
  type FloorMaterial,
} from '../src/components/floorTextures'
import { seed } from '../src/domain/types'
import { SeededRandom } from '../src/generator/seededRandom'

const panelSize = 240
const cellCount = 4
const cellSize = panelSize / cellCount
const panelGap = 12
const titleHeight = 42
const captionHeight = 30
const sampleWidth = panelSize * 3 + panelGap * 2
const sampleHeight = titleHeight + panelSize + captionHeight
const outputDirectory = join(process.cwd(), 'docs', 'terrain-samples')

interface ParsedPattern {
  readonly body: string
  readonly side: number
}

interface VariantMetric {
  readonly decoratedCells: number
  readonly density: number
  readonly motifs: readonly string[]
  readonly seed: string
}

interface MaterialMetric {
  readonly material: FloorMaterial
  readonly meanRgb: readonly number[]
  readonly standardDeviationRgb: readonly number[]
  readonly variants: readonly VariantMetric[]
}

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const parsePattern = (cssUrl: string): ParsedPattern => {
  const encoded = /^url\("data:image\/svg\+xml,(.*)"\)$/u.exec(cssUrl)?.[1]
  if (!encoded) throw new Error('Invalid local SVG floor pattern.')
  const source = decodeURIComponent(encoded)
  const side = Number(/<svg[^>]+width="(\d+)"/u.exec(source)?.[1])
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/u.exec(source)?.[1]
  if (!Number.isFinite(side) || !body) throw new Error('Incomplete local SVG floor pattern.')
  return { body, side }
}

const iconBody = (motif: keyof typeof floorMotifIcons) => {
  const markup = renderToStaticMarkup(createElement(floorMotifIcons[motif]))
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/u.exec(markup)?.[1]
  if (!body) throw new Error(`Could not render the ${motif} motif.`)
  return body
}

const patternDefinition = (id: string, pattern: ParsedPattern, physicalSize: number) =>
  `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${physicalSize}" height="${physicalSize}" viewBox="0 0 ${pattern.side} ${pattern.side}" preserveAspectRatio="none">${pattern.body}</pattern>`

const panel = (material: FloorMaterial, variant: number, offsetX: number) => {
  const texture = floorTextureForMaterial(material)
  const details = floorMaterialDetails(material)
  const patterns = texture.layers.map(parsePattern)
  const sampleSeed = `terrain-sample:${material}:${variant}`
  const random = new SeededRandom(seed(sampleSeed))
  const decoratedCells = random.integer(4, 12)
  const selectedCells = random
    .shuffle(Array.from({ length: cellCount * cellCount }, (_, index) => index))
    .slice(0, decoratedCells)
  const motifNames: string[] = []
  const prefix = `${material}-${variant}`
  const definitions = patterns
    .map((pattern, index) =>
      patternDefinition(prefix + '-' + index, pattern, [1.9, 1.2, 0.62][index]! * cellSize),
    )
    .join('')
  const motifs = selectedCells
    .map((cell) => {
      const motifRandom = new SeededRandom(seed(`${sampleSeed}:cell:${cell}`))
      const motif = motifRandom.pick(details.motifs)
      motifNames.push(motif)
      const color = motifRandom.pick(details.colorsByMotif[motif])
      const column = cell % cellCount
      const row = Math.floor(cell / cellCount)
      const x = column * cellSize + (motifRandom.integer(22, 78) / 100) * cellSize
      const y = row * cellSize + (motifRandom.integer(22, 78) / 100) * cellSize
      const size =
        (motifRandom.integer(
          floorDecorationScale.minimum * 100,
          floorDecorationScale.maximum * 100,
        ) /
          100) *
        cellSize
      const rotation = motifRandom.integer(-35, 35)
      return `<g transform="translate(${x} ${y}) rotate(${rotation}) translate(${-size / 2} ${-size / 2})" opacity="0.36"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${iconBody(motif)}</svg></g>`
    })
    .join('')
  const grid = Array.from({ length: cellCount - 1 }, (_, index) => {
    const position = (index + 1) * cellSize
    return `<path d="M${position} 0V${panelSize}M0 ${position}H${panelSize}"/>`
  }).join('')

  return {
    metric: {
      seed: sampleSeed,
      decoratedCells,
      density: decoratedCells / (cellCount * cellCount),
      motifs: [...new Set(motifNames)].sort(),
    } satisfies VariantMetric,
    svg: `<g transform="translate(${offsetX} ${titleHeight})"><defs>${definitions}</defs><rect width="${panelSize}" height="${panelSize}" rx="10" fill="${texture.baseColor}"/><rect width="${panelSize}" height="${panelSize}" rx="10" fill="url(#${prefix}-0)"/><rect width="${panelSize}" height="${panelSize}" rx="10" fill="url(#${prefix}-1)"/><rect width="${panelSize}" height="${panelSize}" rx="10" fill="url(#${prefix}-2)"/>${motifs}<g fill="none" stroke="#fffdf4" stroke-width="1" opacity="0.18">${grid}</g><rect x="0.75" y="0.75" width="${panelSize - 1.5}" height="${panelSize - 1.5}" rx="10" fill="none" stroke="#172620" stroke-width="1.5" opacity="0.5"/></g><text x="${offsetX + panelSize / 2}" y="${titleHeight + panelSize + 20}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="12" font-weight="700" fill="#21332d">Variant ${variant + 1} · ${Math.round((decoratedCells / 16) * 100)}%</text>`,
  }
}

const renderMaterial = async (material: FloorMaterial) => {
  const variants = Array.from({ length: 3 }, (_, variant) =>
    panel(material, variant, variant * (panelSize + panelGap)),
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sampleWidth}" height="${sampleHeight}" viewBox="0 0 ${sampleWidth} ${sampleHeight}"><rect width="100%" height="100%" rx="12" fill="#f4eee3"/><text x="14" y="28" font-family="Verdana, sans-serif" font-size="20" font-weight="800" fill="#172620">${escapeXml(material)}</text>${variants.map(({ svg: variant }) => variant).join('')}</svg>`
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  const stats = await sharp(png).stats()
  await writeFile(join(outputDirectory, `${material}.png`), png)
  return {
    png,
    metric: {
      material,
      meanRgb: stats.channels.slice(0, 3).map(({ mean }) => Math.round(mean * 100) / 100),
      standardDeviationRgb: stats.channels
        .slice(0, 3)
        .map(({ stdev }) => Math.round(stdev * 100) / 100),
      variants: variants.map(({ metric }) => metric),
    } satisfies MaterialMetric,
  }
}

await mkdir(outputDirectory, { recursive: true })
const rendered = await Promise.all(floorMaterialIds.map(renderMaterial))
const atlasGap = 18
const atlasLabel = 40
const atlasColumns = 2
const atlasRows = Math.ceil(rendered.length / atlasColumns)
const atlasWidth = sampleWidth * atlasColumns + atlasGap * (atlasColumns + 1)
const atlasHeight = sampleHeight * atlasRows + atlasGap * (atlasRows + 1) + atlasLabel
const atlas = sharp({
  create: {
    width: atlasWidth,
    height: atlasHeight,
    channels: 4,
    background: '#e7dfd0',
  },
})
const atlasTitle = Buffer.from(
  `<svg width="${atlasWidth}" height="${atlasLabel}" xmlns="http://www.w3.org/2000/svg"><text x="${atlasWidth / 2}" y="29" text-anchor="middle" font-family="Verdana, sans-serif" font-size="24" font-weight="800" fill="#172620">Logic Garden · fixed terrain samples</text></svg>`,
)
const composites = rendered.map(({ png }, index) => ({
  input: png,
  left: atlasGap + (index % atlasColumns) * (sampleWidth + atlasGap),
  top: atlasLabel + atlasGap + Math.floor(index / atlasColumns) * (sampleHeight + atlasGap),
}))
await atlas
  .composite([{ input: atlasTitle, left: 0, top: 0 }, ...composites])
  .png({ compressionLevel: 9 })
  .toFile(join(outputDirectory, 'atlas.png'))
const metrics = await format(JSON.stringify(rendered.map(({ metric }) => metric)), {
  parser: 'json',
})
await writeFile(join(outputDirectory, 'metrics.json'), metrics, 'utf8')

console.log(`Generated ${floorMaterialIds.length} fixed material PNGs and one atlas.`)
