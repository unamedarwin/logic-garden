import {
  isChallengeMetadata,
  type ChallengeMetadata,
  type BuildingPlacement,
  type Difficulty,
  type PuzzleCollection,
  type ThemeId,
} from '../domain/types'

export type CompetitionRole = 'master' | 'participant'

export interface CompetitionProfile {
  readonly id: string
  readonly name: string
  readonly avatar: string
}

export interface CompetitionParticipant extends CompetitionProfile {
  readonly role: CompetitionRole
  readonly connected: boolean
  readonly cumulativeSeconds: number
  readonly roundsFinished: number
}

export interface CompetitionRound {
  readonly id: string
  readonly title: string
  readonly metadata: ChallengeMetadata
  readonly collection: PuzzleCollection
  readonly themeId: ThemeId
  readonly startedAt: number
}

export interface CompetitionRoundResult {
  readonly roundId: string
  readonly participantId: string
  readonly elapsedSeconds: number
  readonly moves: number
  readonly hintsUsed: number
  readonly finishedAt: number
}

export interface CompetitionSetup {
  readonly collection: PuzzleCollection
  readonly difficulty: Difficulty
  readonly themeId: ThemeId
  readonly size: number
  readonly buildingPlacement?: BuildingPlacement
}

export type ClientCompetitionMessage =
  | {
      readonly type: 'join'
      readonly lobbyId: string
      readonly profile: CompetitionProfile
      readonly role: CompetitionRole
    }
  | { readonly type: 'start-round'; readonly lobbyId: string; readonly round: CompetitionRound }
  | {
      readonly type: 'finish-round'
      readonly lobbyId: string
      readonly result: CompetitionRoundResult
    }

export type ServerCompetitionMessage =
  | {
      readonly type: 'snapshot'
      readonly lobbyId: string
      readonly participants: readonly CompetitionParticipant[]
      readonly activeRound?: CompetitionRound
      readonly results: readonly CompetitionRoundResult[]
    }
  | {
      readonly type: 'round-started'
      readonly lobbyId: string
      readonly round: CompetitionRound
    }
  | { readonly type: 'error'; readonly message: string }

export type PeerCompetitionMessage =
  | { readonly type: 'hello'; readonly lobbyId: string; readonly profile: CompetitionProfile }
  | {
      readonly type: 'round-started'
      readonly lobbyId: string
      readonly round: CompetitionRound
    }
  | {
      readonly type: 'round-finished'
      readonly lobbyId: string
      readonly result: CompetitionRoundResult
    }
  | {
      readonly type: 'standings'
      readonly lobbyId: string
      readonly participants: readonly CompetitionParticipant[]
      readonly results: readonly CompetitionRoundResult[]
      readonly selectedSetup?: CompetitionSetup
    }
  | {
      readonly type: 'setup-selected'
      readonly lobbyId: string
      readonly setup: CompetitionSetup
    }
  | { readonly type: 'peer-left'; readonly lobbyId: string; readonly profileId: string }

const isSafeId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9._~-]{1,64}$/u.test(value)

const isSafeText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 80

const isThemeId = (value: unknown): value is ThemeId =>
  value === 'forest-party' ||
  value === 'treasure-island' ||
  value === 'kind-magic-school' ||
  value === 'space-trip' ||
  value === 'fun-farm' ||
  value === 'sea-garden' ||
  value === 'dino-park' ||
  value === 'friendly-monster-town' ||
  value === 'color-fair' ||
  value === 'mountain-trip' ||
  value === 'music-studio' ||
  value === 'sports-festival' ||
  value === 'creative-lab' ||
  value === 'book-club' ||
  value === 'city-garden' ||
  value === 'weekend-market'

export const isCompetitionProfile = (value: unknown): value is CompetitionProfile => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return isSafeId(candidate.id) && isSafeText(candidate.name) && isSafeText(candidate.avatar)
}

export const isCompetitionRound = (value: unknown): value is CompetitionRound => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    isSafeId(candidate.id) &&
    isSafeText(candidate.title) &&
    isChallengeMetadata(candidate.metadata) &&
    (candidate.collection === 'children' ||
      candidate.collection === 'two-dimensional' ||
      candidate.collection === 'three-dimensional') &&
    isThemeId(candidate.themeId) &&
    Number.isSafeInteger(candidate.startedAt)
  )
}

export const isCompetitionRoundResult = (value: unknown): value is CompetitionRoundResult => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    isSafeId(candidate.roundId) &&
    isSafeId(candidate.participantId) &&
    Number.isSafeInteger(candidate.elapsedSeconds) &&
    Number(candidate.elapsedSeconds) >= 0 &&
    Number(candidate.elapsedSeconds) <= 86_400 &&
    Number.isSafeInteger(candidate.moves) &&
    Number(candidate.moves) >= 0 &&
    Number.isSafeInteger(candidate.hintsUsed) &&
    Number(candidate.hintsUsed) >= 0 &&
    Number.isSafeInteger(candidate.finishedAt)
  )
}

export const isCompetitionSetup = (value: unknown): value is CompetitionSetup => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const validSize =
    (candidate.collection === 'children' && [4, 6, 8].includes(Number(candidate.size))) ||
    (candidate.collection === 'two-dimensional' &&
      [6, 9, 16].includes(Number(candidate.size))) ||
    (candidate.collection === 'three-dimensional' &&
      [3, 4, 5, 6, 7, 8, 9, 10].includes(Number(candidate.size)))
  return (
    validSize &&
    (candidate.difficulty === 'easy' ||
      candidate.difficulty === 'medium' ||
      candidate.difficulty === 'hard') &&
    isThemeId(candidate.themeId) &&
    (candidate.collection !== 'three-dimensional' ||
      candidate.buildingPlacement === 'rooms' ||
      candidate.buildingPlacement === 'cells')
  )
}

export const isClientCompetitionMessage = (
  value: unknown,
): value is ClientCompetitionMessage => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (!isSafeId(candidate.lobbyId)) return false
  if (candidate.type === 'join') {
    return (
      isCompetitionProfile(candidate.profile) &&
      (candidate.role === 'master' || candidate.role === 'participant')
    )
  }
  if (candidate.type === 'start-round') return isCompetitionRound(candidate.round)
  if (candidate.type === 'finish-round') return isCompetitionRoundResult(candidate.result)
  return false
}

export const encodeCompetitionMessage = (message: ClientCompetitionMessage) =>
  JSON.stringify(message)

export const isPeerCompetitionMessage = (value: unknown): value is PeerCompetitionMessage => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (!isSafeId(candidate.lobbyId)) return false
  if (candidate.type === 'hello') return isCompetitionProfile(candidate.profile)
  if (candidate.type === 'round-started') return isCompetitionRound(candidate.round)
  if (candidate.type === 'round-finished') {
    return isCompetitionRoundResult(candidate.result)
  }
  if (candidate.type === 'setup-selected') return isCompetitionSetup(candidate.setup)
  if (candidate.type === 'peer-left') return isSafeId(candidate.profileId)
  if (candidate.type !== 'standings' || !Array.isArray(candidate.participants)) return false
  return (
    candidate.participants.every((participant) => {
      if (!isCompetitionProfile(participant)) return false
      const record = participant as unknown as Record<string, unknown>
      return (
        (record.role === 'master' || record.role === 'participant') &&
        typeof record.connected === 'boolean' &&
        Number.isSafeInteger(record.cumulativeSeconds) &&
        Number(record.cumulativeSeconds) >= 0 &&
        Number.isSafeInteger(record.roundsFinished) &&
        Number(record.roundsFinished) >= 0
      )
    }) &&
    Array.isArray(candidate.results) &&
    candidate.results.every(isCompetitionRoundResult) &&
    (candidate.selectedSetup === undefined || isCompetitionSetup(candidate.selectedSetup))
  )
}

export const encodePeerCompetitionMessage = (message: PeerCompetitionMessage) =>
  JSON.stringify(message)

export const decodePeerCompetitionMessage = (value: string): PeerCompetitionMessage | null => {
  try {
    const parsed = JSON.parse(value) as unknown
    return isPeerCompetitionMessage(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const decodeServerCompetitionMessage = (
  value: string,
): ServerCompetitionMessage | null => {
  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Record<string, unknown>
    if (candidate.type === 'error' && isSafeText(candidate.message)) {
      return { type: 'error', message: candidate.message }
    }
    if (!isSafeId(candidate.lobbyId)) return null
    if (candidate.type === 'round-started' && isCompetitionRound(candidate.round)) {
      return { type: 'round-started', lobbyId: candidate.lobbyId, round: candidate.round }
    }
    if (candidate.type !== 'snapshot' || !Array.isArray(candidate.participants)) return null
    const participants = candidate.participants.filter(
      (participant): participant is CompetitionParticipant => {
        if (!isCompetitionProfile(participant)) return false
        const record = participant as unknown as Record<string, unknown>
        return (
          (record.role === 'master' || record.role === 'participant') &&
          typeof record.connected === 'boolean' &&
          Number.isSafeInteger(record.cumulativeSeconds) &&
          Number(record.cumulativeSeconds) >= 0 &&
          Number.isSafeInteger(record.roundsFinished) &&
          Number(record.roundsFinished) >= 0
        )
      },
    )
    const results = Array.isArray(candidate.results)
      ? candidate.results.filter(isCompetitionRoundResult)
      : []
    return {
      type: 'snapshot',
      lobbyId: candidate.lobbyId,
      participants,
      ...(isCompetitionRound(candidate.activeRound)
        ? { activeRound: candidate.activeRound }
        : {}),
      results,
    }
  } catch {
    return null
  }
}
