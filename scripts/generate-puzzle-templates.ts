import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spatialPlanIdsForAudience } from '../src/domain/spatialPlan'
import type { Difficulty } from '../src/domain/types'
import { generatePuzzleDirect, GENERATOR_VERSION } from '../src/generator/puzzleGenerator'
import {
  canonicalTemplateSignature,
  extractAdvancedPuzzleTemplate,
  type AdvancedPuzzleTemplate,
  type TemplateGridSize,
} from '../src/generator/puzzleTemplates'
import {
  advancedPuzzleTemplates,
  puzzleTemplateCatalogGeneratorVersion,
} from '../src/assets/generated/puzzleTemplateData'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/assets/generated/puzzleTemplateData.ts')
const catalogSize = 1_000
const isCheck = process.argv.includes('--check')
const isRepair = process.argv.includes('--repair')

const argumentValue = (name: string) =>
  process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3)

const requestedCount = Number(argumentValue('count') ?? catalogSize)
const seedOffset = Number(argumentValue('offset') ?? 0)
const jsonOutput = argumentValue('json-output')
const mergeInputs = argumentValue('merge')?.split(',').filter(Boolean)

const characterCounts: Record<Difficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
}

const profileMatches = (template: AdvancedPuzzleTemplate) => {
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

const checkCatalog = async () => {
  if (
    puzzleTemplateCatalogGeneratorVersion !== GENERATOR_VERSION ||
    advancedPuzzleTemplates.length !== catalogSize ||
    advancedPuzzleTemplates.at(-1)?.id !== 'template-0999'
  ) {
    throw new Error('El catàleg de plantilles no correspon al generador actual.')
  }
  const signatures = new Set(advancedPuzzleTemplates.map(canonicalTemplateSignature))
  if (signatures.size !== catalogSize) {
    throw new Error(`El catàleg només conté ${signatures.size} estructures canòniques.`)
  }
  const coverage = new Set(
    advancedPuzzleTemplates.map(
      (template) => `${template.audience}:${template.difficulty}:${template.gridSize}`,
    ),
  )
  if (coverage.size !== 18) throw new Error('El catàleg no cobreix les 18 franges espacials.')
}

const generateTemplates = async () => {
  const audiences = ['teens', 'adults'] as const
  const difficulties = ['easy', 'medium', 'hard'] as const
  const gridSizes = [6, 9, 16] as const
  const buckets = audiences.flatMap((audience) =>
    difficulties.flatMap((difficulty) =>
      gridSizes.map((gridSize) => ({ audience, difficulty, gridSize })),
    ),
  )
  const templates: AdvancedPuzzleTemplate[] = []
  const signatures = new Set<string>()

  for (
    let localCandidateIndex = 0;
    localCandidateIndex < requestedCount * 10 && templates.length < requestedCount;
    localCandidateIndex += 1
  ) {
    const candidateIndex = seedOffset + localCandidateIndex
    const bucket = buckets[candidateIndex % buckets.length]
    if (!bucket) continue
    const compatiblePlans = spatialPlanIdsForAudience(bucket.audience)
    const spatialPlanId =
      compatiblePlans[Math.floor(candidateIndex / buckets.length) % compatiblePlans.length]
    if (!spatialPlanId) continue

    try {
      const characterCount = Math.min(bucket.gridSize, characterCounts[bucket.difficulty])
      const puzzle = generatePuzzleDirect(
        bucket.difficulty,
        `catalog-${GENERATOR_VERSION}-${candidateIndex}`,
        bucket.audience,
        {
          gridSize: bucket.gridSize as TemplateGridSize,
          characterCount,
          spatialPlanId,
        },
      )
      const candidate = extractAdvancedPuzzleTemplate(
        puzzle,
        bucket.audience,
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
      // Impossible geometry and invalid/duplicate candidates are expected discards.
    }
  }

  if (templates.length !== requestedCount) {
    throw new Error(`Només s'han validat ${templates.length} de ${requestedCount} plantilles.`)
  }
  return templates
}

const mergeCatalog = async (inputs: readonly string[]) => {
  const batches = await Promise.all(
    inputs.map(
      async (input) =>
        JSON.parse(await readFile(resolve(root, input), 'utf8')) as AdvancedPuzzleTemplate[],
    ),
  )
  const unique = new Map<string, AdvancedPuzzleTemplate>()
  for (const template of batches.flat()) {
    unique.set(canonicalTemplateSignature(template), template)
  }
  const templates = [...unique.values()].slice(0, catalogSize).map((template, index) => ({
    ...template,
    id: `template-${String(index).padStart(4, '0')}`,
  }))
  if (templates.length !== catalogSize) {
    throw new Error(`La fusió només conté ${templates.length} plantilles diferents.`)
  }
  const coverage = new Set(
    templates.map(
      (template) => `${template.audience}:${template.difficulty}:${template.gridSize}`,
    ),
  )
  if (coverage.size !== 18) throw new Error('La fusió no cobreix les 18 franges espacials.')

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderCatalog(templates), 'utf8')
}

const repairCatalog = async () => {
  const unique = new Map<string, AdvancedPuzzleTemplate>()
  for (const template of advancedPuzzleTemplates) {
    const current = { ...template, generatorVersion: GENERATOR_VERSION }
    unique.set(canonicalTemplateSignature(current), current)
  }

  const audiences = ['teens', 'adults'] as const
  const difficulties = ['easy', 'medium', 'hard'] as const
  const gridSizes = [6, 9, 16] as const
  const buckets = audiences.flatMap((audience) =>
    difficulties.flatMap((difficulty) =>
      gridSizes.map((gridSize) => ({ audience, difficulty, gridSize })),
    ),
  )
  const firstCandidate = seedOffset || 20_000
  const maximumCandidates = 10_000

  for (let offset = 0; offset < maximumCandidates && unique.size < catalogSize; offset += 1) {
    const candidateIndex = firstCandidate + offset
    const bucket = buckets[candidateIndex % buckets.length]
    if (!bucket) continue
    const compatiblePlans = spatialPlanIdsForAudience(bucket.audience)
    const spatialPlanId =
      compatiblePlans[Math.floor(candidateIndex / buckets.length) % compatiblePlans.length]
    if (!spatialPlanId) continue

    try {
      const characterCount = Math.min(bucket.gridSize, characterCounts[bucket.difficulty])
      const puzzle = generatePuzzleDirect(
        bucket.difficulty,
        `catalog-${GENERATOR_VERSION}-${candidateIndex}`,
        bucket.audience,
        {
          gridSize: bucket.gridSize as TemplateGridSize,
          characterCount,
          spatialPlanId,
        },
      )
      const candidate = extractAdvancedPuzzleTemplate(
        puzzle,
        bucket.audience,
        `repair-${candidateIndex}`,
      )
      if (!profileMatches(candidate)) continue
      unique.set(canonicalTemplateSignature(candidate), candidate)
    } catch {
      // Continue until enough valid, canonical structures have been found.
    }
  }

  if (unique.size < catalogSize) {
    throw new Error(`La reparació només conté ${unique.size} plantilles diferents.`)
  }
  const templates = [...unique.values()].slice(0, catalogSize).map((template, index) => ({
    ...template,
    generatorVersion: GENERATOR_VERSION,
    id: `template-${String(index).padStart(4, '0')}`,
  }))
  await writeFile(outputPath, renderCatalog(templates), 'utf8')
}

if (isCheck) {
  await checkCatalog()
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
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, renderCatalog(templates), 'utf8')
  }
}
