import { describe, expect, it } from 'vitest'
import { seed } from '../domain/types'
import {
  decodePeerCompetitionMessage,
  encodePeerCompetitionMessage,
  isCompetitionRound,
  type CompetitionRound,
} from '../multiplayer/protocol'

const round: CompetitionRound = {
  id: 'round-1',
  title: 'El club de lectures',
  collection: 'three-dimensional',
  themeId: 'book-club',
  startedAt: 1_800,
  metadata: {
    difficulty: 'medium',
    seed: seed('group-round'),
    audience: 'adults',
    generatorVersion: 16,
    variant: 'cube',
    buildingDepth: 6,
    buildingPlacement: 'rooms',
  },
}

describe('multiplayer protocol', () => {
  it('accepts reproducible rounds without carrying a solution', () => {
    expect(isCompetitionRound(round)).toBe(true)
    expect(JSON.stringify(round)).not.toContain('solution')
    expect(JSON.stringify(round)).not.toContain('answer')
  })

  it('round-trips peer messages for a started round', () => {
    const decoded = decodePeerCompetitionMessage(
      encodePeerCompetitionMessage({
        type: 'round-started',
        lobbyId: 'lobby-1',
        round,
      }),
    )

    expect(decoded?.type).toBe('round-started')
    expect(decoded?.type === 'round-started' ? decoded.round.themeId : undefined).toBe(
      'book-club',
    )
  })

  it('rejects malformed result messages', () => {
    expect(
      decodePeerCompetitionMessage(
        JSON.stringify({
          type: 'round-finished',
          lobbyId: 'lobby-1',
          result: {
            roundId: 'round-1',
            participantId: 'peer-1',
            elapsedSeconds: -1,
            moves: 0,
            hintsUsed: 0,
            finishedAt: Date.now(),
          },
        }),
      ),
    ).toBeNull()
  })

  it('round-trips a safe setup preview without a seed or solution', () => {
    const encoded = encodePeerCompetitionMessage({
      type: 'setup-selected',
      lobbyId: 'lobby-1',
      setup: {
        collection: 'three-dimensional',
        difficulty: 'hard',
        themeId: 'city-garden',
        size: 8,
        buildingPlacement: 'rooms',
      },
    })
    const decoded = decodePeerCompetitionMessage(encoded)

    expect(decoded?.type).toBe('setup-selected')
    expect(encoded).not.toContain('seed')
    expect(encoded).not.toContain('solution')
  })

  it('accepts an explicit peer departure only with a safe profile id', () => {
    expect(
      decodePeerCompetitionMessage(
        encodePeerCompetitionMessage({
          type: 'peer-left',
          lobbyId: 'lobby-1',
          profileId: 'player-2',
        }),
      )?.type,
    ).toBe('peer-left')
    expect(
      decodePeerCompetitionMessage(
        JSON.stringify({ type: 'peer-left', lobbyId: 'lobby-1', profileId: '../bad' }),
      ),
    ).toBeNull()
  })
})
