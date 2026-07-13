import { describe, expect, it } from 'vitest'
import { gameFeedbackCopy } from '../domain/i18n'

describe('localized game feedback', () => {
  it.each([
    ['ca', 'Pista aplicada: Aina ja és al seu espai.'],
    ['es', 'Pista aplicada: Aina ya está en su espacio.'],
    ['en', 'Hint applied: Aina is now in the right space.'],
  ] as const)('renders solver actions in %s', (locale, expected) => {
    expect(gameFeedbackCopy(locale, { type: 'hint-applied', characterName: 'Aina' })).toBe(
      expected,
    )
  })

  it('keeps dynamic names and places reusable across languages', () => {
    expect(
      gameFeedbackCopy('es', {
        type: 'hint-character-position',
        characterName: 'Kai',
        positionLabel: 'El escenario',
      }),
    ).toBe('Una pequeña ayuda: Kai encaja en El escenario.')
    expect(
      gameFeedbackCopy('en', {
        type: 'hint-character-deducible',
        characterName: 'Kai',
      }),
    ).toContain('Kai')
  })
})
