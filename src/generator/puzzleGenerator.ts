import {
  puzzleId,
  seed,
  type Audience,
  type AdvancedGridSize,
  type BuildingSize,
  type BuildingPlacement,
  type ChildMapSize,
  type Difficulty,
  type Puzzle,
  type PuzzleCollection,
  type PuzzleVariant,
  type Seed,
  type ThemeId,
} from '../domain/types'
import { advancedPuzzleTemplates } from '../assets/generated/puzzleTemplateData'
import { BUILDING_DEPTHS } from '../domain/buildingPlan'
import { clueReferencesCharacter } from '../domain/clueRelations'
import { spatialPlanIdsForAudience } from '../domain/spatialPlan'
import { getTheme, themesForAudience } from '../domain/themes'
import { buildingUsesRoomPlacement } from '../domain/placements'
import { analyzeSolutions, solve } from '../solver/solver'
import { analyzeDeductionTrace } from '../solver/deductionTrace'
import { selectMinimalUniqueClues } from './clueReducer'
import { generateCandidateClues } from './clueGenerator'
import { deriveSeed, SeededRandom } from './seededRandom'
import { advancedCharacterCount } from './difficulty'
import { generateWorld, type AdvancedWorldStructure } from './solutionGenerator'
import { materializeAdvancedPuzzleTemplate } from './puzzleTemplates'
import { GENERATOR_VERSION } from './version'

export { GENERATOR_VERSION } from './version'

type ExactPositionClue = Extract<
  Puzzle['clues'][number],
  { readonly type: 'character-at-position' }
>

const isExactPositionClue = (clue: Puzzle['clues'][number]): clue is ExactPositionClue =>
  clue.type === 'character-at-position'

// Try three deterministic batches before giving up. This absorbs discarded
// geometries without turning an impossible candidate into a visible puzzle.
const maximumAttempts = 36

const isRecoverableGenerationError = (error: unknown) =>
  error instanceof Error && error.message.startsWith('No s’ha pogut')

const isNarrativeGridClue = (clue: Puzzle['clues'][number]) =>
  [
    'adjacent',
    'not-adjacent',
    'left-of',
    'right-of',
    'above',
    'below',
    'between',
    'same-floor',
    'different-floor',
  ].includes(clue.type)

const childCluesAreNecessaryOrContextual = (
  puzzle: Puzzle,
  clues: readonly Puzzle['clues'][number][],
) =>
  clues.every((clue) => {
    const reducedClues = clues.filter((candidate) => candidate.id !== clue.id)
    const remainsUnique =
      analyzeSolutions({ ...puzzle, clues: reducedClues }, { limit: 2 }).count === 1
    const retainsContext = puzzle.characters.every((character) =>
      reducedClues.some((candidate) =>
        clueReferencesCharacter(puzzle, candidate, character.id),
      ),
    )
    return !remainsUnique || !retainsContext
  })

const difficultyScore = (puzzle: Puzzle) => {
  const negativeClues = puzzle.clues.filter(
    (clue) =>
      clue.type === 'character-not-at-position' ||
      clue.type === 'character-not-in-place' ||
      clue.type === 'not-adjacent' ||
      clue.type === 'different-row' ||
      clue.type === 'different-column' ||
      clue.type === 'different-floor' ||
      clue.type === 'not-in-corner' ||
      clue.type === 'does-not-have-item',
  ).length
  const relationalClues = puzzle.clues.filter((clue) =>
    [
      'adjacent',
      'not-adjacent',
      'same-row',
      'different-row',
      'same-column',
      'different-column',
      'left-of',
      'right-of',
      'above',
      'below',
      'distance',
      'between',
      'same-floor',
      'different-floor',
    ].includes(clue.type),
  ).length
  const landmarkClues = puzzle.clues.filter(
    (clue) => clue.type === 'character-next-to-obstacle',
  ).length
  return (
    puzzle.characters.length * 5 +
    puzzle.clues.length * 2 +
    negativeClues +
    relationalClues * 2 +
    landmarkClues
  )
}

const withSpatialGuidance = (puzzle: Puzzle, difficulty: Difficulty): Puzzle => {
  if (puzzle.boardMode !== 'logic-grid') return puzzle
  const solution = solve(puzzle)
  if (!solution) throw new Error('No s’ha pogut preparar la guia espacial.')
  const random = new SeededRandom(deriveSeed(puzzle.seed, 307))
  const shell: Puzzle = { ...puzzle, difficulty, clues: [] }
  const generatedCandidates = random.shuffle(generateCandidateClues(shell, solution, random))
  let baseClues = [...puzzle.clues]
  const exactBaseClues = random.shuffle(puzzle.clues.filter(isExactPositionClue))
  for (const exactClue of exactBaseClues) {
    const landmarkClue = generatedCandidates.find(
      (clue) =>
        clue.type === 'character-next-to-obstacle' &&
        clue.characterId === exactClue.characterId,
    )
    if (!landmarkClue) continue
    const weakenedClues = baseClues.map((clue) =>
      clue.id === exactClue.id
        ? {
            ...landmarkClue,
            id: `spatial-base:landmark:${exactClue.characterId}`,
          }
        : clue,
    )
    const validation = analyzeSolutions({ ...shell, clues: weakenedClues }, { limit: 2 })
    if (validation.count === 1 && !validation.reachedNodeLimit) baseClues = weakenedClues
  }

  const exactCharacters = new Set(
    baseClues.filter(isExactPositionClue).map((clue) => clue.characterId),
  )
  const exactTarget =
    difficulty === 'easy'
      ? Math.max(1, puzzle.characters.length - 1)
      : difficulty === 'medium'
        ? Math.max(1, Math.floor(puzzle.characters.length / 3))
        : exactCharacters.size
  const guidanceCharacters = new Set(exactCharacters)
  const guidanceClues = generatedCandidates
    .filter(isExactPositionClue)
    .filter((clue) => {
      if (guidanceCharacters.has(clue.characterId)) {
        return false
      }
      guidanceCharacters.add(clue.characterId)
      return true
    })
    .slice(0, Math.max(0, exactTarget - exactCharacters.size))
    .map((clue) => ({
      ...clue,
      id: `spatial-guidance:${difficulty}:${clue.characterId}`,
    }))
  if (exactCharacters.size + guidanceClues.length < exactTarget) {
    throw new Error('No s’han pogut preparar prou ancoratges espacials.')
  }
  const candidate: Puzzle = {
    ...shell,
    clues: [...baseClues, ...guidanceClues],
    metadata: {
      ...puzzle.metadata,
      difficultyScore: difficultyScore({
        ...shell,
        clues: [...baseClues, ...guidanceClues],
      }),
    },
  }
  const validation = analyzeSolutions(candidate, { limit: 2 })
  if (validation.count !== 1 || validation.reachedNodeLimit) {
    throw new Error('La guia espacial no conserva una solució única.')
  }
  return {
    ...candidate,
    metadata: { ...candidate.metadata, exploredNodes: validation.exploredNodes },
  }
}

const withBuildingGuidance = (puzzle: Puzzle, difficulty: Difficulty): Puzzle => {
  if (puzzle.boardMode !== 'logic-cube') return puzzle
  const solution = solve(puzzle)
  if (!solution) throw new Error('No s\u2019ha pogut preparar la guia de l\u2019edifici.')
  const random = new SeededRandom(deriveSeed(puzzle.seed, 313))
  const shell: Puzzle = { ...puzzle, difficulty, clues: [] }
  const generatedCandidates = random.shuffle(generateCandidateClues(shell, solution, random))
  if (buildingUsesRoomPlacement(puzzle)) {
    const baseClues = [...puzzle.clues]
    const directCharacters = new Set(
      baseClues
        .filter((clue) => clue.type === 'character-in-place')
        .map((clue) => clue.characterId),
    )
    const mediumTarget = Math.min(7, Math.max(4, directCharacters.size + 1))
    const easyTarget = Math.min(8, Math.max(6, mediumTarget + 1))
    const directTarget =
      difficulty === 'easy'
        ? easyTarget
        : difficulty === 'medium'
          ? mediumTarget
          : directCharacters.size
    const guidanceClues: Puzzle['clues'][number][] = []
    for (const clue of generatedCandidates) {
      if (directCharacters.size >= directTarget) break
      if (clue.type !== 'character-in-place' || directCharacters.has(clue.characterId)) continue
      directCharacters.add(clue.characterId)
      guidanceClues.push({
        ...clue,
        id: `building-room-guidance:${difficulty}:${clue.characterId}`,
      })
    }
    if (directCharacters.size < directTarget) {
      throw new Error('No s’ha pogut preparar prou orientació per estances.')
    }
    const candidate: Puzzle = {
      ...shell,
      clues: [...baseClues, ...guidanceClues],
      metadata: {
        ...puzzle.metadata,
        difficultyScore: difficultyScore({
          ...shell,
          clues: [...baseClues, ...guidanceClues],
        }),
      },
    }
    const validation = analyzeSolutions(candidate, { limit: 2 })
    if (validation.count !== 1 || validation.reachedNodeLimit) {
      throw new Error('La guia per estances no conserva una solució única.')
    }
    return {
      ...candidate,
      metadata: { ...candidate.metadata, exploredNodes: validation.exploredNodes },
    }
  }
  let baseClues = [...puzzle.clues]
  const exactBaseClues = random.shuffle(puzzle.clues.filter(isExactPositionClue))
  const weakerClueFor = (exactClue: (typeof exactBaseClues)[number]) =>
    generatedCandidates.find(
      (clue) =>
        clue.type === 'character-next-to-obstacle' &&
        clue.characterId === exactClue.characterId,
    ) ??
    generatedCandidates.find(
      (clue) =>
        clue.type === 'character-in-place' && clue.characterId === exactClue.characterId,
    )
  const tryWeakenExactClue = (
    clues: readonly Puzzle['clues'][number][],
    exactClue: (typeof exactBaseClues)[number],
  ) => {
    const weakerClue = weakerClueFor(exactClue)
    if (!weakerClue) return clues
    const weakenedClues = clues.map((clue) =>
      clue.id === exactClue.id
        ? {
            ...weakerClue,
            id: `building-base:${weakerClue.type}:${exactClue.characterId}`,
          }
        : clue,
    )
    const weakenedValidation = analyzeSolutions(
      { ...shell, clues: weakenedClues },
      { limit: 2 },
    )
    return weakenedValidation.count === 1 && !weakenedValidation.reachedNodeLimit
      ? weakenedClues
      : clues
  }
  for (const exactClue of exactBaseClues) {
    baseClues = [...tryWeakenExactClue(baseClues, exactClue)]
  }
  const exactClueCount = (clues: readonly Puzzle['clues'][number][]) =>
    clues.filter((clue) => clue.type === 'character-at-position').length
  const relationalSupports = generatedCandidates
    .filter(
      (clue) =>
        clue.type === 'same-floor' ||
        clue.type === 'different-floor' ||
        clue.type === 'above' ||
        clue.type === 'below' ||
        clue.type === 'adjacent' ||
        clue.type === 'not-adjacent' ||
        clue.type === 'in-corner' ||
        clue.type === 'not-in-corner',
    )
    .slice(0, 16)
  for (const supportClue of relationalSupports) {
    if (exactClueCount(baseClues) <= 6) break
    const supportedClues = [
      ...baseClues,
      { ...supportClue, id: `building-base:support:${supportClue.id}` },
    ]
    for (const exactClue of exactBaseClues) {
      const weakenedClues = tryWeakenExactClue(supportedClues, exactClue)
      if (exactClueCount(weakenedClues) < exactClueCount(baseClues)) {
        baseClues = [...weakenedClues]
        break
      }
    }
  }
  const existingExactCharacters = new Set(
    baseClues.filter(isExactPositionClue).map((clue) => clue.characterId),
  )
  const guidanceCharacterIds = new Set(existingExactCharacters)
  const guidanceCandidates = [...generatedCandidates, ...exactBaseClues]
    .filter(isExactPositionClue)
    .filter((clue) => {
      if (guidanceCharacterIds.has(clue.characterId)) return false
      guidanceCharacterIds.add(clue.characterId)
      return true
    })
  const availableExactCount = existingExactCharacters.size + guidanceCandidates.length
  const mediumExactTarget = Math.min(
    availableExactCount,
    Math.max(3, existingExactCharacters.size + 1),
  )
  const easyExactTarget = Math.min(
    availableExactCount,
    Math.max(6, existingExactCharacters.size + 2),
  )
  const exactTarget =
    difficulty === 'easy'
      ? easyExactTarget
      : difficulty === 'medium'
        ? mediumExactTarget
        : existingExactCharacters.size
  const guidanceCount = Math.max(0, exactTarget - existingExactCharacters.size)
  let guidanceClues: Puzzle['clues'] = guidanceCandidates
    .slice(0, guidanceCount)
    .map((clue) => ({
      ...clue,
      id: `building-guidance:${difficulty}:${clue.characterId}`,
    }))
  if (difficulty === 'easy' && easyExactTarget === mediumExactTarget) {
    const clueFact = (clue: Puzzle['clues'][number]) =>
      JSON.stringify(clue, (key, value) =>
        key === 'id' || key === 'phraseVariant' ? undefined : value,
      )
    const selectedFacts = new Set([...baseClues, ...guidanceClues].map(clueFact))
    const currentPuzzle = { ...shell, clues: [...baseClues, ...guidanceClues] }
    const currentTrace = analyzeDeductionTrace(currentPuzzle)
    const currentPressure =
      currentTrace.initialAverageCandidateCount +
      currentTrace.averageCandidateCount +
      currentTrace.averageClueInterpretationLoad +
      currentTrace.branchingMoveCount / Math.max(1, currentTrace.steps.length)
    const supportCandidates = generatedCandidates.filter(
      (clue) =>
        (clue.type === 'character-in-place' ||
          clue.type === 'character-not-in-place' ||
          clue.type === 'character-not-at-position' ||
          clue.type === 'in-corner' ||
          clue.type === 'not-in-corner') &&
        !selectedFacts.has(clueFact(clue)),
    )
    for (const supportClue of supportCandidates) {
      const trialClue = {
        ...supportClue,
        id: `building-guidance:easy:support:${supportClue.id}`,
      }
      const trialPuzzle = {
        ...shell,
        clues: [...baseClues, ...guidanceClues, trialClue],
      }
      const trialTrace = analyzeDeductionTrace(trialPuzzle)
      const trialPressure =
        trialTrace.initialAverageCandidateCount +
        trialTrace.averageCandidateCount +
        trialTrace.averageClueInterpretationLoad +
        trialTrace.branchingMoveCount / Math.max(1, trialTrace.steps.length)
      if (trialPressure < currentPressure) {
        guidanceClues = [...guidanceClues, trialClue]
        break
      }
    }
  }
  if (
    difficulty !== 'hard' &&
    existingExactCharacters.size + guidanceClues.length < exactTarget
  ) {
    throw new Error('No s\u2019ha pogut preparar prou pistes visuals per a l\u2019edifici.')
  }
  const candidate: Puzzle = {
    ...shell,
    difficulty,
    clues: [...baseClues, ...guidanceClues],
    metadata: {
      ...puzzle.metadata,
      difficultyScore: difficultyScore({
        ...shell,
        clues: [...baseClues, ...guidanceClues],
      }),
    },
  }
  const validation = analyzeSolutions(candidate, { limit: 2 })
  if (validation.count !== 1 || validation.reachedNodeLimit) {
    throw new Error('La guia de l’edifici no conserva una solució única.')
  }
  return {
    ...candidate,
    metadata: { ...candidate.metadata, exploredNodes: validation.exploredNodes },
  }
}

export const generatePuzzleDirect = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Audience = 'children',
  structure?: AdvancedWorldStructure,
): Puzzle => {
  const originalSeed = seed(source)

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      const random = new SeededRandom(deriveSeed(originalSeed, attempt))
      const world = generateWorld(difficulty, random, audience, structure)
      const basePuzzle: Puzzle = {
        id: puzzleId(`puzzle-${originalSeed}`),
        seed: originalSeed,
        difficulty,
        boardMode: world.boardMode,
        buildingPlacement: world.buildingPlacement,
        spatialPlanId: world.spatialPlanId,
        theme: world.theme.id,
        title:
          world.boardMode === 'logic-cube'
            ? (world.theme.buildingTitle ?? world.theme.title)
            : world.theme.title,
        introduction: random.pick(
          world.boardMode === 'logic-cube'
            ? (world.theme.buildingIntroductions ?? world.theme.introductions)
            : world.theme.introductions,
        ),
        objective: random.pick(
          world.boardMode === 'logic-cube'
            ? (world.theme.buildingObjectives ?? world.theme.objectives)
            : world.theme.objectives,
        ),
        characters: world.characters,
        items: world.items,
        positions: world.positions,
        clues: [],
        metadata: {
          generatorVersion: GENERATOR_VERSION,
          solutionCount: 1,
          difficultyScore: 0,
          exploredNodes: 0,
        },
      }
      const shuffledCandidates = random.shuffle(
        generateCandidateClues(basePuzzle, world.solution, random),
      )
      const orderedCandidates = (() => {
        if (world.boardMode === 'logic-cube') {
          return [
            ...shuffledCandidates.filter((clue) => clue.type === 'same-floor'),
            ...shuffledCandidates.filter(
              (clue) => clue.type === 'above' || clue.type === 'below',
            ),
            ...shuffledCandidates.filter((clue) => clue.type === 'adjacent'),
            ...shuffledCandidates.filter((clue) => !isNarrativeGridClue(clue)),
          ]
        }
        if (world.boardMode !== 'logic-grid') return shuffledCandidates
        const landmarkCandidates = shuffledCandidates.filter(
          (clue) => clue.type === 'character-next-to-obstacle',
        )
        const landmarkCandidateIds = new Set(landmarkCandidates.map((clue) => clue.id))
        const narrativeCandidates = shuffledCandidates.filter(isNarrativeGridClue)
        const earlyNarrative = narrativeCandidates.slice(0, 2)
        const remainingCandidates = shuffledCandidates.filter(
          (clue) =>
            !landmarkCandidateIds.has(clue.id) &&
            !earlyNarrative.some((candidate) => candidate.id === clue.id),
        )
        return [...landmarkCandidates, ...earlyNarrative, ...remainingCandidates]
      })()
      const landmarkAnchors =
        world.boardMode === 'logic-grid'
          ? orderedCandidates.filter((clue) => clue.type === 'character-next-to-obstacle')
          : []
      const cubeAnchors =
        world.boardMode === 'logic-cube'
          ? [
              ...orderedCandidates.filter(
                (clue) =>
                  clue.type === 'character-at-position' &&
                  world.positions.find((position) => position.id === clue.positionId)
                    ?.buildingKind === 'shop',
              ),
              ...orderedCandidates.filter((clue) => clue.type === 'same-floor').slice(0, 1),
              ...orderedCandidates
                .filter((clue) => clue.type === 'above' || clue.type === 'below')
                .slice(0, 1),
              ...orderedCandidates.filter((clue) => clue.type === 'adjacent').slice(0, 1),
            ]
          : []
      // Landmark clues keep each initial domain small. Exact cells are a fallback,
      // never the main clue list, so the player still has a real deduction to make.
      const maximumExactClues = Math.max(1, basePuzzle.characters.length - 1)
      const shopExactCandidates = orderedCandidates.filter(
        (clue) =>
          clue.type === 'character-at-position' &&
          world.positions.find((position) => position.id === clue.positionId)?.buildingKind ===
            'shop',
      )
      const shopExactIds = new Set(shopExactCandidates.map((clue) => clue.id))
      const spatialFallbacks =
        world.boardMode === 'logic-grid' || world.boardMode === 'logic-cube'
          ? [
              ...shopExactCandidates,
              ...orderedCandidates.filter(
                (clue) => clue.type === 'character-at-position' && !shopExactIds.has(clue.id),
              ),
            ].slice(0, maximumExactClues)
          : []
      const spatialFallbackIds = new Set(spatialFallbacks.map((clue) => clue.id))
      const narrativeAnchors =
        world.boardMode === 'logic-grid'
          ? orderedCandidates
              .filter(isNarrativeGridClue)
              .slice(0, difficulty === 'easy' ? 1 : 2)
          : []
      const cornerAnchors =
        world.boardMode !== 'map' && world.buildingPlacement !== 'rooms' && random.next() < 0.4
          ? orderedCandidates
              .filter((clue) => clue.type === 'in-corner' || clue.type === 'not-in-corner')
              .slice(0, 1)
          : []
      const childDirectCandidates =
        world.boardMode === 'map'
          ? orderedCandidates.filter(
              (clue) =>
                clue.type === 'character-at-position' || clue.type === 'character-in-place',
            )
          : []
      const childAnchors =
        world.boardMode !== 'map'
          ? []
          : childDirectCandidates.slice(
              0,
              difficulty === 'easy'
                ? Math.max(1, world.characters.length - 1)
                : difficulty === 'medium'
                  ? Math.max(2, Math.floor(world.characters.length / 3))
                  : 1,
            )
      const childStoryCandidates =
        world.boardMode === 'map'
          ? orderedCandidates.filter(
              (clue) =>
                clue.type !== 'has-item' &&
                clue.type !== 'does-not-have-item' &&
                clue.type !== 'distance' &&
                clue.type !== 'same-row' &&
                clue.type !== 'different-row' &&
                clue.type !== 'same-column' &&
                clue.type !== 'different-column',
            )
          : orderedCandidates
      const childCandidateOrder =
        world.boardMode === 'map' && difficulty === 'hard'
          ? [
              ...childStoryCandidates.filter(
                (clue) =>
                  clue.type !== 'character-at-position' && clue.type !== 'character-in-place',
              ),
              ...childStoryCandidates.filter(
                (clue) =>
                  clue.type === 'character-at-position' || clue.type === 'character-in-place',
              ),
            ]
          : childStoryCandidates
      const childContextAnchors = (() => {
        if (world.boardMode !== 'map') return []
        const protectedClues: Puzzle['clues'][number][] = [...childAnchors]
        for (const character of world.characters) {
          if (
            protectedClues.some((clue) =>
              clueReferencesCharacter(basePuzzle, clue, character.id),
            )
          ) {
            continue
          }
          const relatedCandidates = childCandidateOrder.filter((clue) =>
            clueReferencesCharacter(basePuzzle, clue, character.id),
          )
          const relatedClue =
            relatedCandidates.find(
              (clue) =>
                clue.type !== 'character-at-position' && clue.type !== 'character-in-place',
            ) ?? relatedCandidates[0]
          if (!relatedClue) {
            throw new Error('No s’ha pogut preparar una pista per a cada infant.')
          }
          if (!protectedClues.some((clue) => clue.id === relatedClue.id)) {
            protectedClues.push(relatedClue)
          }
        }
        return protectedClues
      })()
      const candidates =
        world.boardMode === 'logic-grid' || world.boardMode === 'logic-cube'
          ? [
              ...orderedCandidates.filter((clue) => clue.type !== 'character-at-position'),
              ...orderedCandidates.filter((clue) => spatialFallbackIds.has(clue.id)),
            ]
          : childCandidateOrder
      let clues = selectMinimalUniqueClues(basePuzzle, candidates, [
        ...childContextAnchors,
        ...landmarkAnchors,
        ...narrativeAnchors,
        ...cubeAnchors,
        ...cornerAnchors,
      ])
      if (world.boardMode === 'map') {
        const difficultyAnchorIds = new Set(childAnchors.map((clue) => clue.id))
        const contextualAnchorIds = new Set(
          childContextAnchors
            .filter((clue) => !difficultyAnchorIds.has(clue.id))
            .map((clue) => clue.id),
        )

        for (const clue of [...clues].reverse()) {
          if (!contextualAnchorIds.has(clue.id)) continue
          const reducedClues = clues.filter((candidate) => candidate.id !== clue.id)
          const retainsContext = world.characters.every((character) =>
            reducedClues.some((candidate) =>
              clueReferencesCharacter(basePuzzle, candidate, character.id),
            ),
          )
          if (
            retainsContext &&
            analyzeSolutions({ ...basePuzzle, clues: reducedClues }, { limit: 2 }).count === 1
          ) {
            clues = reducedClues
          }
        }
      }
      const candidate: Puzzle = {
        ...basePuzzle,
        clues,
        metadata: {
          ...basePuzzle.metadata,
          difficultyScore: difficultyScore({ ...basePuzzle, clues }),
        },
      }
      const validation = analyzeSolutions(candidate, { limit: 2 })
      const childContentIsMinimal =
        world.boardMode !== 'map' || childCluesAreNecessaryOrContextual(basePuzzle, clues)

      if (validation.count === 1 && !validation.reachedNodeLimit && childContentIsMinimal) {
        return {
          ...candidate,
          metadata: { ...candidate.metadata, exploredNodes: validation.exploredNodes },
        }
      }
    } catch (error) {
      if (!isRecoverableGenerationError(error)) throw error
    }
  }

  throw new Error('No s’ha pogut validar una aventura nova dins del límit d’intents.')
}

export const generatePuzzle = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Audience = 'children',
  variant: PuzzleVariant = 'spatial',
  preferredGridSize?: AdvancedGridSize,
  preferredChildMapSize?: ChildMapSize,
  preferredBuildingDepth?: BuildingSize,
  buildingPlacement: BuildingPlacement = 'cells',
): Puzzle => {
  if (audience === 'children') {
    return generatePuzzleDirect(
      difficulty,
      source,
      audience,
      preferredChildMapSize
        ? { boardMode: 'map', characterCount: preferredChildMapSize }
        : undefined,
    )
  }

  const puzzleSeed = seed(source)
  if (variant === 'cube' && buildingPlacement === 'rooms') {
    const structuralTemplate = advancedTemplateCandidates(
      'hard',
      puzzleSeed,
      audience,
      variant,
      undefined,
      preferredBuildingDepth,
    )[0]
    if (!structuralTemplate || structuralTemplate.boardMode !== 'logic-cube') {
      throw new Error('No s’ha pogut seleccionar una estructura d’edifici validada.')
    }
    return withBuildingGuidance(
      {
        ...materializeAdvancedPuzzleTemplate(structuralTemplate, puzzleSeed, 'rooms'),
        difficulty,
      },
      difficulty,
    )
  }
  const templates = advancedTemplateCandidates(
    variant === 'cube' ? 'hard' : difficulty,
    puzzleSeed,
    audience,
    variant,
    preferredGridSize,
    preferredBuildingDepth,
  )
  for (const template of templates) {
    try {
      const materialized = materializeAdvancedPuzzleTemplate(template, puzzleSeed)
      return materialized.boardMode === 'logic-cube'
        ? withBuildingGuidance(materialized, difficulty)
        : withSpatialGuidance(materialized, difficulty)
    } catch {
      // Try another structure of the same independently selected size.
    }
  }

  if (variant === 'cube') {
    const buildingDepth =
      preferredBuildingDepth ??
      new SeededRandom(deriveSeed(puzzleSeed, 97)).pick(BUILDING_DEPTHS)
    return withBuildingGuidance(
      generatePuzzleDirect('hard', source, audience, {
        boardMode: 'logic-cube',
        gridSize: 5,
        depth: buildingDepth,
        characterCount: 8,
      }),
      difficulty,
    )
  }

  const fallbackRandom = new SeededRandom(deriveSeed(puzzleSeed, 101))
  const fallbackSizes = preferredGridSize
    ? [preferredGridSize]
    : fallbackRandom.shuffle(advancedGridSizes)
  const plans = fallbackRandom.shuffle(spatialPlanIdsForAudience(audience))
  for (const gridSize of fallbackSizes) {
    const spatialPlanId = plans[gridSize % plans.length]
    if (!spatialPlanId) continue
    try {
      return withSpatialGuidance(
        generatePuzzleDirect(difficulty, source, audience, {
          gridSize,
          characterCount: advancedCharacterCount(difficulty, gridSize),
          spatialPlanId,
        }),
        difficulty,
      )
    } catch {
      // Keep the fallback independent from difficulty by trying every grid size.
    }
  }
  throw new Error('No s’ha pogut validar cap estructura espacial per a aquesta llavor.')
}

export const audienceForPuzzleCollection = (
  collection: PuzzleCollection,
  source: Seed | string,
): Audience => {
  if (collection === 'children') return 'children'
  const selector = new SeededRandom(deriveSeed(seed(source), 211))
  return selector.pick(['teens', 'adults'] as const)
}

const candidateSeedsForTheme = (
  source: Seed | string,
  audience: Audience,
  themeId: ThemeId,
  childMapSize: ChildMapSize,
) => {
  const candidates = themesForAudience(audience)
  if (!candidates.some((theme) => theme.id === themeId)) {
    throw new Error('El tema no pertany a aquest tipus de puzzle.')
  }
  const matchingSeeds: Seed[] = []
  for (let attempt = 0; attempt < 256; attempt += 1) {
    const candidateRandom = new SeededRandom(`${source}|theme|${attempt}`)
    const candidate = seed(
      `adventure-${candidateRandom.integer(0, 0x7fffffff).toString(36)}-${candidateRandom
        .integer(0, 0x7fffffff)
        .toString(36)}`,
    )
    const selector = new SeededRandom(deriveSeed(candidate, audience === 'children' ? 0 : 41))
    if (audience === 'children' && childMapSize !== 4) selector.next()
    if (selector.pick(candidates).id === themeId) matchingSeeds.push(candidate)
  }
  if (matchingSeeds.length === 0) {
    throw new Error('No s\u2019ha pogut preparar el tema escollit.')
  }
  return matchingSeeds
}

export const generatePuzzleForCollection = (
  difficulty: Difficulty,
  source: Seed | string,
  collection: PuzzleCollection,
  preferredGridSize: AdvancedGridSize = 6,
  preferredChildMapSize: ChildMapSize = 4,
  preferredBuildingDepth: BuildingSize = 3,
  preferredThemeId?: ThemeId,
  buildingPlacement: BuildingPlacement = 'rooms',
) => {
  const selectedTheme = preferredThemeId ? getTheme(preferredThemeId) : undefined
  const selectedAudience = selectedTheme?.audience ?? 'children'
  if (
    selectedTheme &&
    ((collection === 'children' && selectedAudience !== 'children') ||
      (collection !== 'children' && selectedAudience === 'children'))
  ) {
    throw new Error('El tema no pertany a aquest tipus de puzzle.')
  }
  const audience = selectedTheme
    ? selectedAudience
    : audienceForPuzzleCollection(collection, source)
  const generateSelectedPuzzle = (puzzleSeed: Seed | string) =>
    generatePuzzle(
      difficulty,
      puzzleSeed,
      audience,
      collection === 'three-dimensional' ? 'cube' : 'spatial',
      collection === 'two-dimensional' ? preferredGridSize : undefined,
      collection === 'children' ? preferredChildMapSize : undefined,
      collection === 'three-dimensional' ? preferredBuildingDepth : undefined,
      collection === 'three-dimensional' ? buildingPlacement : 'cells',
    )

  if (!preferredThemeId) return generateSelectedPuzzle(source)

  for (const puzzleSeed of candidateSeedsForTheme(
    source,
    audience,
    preferredThemeId,
    preferredChildMapSize,
  )) {
    try {
      const puzzle = generateSelectedPuzzle(puzzleSeed)
      if (puzzle.theme === preferredThemeId) return puzzle
    } catch {
      // Continue until an ordinary reproducible seed validates with the selected theme.
    }
  }
  throw new Error('No s\u2019ha pogut preparar el tema escollit.')
}

const advancedGridSizes = [6, 9, 16] as const

const advancedTemplateCandidates = (
  difficulty: Difficulty,
  puzzleSeed: Seed,
  audience: Exclude<Audience, 'children'>,
  variant: PuzzleVariant,
  preferredGridSize?: AdvancedGridSize,
  preferredBuildingDepth?: BuildingSize,
) => {
  const templates = advancedPuzzleTemplates.filter(
    (template) =>
      template.generatorVersion === GENERATOR_VERSION &&
      template.audience === audience &&
      template.difficulty === difficulty &&
      template.boardMode === (variant === 'cube' ? 'logic-cube' : 'logic-grid'),
  )
  if (templates.length === 0) return []
  const selector = new SeededRandom(deriveSeed(puzzleSeed, 97))
  if (variant === 'cube') {
    const availableDepths = BUILDING_DEPTHS.filter((depth) =>
      templates.some(
        (template) => template.boardMode === 'logic-cube' && template.depth === depth,
      ),
    )
    if (availableDepths.length === 0) return []
    const selectedDepth = preferredBuildingDepth ?? selector.pick(availableDepths)
    if (!availableDepths.includes(selectedDepth)) return []
    return selector.shuffle(
      templates.filter(
        (template) => template.boardMode === 'logic-cube' && template.depth === selectedDepth,
      ),
    )
  }
  const availableSizes = advancedGridSizes.filter((gridSize) =>
    templates.some((template) => template.gridSize === gridSize),
  )
  if (availableSizes.length === 0) return []
  const selectedSize = preferredGridSize ?? selector.pick(availableSizes)
  if (!availableSizes.includes(selectedSize)) return []
  return selector.shuffle(templates.filter((template) => template.gridSize === selectedSize))
}

export const selectAdvancedPuzzleTemplate = (
  difficulty: Difficulty,
  source: Seed | string,
  audience: Exclude<Audience, 'children'>,
  variant: PuzzleVariant = 'spatial',
  preferredGridSize?: AdvancedGridSize,
  preferredBuildingDepth?: BuildingSize,
) =>
  advancedTemplateCandidates(
    difficulty,
    seed(source),
    audience,
    variant,
    preferredGridSize,
    preferredBuildingDepth,
  )[0] ?? null
