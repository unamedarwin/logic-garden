import type { Locale } from './types'

export const activeLocales = ['ca'] as const satisfies readonly Locale[]

const localeCodes: ReadonlySet<string> = new Set(activeLocales)

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && localeCodes.has(value)

export const detectBrowserLocale = (languageTags: readonly string[]): Locale => {
  for (const languageTag of languageTags) {
    const primaryLanguage = languageTag.trim().toLowerCase().replaceAll('_', '-').split('-')[0]
    if (isLocale(primaryLanguage)) return primaryLanguage
  }
  return 'ca'
}
