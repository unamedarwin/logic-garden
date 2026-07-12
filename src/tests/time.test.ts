import { describe, expect, it } from 'vitest'
import { elapsedSeconds, formatCounter } from '../game/time'

describe('game counter', () => {
  it('formats elapsed time and freezes at the recorded finish', () => {
    expect(formatCounter(65)).toBe('01:05')
    expect(elapsedSeconds(1_000, undefined, 4_900)).toBe(3)
    expect(elapsedSeconds(1_000, 7_900, 20_000)).toBe(6)
  })
})
