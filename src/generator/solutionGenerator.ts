import { themes, type Theme } from '../domain/themes'
import {
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
import { difficultyConfigs } from './difficulty'
import { SeededRandom } from './seededRandom'

export interface GeneratedWorld {
  readonly theme: Theme
  readonly characters: readonly Character[]
  readonly items: readonly Item[]
  readonly positions: readonly Position[]
  readonly solution: Assignment
}

export const generateWorld = (difficulty: Difficulty, random: SeededRandom): GeneratedWorld => {
  const config = difficultyConfigs[difficulty]
  const theme = random.pick(themes)
  const items = random
    .shuffle(theme.items)
    .slice(0, config.characterCount)
    .map((item, index) => ({
      id: itemId(`item-${index}`),
      label: item.label,
      emoji: item.emoji,
    }))
  const characters = random
    .shuffle(theme.characters)
    .slice(0, config.characterCount)
    .map((character, index) => ({
      id: characterId(`character-${index}`),
      name: character.name,
      emoji: character.emoji,
      description: character.description,
      itemId: items[index]!.id,
    }))
  const positions = theme.places.slice(0, config.characterCount).map((label, index) => ({
    id: positionId(`position-${index}`),
    placeId: placeId(`place-${index}`),
    row: Math.floor(index / config.columns),
    column: index % config.columns,
    label,
  }))
  const shuffledPositionIds = random.shuffle(positions.map((position) => position.id))
  const solution = Object.fromEntries(
    characters.map((character, index) => [character.id, shuffledPositionIds[index]!]),
  ) as Assignment

  return { theme: theme as Theme, characters, items, positions, solution }
}
