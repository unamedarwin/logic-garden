import type { Audience, AvatarId } from './types'

export interface PlayerProfile {
  readonly schemaVersion: 1
  readonly name: string
  readonly audience: Audience
  readonly avatar: AvatarId
}

export const avatarOptions: readonly { readonly id: AvatarId; readonly emoji: string }[] = [
  { id: 'leaf', emoji: '🌿' },
  { id: 'kite', emoji: '🪁' },
  { id: 'music', emoji: '🎵' },
  { id: 'puzzle', emoji: '🧩' },
  { id: 'moon', emoji: '🌙' },
  { id: 'ball', emoji: '⚽' },
  { id: 'paint', emoji: '🎨' },
  { id: 'book', emoji: '📚' },
]

export const defaultProfile: PlayerProfile = {
  schemaVersion: 1,
  name: '',
  audience: 'children',
  avatar: 'leaf',
}

export const isAudience = (value: string | null): value is Audience =>
  value === 'children' || value === 'teens' || value === 'adults'
