import { describe, expect, it } from 'vitest'
import { decodeSignalEnvelope, encodeSignalEnvelope } from '../multiplayer/signaling'

// cspell:ignore ufrag

describe('multiplayer signaling', () => {
  it('round-trips compressed WebRTC descriptions without storing puzzle answers', () => {
    const encoded = encodeSignalEnvelope({
      v: 1,
      kind: 'offer',
      lobbyId: 'lobby-1',
      peerId: 'peer-1',
      profile: { id: 'master-1', name: 'Master', avatar: '🙂' },
      description: {
        type: 'offer',
        sdp: [
          'v=0',
          'a=fingerprint:sha-256 00:11',
          'a=ice-ufrag:test',
          'a=candidate:1 1 udp 1 192.168.1.10 51234 typ host',
        ].join('\r\n'),
      },
    })

    expect(encoded).not.toContain('candidate')
    const decoded = decodeSignalEnvelope(encoded)

    expect(decoded?.kind).toBe('offer')
    expect(decoded?.description.type).toBe('offer')
    expect(decoded?.profile.name).toBe('Master')
  })

  it('rejects invalid or mismatched descriptions', () => {
    expect(decodeSignalEnvelope('not-a-signal')).toBeNull()
    const encoded = encodeSignalEnvelope({
      v: 1,
      kind: 'answer',
      lobbyId: 'lobby-1',
      peerId: 'peer-1',
      profile: { id: 'guest-1', name: 'Convidat', avatar: '⭐' },
      description: { type: 'answer', sdp: 'v=0' },
    })
    const decoded = decodeSignalEnvelope(encoded)
    expect(decoded?.description.type).toBe('answer')
  })

  it('rejects an answer encoded as an offer envelope', () => {
    const encoded = encodeSignalEnvelope({
      v: 1,
      kind: 'answer',
      lobbyId: 'lobby-2',
      peerId: 'peer-2',
      profile: { id: 'master-2', name: 'Aina', avatar: '🌿' },
      description: { type: 'answer', sdp: 'v=0' },
    })

    expect(decodeSignalEnvelope(encoded)?.kind).toBe('answer')
  })
})
