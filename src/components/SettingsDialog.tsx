import { localeLabels, supportedLocales } from '../domain/i18n'
import { t } from '../domain/i18n'
import type { Locale } from '../domain/types'
import type { Preferences } from '../storage/preferences'

interface SettingsDialogProps {
  readonly preferences: Preferences
  readonly onChange: (preferences: Preferences) => void
  readonly onClose: () => void
  readonly title: string
  readonly locale: Locale
}

export const SettingsDialog = ({
  preferences,
  onChange,
  onClose,
  title,
  locale,
}: SettingsDialogProps) => (
  <div className="settings-backdrop" role="presentation">
    <section
      className="settings-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="dialog-heading">
        <h2 id="settings-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label={t(locale, 'close')}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <label>
        {t(locale, 'language')}
        <select
          value={preferences.locale}
          onChange={(event) =>
            onChange({ ...preferences, locale: event.target.value as Preferences['locale'] })
          }
        >
          {supportedLocales.map((locale) => (
            <option key={locale} value={locale}>
              {localeLabels[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={preferences.reducedMotion}
          onChange={(event) =>
            onChange({ ...preferences, reducedMotion: event.target.checked })
          }
        />
        {t(locale, 'reducedMotion')}
      </label>
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={preferences.soundEnabled}
          onChange={(event) => onChange({ ...preferences, soundEnabled: event.target.checked })}
        />
        {t(locale, 'sound')}
      </label>
    </section>
  </div>
)
