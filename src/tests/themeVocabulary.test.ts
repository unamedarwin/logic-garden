import { describe, expect, it } from 'vitest'
import { localizeThemeLabel, localizeThemePositionLabel } from '../domain/themeVocabulary'
import { themes, type Theme } from '../domain/themes'
import type { Locale } from '../domain/types'

const locales = ['ca', 'es', 'en'] as const satisfies readonly Locale[]

const unchangedSpanishLabels = new Set([
  'La palmera',
  'El mirador',
  'La biblioteca',
  'La torre',
  'El taller',
  'La sala de música',
  'La roca alta',
  'La carpa',
  'El carrusel',
  'La cabina 1',
  'La cabina 2',
  'La grada',
  'La cafetera',
  'El compostador',
  'flor',
  'estrella',
  'mapa',
  'sol',
  'capa',
  'planeta',
  'flor lunar',
  'cometa',
  'perla',
  'alga',
  'corona',
  'pintura',
  'música',
  'entrada',
  'cinta',
  'cantimplora',
  'gorra',
  'carpeta',
  'tambor',
  'guitarra',
  'partitura',
  'dorsal',
  'bicicleta',
  'medalla',
  'goma',
  'pantalla',
  'paleta de color',
  'maqueta',
  'planta',
  'tetera',
  'botes',
  'etiqueta',
  'escala',
  'esponja',
  'pera',
  'nenúfar',
])

const labelsForTheme = (theme: Theme): readonly string[] => [
  ...theme.places,
  ...theme.items.map(({ label }) => label),
  ...(theme.roomObjects ?? []).map(({ label }) => label),
  ...(theme.roomObjectsByPlace ?? []).flatMap((room) => room.map(({ label }) => label)),
]

describe('theme vocabulary', () => {
  it('localizes every player-facing theme label in all supported locales', () => {
    expect(themes).toHaveLength(16)

    for (const theme of themes) {
      for (const sourceLabel of labelsForTheme(theme)) {
        for (const locale of locales) {
          const localized = localizeThemeLabel(locale, theme.id, sourceLabel)
          expect(localized, `${locale}/${theme.id}/${sourceLabel}`).not.toBe('')

          if (locale === 'ca') {
            expect(localized).toBe(sourceLabel)
          } else if (locale === 'en' || !unchangedSpanishLabels.has(sourceLabel)) {
            expect(localized, `${locale}/${theme.id}/${sourceLabel}`).not.toBe(sourceLabel)
          }
        }
      }
    }
  })

  it('uses the theme context for labels with more than one meaning', () => {
    expect(localizeThemeLabel('en', 'kind-magic-school', 'ploma')).toBe('feather')
    expect(localizeThemeLabel('en', 'book-club', 'ploma')).toBe('fountain pen')
    expect(localizeThemeLabel('en', 'music-studio', 'rellotge')).toBe('watch')
    expect(localizeThemeLabel('en', 'book-club', 'rellotge')).toBe('clock')
  })

  it('describes the playable garden pond area as its edge', () => {
    expect(localizeThemeLabel('ca', 'city-garden', 'La vora de la bassa')).toBe(
      'La vora de la bassa',
    )
    expect(localizeThemeLabel('es', 'city-garden', 'La vora de la bassa')).toBe(
      'El borde del estanque',
    )
    expect(localizeThemeLabel('en', 'city-garden', 'La vora de la bassa')).toBe('The pond edge')
  })

  it('keeps unknown and out-of-theme labels unchanged', () => {
    expect(localizeThemeLabel('es', 'forest-party', 'etiqueta desconeguda')).toBe(
      'etiqueta desconeguda',
    )
    expect(localizeThemeLabel('en', 'forest-party', 'El planeta blau')).toBe('El planeta blau')
  })

  it('localizes a room label without losing its generated position suffix', () => {
    expect(localizeThemePositionLabel('es', 'music-studio', 'La sala d’assaig · 2.4')).toBe(
      'La sala de ensayo · 2.4',
    )
    expect(localizeThemePositionLabel('en', 'music-studio', 'La sala d’assaig · 2.4')).toBe(
      'The rehearsal room · 2.4',
    )
  })
})
