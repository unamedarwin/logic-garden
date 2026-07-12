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
import { difficultyConfigs, logicGridDimensions } from './difficulty'
import { SeededRandom } from './seededRandom'

export interface GeneratedWorld {
  readonly theme: Theme
  readonly boardMode: 'map' | 'logic-grid'
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
  const characterCount =
    boardMode === 'logic-grid' ? logicGridDimensions[difficulty] : config.characterCount
  const invertedMap =
    boardMode === 'map' && config.rows !== config.columns && random.next() < 0.5
  const mapColumns = invertedMap ? config.rows : config.columns
  const theme = random.pick(themesForAudience(audience))
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
  const positions =
    boardMode === 'logic-grid'
      ? Array.from({ length: characterCount * characterCount }, (_, index) => {
          const row = Math.floor(index / characterCount)
          const column = index % characterCount
          return {
            id: positionId(`position-${row}-${column}`),
            placeId: placeId(`place-${row}-${column}`),
            row,
            column,
            label: `${theme.places[column]!} · ${row + 1}`,
          }
        })
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
          const rows = random.shuffle(
            Array.from({ length: characterCount }, (_, value) => value),
          )
          const columns = random.shuffle(
            Array.from({ length: characterCount }, (_, value) => value),
          )
          return Object.fromEntries(
            characters.map((character, index) => {
              const position = positions.find(
                (candidate) =>
                  candidate.row === rows[index] && candidate.column === columns[index],
              )
              if (!position) throw new Error('No s’ha pogut construir una posició de graella.')
              return [character.id, position.id]
            }),
          ) as Assignment
        })()
      : (() => {
          const shuffledPositionIds = random.shuffle(positions.map((position) => position.id))
          return Object.fromEntries(
            characters.map((character, index) => [character.id, shuffledPositionIds[index]!]),
          ) as Assignment
        })()

  return { theme: theme as Theme, boardMode, characters, items, positions, solution }
}
