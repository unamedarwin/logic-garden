import { seed, type Difficulty, type Seed } from '../domain/types'

export interface SharedGameRoute {
  readonly difficulty: Difficulty
  readonly seed: Seed
}

const isDifficulty = (value: string | null): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard'

export const parseSharedGameRoute = (location: Location): SharedGameRoute | null => {
  if (location.pathname !== import.meta.env.BASE_URL) return null
  const params = new URLSearchParams(location.search)
  const difficulty = params.get('difficulty')
  const gameSeed = params.get('seed')
  const version = params.get('v')
  return version === '1' && isDifficulty(difficulty) && gameSeed
    ? { difficulty, seed: seed(gameSeed) }
    : null
}

export const shareUrl = (puzzle: { readonly difficulty: Difficulty; readonly seed: Seed }) => {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set('v', '1')
  url.searchParams.set('difficulty', puzzle.difficulty)
  url.searchParams.set('seed', puzzle.seed)
  return url.toString()
}
