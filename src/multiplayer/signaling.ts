import { gzipSync, gunzipSync, strFromU8, strToU8 } from 'fflate'
import type { CompetitionProfile } from './protocol'

export type SignalKind = 'offer' | 'answer'

export interface SignalEnvelope {
  readonly v: 1
  readonly kind: SignalKind
  readonly lobbyId: string
  readonly peerId: string
  readonly profile: CompetitionProfile
  readonly description: RTCSessionDescriptionInit
}

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const toBase64Url = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

const fromBase64Url = (value: string) => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

const isSafeId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9._~-]{1,80}$/u.test(value)

const isSafeProfile = (value: unknown): value is CompetitionProfile => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    isSafeId(candidate.id) &&
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    candidate.name.length <= 40 &&
    typeof candidate.avatar === 'string' &&
    candidate.avatar.length > 0 &&
    candidate.avatar.length <= 16
  )
}

const isSessionDescription = (value: unknown): value is RTCSessionDescriptionInit => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    (candidate.type === 'offer' || candidate.type === 'answer') &&
    typeof candidate.sdp === 'string' &&
    candidate.sdp.length > 0 &&
    candidate.sdp.length <= 80_000
  )
}

export const isSignalEnvelope = (value: unknown): value is SignalEnvelope => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.v === 1 &&
    (candidate.kind === 'offer' || candidate.kind === 'answer') &&
    isSafeId(candidate.lobbyId) &&
    isSafeId(candidate.peerId) &&
    isSafeProfile(candidate.profile) &&
    isSessionDescription(candidate.description) &&
    candidate.description.type === candidate.kind
  )
}

export const encodeSignalEnvelope = (envelope: SignalEnvelope) =>
  toBase64Url(gzipSync(strToU8(JSON.stringify(envelope)), { level: 9 }))

export const decodeSignalEnvelope = (value: string): SignalEnvelope | null => {
  try {
    const json = strFromU8(gunzipSync(fromBase64Url(value.trim())))
    const parsed = JSON.parse(json) as unknown
    return isSignalEnvelope(parsed) ? parsed : null
  } catch {
    try {
      const parsed = JSON.parse(textDecoder.decode(fromBase64Url(value.trim()))) as unknown
      return isSignalEnvelope(parsed) ? parsed : null
    } catch {
      return null
    }
  }
}

export const cameraSupported = () =>
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof document !== 'undefined'

export const encodePlainSignalEnvelope = (envelope: SignalEnvelope) =>
  toBase64Url(textEncoder.encode(JSON.stringify(envelope)))
