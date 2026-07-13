import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spatialPlanIdsForAudience } from '../src/domain/spatialPlan'
import type { Difficulty } from '../src/domain/types'
import { generatePuzzleDirect, GENERATOR_VERSION } from '../src/generator/puzzleGenerator'
import {
  canonicalTemplateSignature,
  extractAdvancedPuzzleTemplate,
  templateBucketKey,
  type AdvancedPuzzleTemplate,
} from '../src/generator/puzzleTemplates'
import {
  advancedPuzzleTemplates,
  puzzleTemplateCatalogGeneratorVersion,
} from '../src/assets/generated/puzzleTemplateData'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/assets/generated/puzzleTemplateData.ts')
const catalogSize = 1_000
const expectedBucketCount = 20
const isCheck = process.argv.includes('--check')
const isRepair = process.argv.includes('--repair')
const isCubeMigration = process.argv.includes('--migrate-cubes')

const argumentValue = (name: string) =>
  process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3)

const requestedCount = Number(argumentValue('count') ?? catalogSize)
const seedOffset = Number(argumentValue('offset') ?? 0)
const jsonOutput = argumentValue('json-output')
const mergeInputs = argumentValue('merge')?.split(',').filter(Boolean)

const characterCounts: Record<Difficulty, number> = { easy: 4, medium: 6, hard: 8 }

type TemplateBucket =
  | {
      readonly audience: 'teens' | 'adults'
      readonly difficulty: Difficulty
      readonly boardMode: 'logic-grid'
      readonly gridSize: 6 | 9 | 16
    }
  | {
      readonly audience: 'teens' | 'adults'
      readonly difficulty: 'hard'
      readonly boardMode: 'logic-cube'
      readonly gridSize: 5
    }

const templateBuckets = (): readonly TemplateBucket[] => {
  const audiences = ['teens', 'adults'] as const
  const difficulties = ['easy', 'medium', 'hard'] as const
  const gridSizes = [6, 9, 16] as const
  return [
    ...audiences.flatMap((audience) =>
      difficulties.flatMap((difficulty) =>
        gridSizes.map((gridSize) => ({
          audience,
          difficulty,
          boardMode: 'logic-grid' as const,
          gridSize,
        })),
      ),
    ),
    ...audiences.map((audience) => ({
      audience,
      difficulty: 'hard' as const,
      boardMode: 'logic-cube' as const,
      gridSize: 5 as const,
    })),
  ]
}

const profileMatches = (template: AdvancedPuzzleTemplate) => {
  if (template.boardMode === 'logic-cube') {
    return template.characterCount === 5 && template.depth === 3
  }
  const counts = template.landmarkCandidateCounts
  if (counts.length !== template.characterCount) return false
  const average = counts.reduce((total, count) => total + count, 0) / counts.length
  if (template.difficulty === 'easy') return average <= 2.75
  if (template.difficulty === 'medium') return average >= 1.75 && average <= 3.5
  return average >= 2
}

const renderCatalog = (templates: readonly AdvancedPuzzleTemplate[]) =>
  [
    "import type { AdvancedPuzzleTemplate } from '../../generator/puzzleTemplates'",
    '',
    `export const puzzleTemplateCatalogGeneratorVersion = ${GENERATOR_VERSION}`,
    `export const advancedPuzzleTemplates = ${JSON.stringify(templates)} as const satisfies readonly AdvancedPuzzleTemplate[]`,
    '',
  ].join('\n')

const assertCoverage = (templates: readonly AdvancedPuzzleTemplate[]) => {
  const coverage = new Set(templates.map(templateBucketKey))
  if (coverage.size !== expectedBucketCount) {
    throw new Error(
      `El catàleg només cobreix ${coverage.size} de ${expectedBucketCount} franges.`,
    )
  }
}

const checkCatalog = async () => {
  if (
    puzzleTemplateCatalogGeneratorVersion !== GENERATOR_VERSION ||
    advancedPuzzleTemplates.length !== catalogSize ||
    advancedPuzzleTemplates.at(-1)?.id !== 'template-0999'
  ) {
    throw new Error('El catàleg de plantilles no correspon al generador actual.')
  }
  const templates = advancedPuzzleTemplates as readonly AdvancedPuzzleTemplate[]
  const signatures = new Set(templates.map(canonicalTemplateSignature))
  if (signatures.size !== catalogSize) {
    throw new Error(`El catàleg només conté ${signatures.size} estructures canòniques.`)
  }
  assertCoverage(templates)
}

const generateCandidate = (bucket: TemplateBucket, candidateIndex: number, id: string) => {
  const puzzle =
    bucket.boardMode === 'logic-cube'
      ? generatePuzzleDirect(
          'hard',
          `catalog-${GENERATOR_VERSION}-${candidateIndex}`,
          bucket.audience,
          { boardMode: 'logic-cube', gridSize: 5, depth: 3, characterCount: 5 },
        )
      : (() => {
          const plans = spatialPlanIdsForAudience(bucket.audience)
          const spatialPlanId =
            plans[Math.floor(candidateIndex / templateBuckets().length) % plans.length]
          if (!spatialPlanId) throw new Error('No hi ha cap planta compatible.')
          return generatePuzzleDirect(
            bucket.difficulty,
            `catalog-${GENERATOR_VERSION}-${candidateIndex}`,
            bucket.audience,
            {
              boardMode: 'logic-grid',
              gridSize: bucket.gridSize,
              characterCount: Math.min(bucket.gridSize, characterCounts[bucket.difficulty]),
              spatialPlanId,
            },
          )
        })()
  return extractAdvancedPuzzleTemplate(puzzle, bucket.audience, id)
}

const generateTemplates = async () => {
  const buckets = templateBuckets()
  const templates: AdvancedPuzzleTemplate[] = []
  const signatures = new Set<string>()

  for (
    let localIndex = 0;
    localIndex < requestedCount * 12 && templates.length < requestedCount;
    localIndex += 1
  ) {
    const candidateIndex = seedOffset + localIndex
    const bucket = buckets[candidateIndex % buckets.length]
    if (!bucket) continue
    try {
      const candidate = generateCandidate(
        bucket,
        candidateIndex,
        `shard-${seedOffset}-${String(templates.length).padStart(4, '0')}`,
      )
      const signature = canonicalTemplateSignature(candidate)
      if (!profileMatches(candidate) || signatures.has(signature)) continue
      signatures.add(signature)
      templates.push(candidate)
      if (templates.length % 100 === 0) {
        process.stdout.write(`Plantilles del lot: ${templates.length}/${requestedCount}\n`)
      }
    } catch {
      // Invalid geometry, duplicate structures, and node limits are expected discards.
    }
  }

  if (templates.length !== requestedCount) {
    throw new Error(`Només s'han validat ${templates.length} de ${requestedCount} plantilles.`)
  }
  assertCoverage(templates)
  return templates
}

const writeCatalog = async (templates: readonly AdvancedPuzzleTemplate[]) => {
  const normalized = templates.slice(0, catalogSize).map((template, index) => ({
    ...template,
    generatorVersion: GENERATOR_VERSION,
    id: `template-${String(index).padStart(4, '0')}`,
  }))
  if (normalized.length !== catalogSize) {
    throw new Error(`El catàleg només conté ${normalized.length} plantilles.`)
  }
  assertCoverage(normalized)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderCatalog(normalized), 'utf8')
}

const mergeCatalog = async (inputs: readonly string[]) => {
  const batches = await Promise.all(
    inputs.map(
      async (input) =>
        JSON.parse(await readFile(resolve(root, input), 'utf8')) as AdvancedPuzzleTemplate[],
    ),
  )
  const unique = new Map<string, AdvancedPuzzleTemplate>()
  for (const template of batches.flat())
    unique.set(canonicalTemplateSignature(template), template)
  await writeCatalog([...unique.values()])
}

const repairCatalog = async () => {
  const unique = new Map<string, AdvancedPuzzleTemplate>()
  for (const template of advancedPuzzleTemplates as readonly AdvancedPuzzleTemplate[]) {
    unique.set(canonicalTemplateSignature(template), template)
  }
  const buckets = templateBuckets()
  const firstCandidate = seedOffset || 20_000
  for (let offset = 0; offset < 12_000 && unique.size < catalogSize; offset += 1) {
    const candidateIndex = firstCandidate + offset
    const bucket = buckets[candidateIndex % buckets.length]
    if (!bucket) continue
    try {
      const candidate = generateCandidate(bucket, candidateIndex, `repair-${candidateIndex}`)
      if (profileMatches(candidate))
        unique.set(canonicalTemplateSignature(candidate), candidate)
    } catch {
      // Keep searching until all canonical slots are valid.
    }
  }
  await writeCatalog([...unique.values()])
}

const migrateCatalogWithCubes = async () => {
  const current = advancedPuzzleTemplates as unknown as readonly AdvancedPuzzleTemplate[]
  const migratedSpatial: AdvancedPuzzleTemplate[] = current
    .filter((template) => template.boardMode === 'logic-grid')
    // Preserve the verified 2D structures and rebuild only the rule-sensitive building subset.
    .slice(0, 950)
    .map(
      (template) =>
        ({
          ...template,
          v: 2,
          boardMode: 'logic-grid',
          generatorVersion: GENERATOR_VERSION,
        }) as AdvancedPuzzleTemplate,
    )
  const signatures = new Set(migratedSpatial.map(canonicalTemplateSignature))
  const spatialBuckets = templateBuckets().filter(
    (bucket): bucket is Extract<TemplateBucket, { boardMode: 'logic-grid' }> =>
      bucket.boardMode === 'logic-grid',
  )
  for (
    let candidateIndex = 0;
    candidateIndex < 4_000 && migratedSpatial.length < 950;
    candidateIndex += 1
  ) {
    const bucket = spatialBuckets[candidateIndex % spatialBuckets.length]
    if (!bucket) continue
    try {
      const candidate = generateCandidate(
        bucket,
        100_000 + candidateIndex,
        `spatial-migration-${candidateIndex}`,
      )
      const signature = canonicalTemplateSignature(candidate)
      if (signatures.has(signature)) continue
      signatures.add(signature)
      migratedSpatial.push(candidate)
    } catch {
      // Keep replacing legacy cube slots with freshly verified spatial structures.
    }
  }
  if (migratedSpatial.length !== 950) {
    throw new Error(`Només s'han recuperat ${migratedSpatial.length} de 950 plantilles 2D.`)
  }

  const cubeTemplates: AdvancedPuzzleTemplate[] = []

  for (
    let candidateIndex = 0;
    candidateIndex < 1_000 && cubeTemplates.length < 50;
    candidateIndex += 1
  ) {
    const audience = candidateIndex % 2 === 0 ? 'teens' : 'adults'
    try {
      const puzzle = generatePuzzleDirect(
        'hard',
        `cube-catalog-${GENERATOR_VERSION}-${candidateIndex}`,
        audience,
        { boardMode: 'logic-cube', gridSize: 5, depth: 3, characterCount: 5 },
      )
      const template = extractAdvancedPuzzleTemplate(puzzle, audience, `cube-${candidateIndex}`)
      const signature = canonicalTemplateSignature(template)
      if (signatures.has(signature)) continue
      signatures.add(signature)
      cubeTemplates.push(template)
    } catch {
      // Discard candidates that cannot be reduced to a unique cube.
    }
  }
  if (cubeTemplates.length !== 50) {
    throw new Error(`Només s'han generat ${cubeTemplates.length} de 50 cubs.`)
  }
  await writeCatalog([...migratedSpatial, ...cubeTemplates])
}

if (isCheck) {
  await checkCatalog()
} else if (isCubeMigration) {
  await migrateCatalogWithCubes()
} else if (isRepair) {
  await repairCatalog()
} else if (mergeInputs) {
  await mergeCatalog(mergeInputs)
} else {
  const templates = await generateTemplates()
  if (jsonOutput) {
    const target = resolve(root, jsonOutput)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, JSON.stringify(templates), 'utf8')
  } else {
    await writeCatalog(templates)
  }
}
