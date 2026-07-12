import { themesForAudience, type Theme } from '../domain/themes'
import {
  type Audience,
  characterId,
  itemId,
  placeId,
  positionId,
  type Assignment,
  type Character,
  type Difficulty,
  type Item,
  type Position,
} from '../domain/types'
import {
  planObstacles,
  spatialPlanForId,
  spatialPlanIdsForAudience,
  spatialPlanZoneAt,
  type SpatialPlanId,
} from '../domain/spatialPlan'
import { difficultyConfigs, logicGridCharacterCounts, logicGridDimensions } from './difficulty'
import { SeededRandom } from './seededRandom'

export interface GeneratedWorld {
  readonly theme: Theme
  readonly boardMode: 'map' | 'logic-grid'
  readonly spatialPlanId?: SpatialPlanId
  readonly characters: readonly Character[]
  readonly items: readonly Item[]
  readonly positions: readonly Position[]
  readonly solution: Assignment
}

export const generateWorld = (
  difficulty: Difficulty,
  random: SeededRandom,
  audience: Audience,
): GeneratedWorld => {
  const config = difficultyConfigs[difficulty]
  const boardMode = audience === 'children' ? 'map' : 'logic-grid'
  const spatialAudience = audience === 'children' ? 'teens' : audience
  const characterCount =
    boardMode === 'logic-grid' ? logicGridCharacterCounts[difficulty] : config.characterCount
  const invertedMap =
    boardMode === 'map' && config.rows !== config.columns && random.next() < 0.5
  const mapColumns = invertedMap ? config.rows : config.columns
  const theme = random.pick(themesForAudience(audience))
  const spatialPlanId =
    boardMode === 'logic-grid'
      ? random.pick(spatialPlanIdsForAudience(spatialAudience))
      : undefined
  const items = random
    .shuffle(theme.items)
    .slice(0, characterCount)
    .map((item, index) => ({
      id: itemId(`item-${index}`),
      label: item.label,
      emoji: item.emoji,
    }))
  const characters = random
    .shuffle(theme.characters)
    .slice(0, characterCount)
    .map((character, index) => ({
      id: characterId(`character-${index}`),
      name: character.name,
      emoji: character.emoji,
      description: character.description,
      itemId: items[index]!.id,
    }))
  const positions: readonly Position[] =
    boardMode === 'logic-grid'
      ? (() => {
          const gridSize = logicGridDimensions[difficulty]
          const spatialPlan = spatialPlanForId(spatialPlanId)
          if (!spatialPlan) throw new Error('No s’ha pogut carregar la planta espacial.')
          const obstacleObjects = random.shuffle(theme.items)
          const blocked = new Map(
            planObstacles(spatialPlanId, gridSize, gridSize).map(({ row, column }, index) => [
              `${row}:${column}`,
              obstacleObjects[index % obstacleObjects.length],
            ]),
          )
          return Array.from({ length: gridSize * gridSize }, (_, index) => {
            const row = Math.floor(index / gridSize)
            const column = index % gridSize
            const zone = spatialPlanZoneAt(spatialPlan, column, row, gridSize, gridSize)
            const place = theme.places[zone % theme.places.length]!
            const obstacle = blocked.get(`${row}:${column}`)
            return {
              id: positionId(`position-${row}-${column}`),
              placeId: placeId(`place-${zone}`),
              row,
              column,
              label: `${place} · ${row + 1}`,
              blocked: obstacle !== undefined,
              obstacleEmoji: obstacle?.emoji,
              obstacleLabel: obstacle?.label,
            }
          })
        })()
      : theme.places.slice(0, characterCount).map((label, index) => ({
          id: positionId(`position-${index}`),
          placeId: placeId(`place-${index}`),
          row: Math.floor(index / mapColumns),
          column: index % mapColumns,
          label,
        }))
  const solution =
    boardMode === 'logic-grid'
      ? (() => {
          const adjacentToObstacle = positions.filter(
            (position) =>
              !position.blocked &&
              positions.some(
                (candidate) =>
                  candidate.blocked &&
                  Math.abs(candidate.row - position.row) +
                    Math.abs(candidate.column - position.column) ===
                    1,
              ),
          )

          for (let attempt = 0; attempt < 80; attempt += 1) {
            const candidates = random.shuffle(adjacentToObstacle)
            const selected: Position[] = []

            for (let index = 0; index < characterCount; index += 1) {
              const position = candidates.find(
                (candidate) =>
                  !selected.some(
                    (placed) =>
                      placed.row === candidate.row || placed.column === candidate.column,
                  ),
              )
              if (!position) break
              selected.push(position)
              candidates.splice(candidates.indexOf(position), 1)
            }

            if (selected.length === characterCount) {
              return Object.fromEntries(
                characters.map((character, index) => [character.id, selected[index]!.id]),
              ) as Assignment
            }
          }

          throw new Error('No s’ha pogut construir una posició de graella.')
        })()
      : (() => {
          const shuffledPositionIds = random.shuffle(positions.map((position) => position.id))
          return Object.fromEntries(
            characters.map((character, index) => [character.id, shuffledPositionIds[index]!]),
          ) as Assignment
        })()

  return {
    theme: theme as Theme,
    boardMode,
    spatialPlanId,
    characters,
    items,
    positions,
    solution,
  }
}
