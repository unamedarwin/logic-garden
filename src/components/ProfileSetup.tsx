import { useState } from 'react'
import { avatarOptions, defaultProfile, type PlayerProfile } from '../domain/profile'
import {
  audienceDescription,
  audienceLabel,
  localeLabels,
  supportedLocales,
  t,
} from '../domain/i18n'
import type { Audience, Locale } from '../domain/types'

interface ProfileSetupProps {
  readonly profile: PlayerProfile | null
  readonly locale: Locale
  readonly onLocaleChange: (locale: Locale) => void
  readonly onSave: (profile: PlayerProfile) => void
}

const audiences: readonly Audience[] = ['children', 'teens', 'adults']

export const ProfileSetup = ({
  profile,
  locale,
  onLocaleChange,
  onSave,
}: ProfileSetupProps) => {
  const initial = profile ?? defaultProfile
  const [name, setName] = useState(initial.name)
  const [audience, setAudience] = useState<Audience>(initial.audience)
  const [avatar, setAvatar] = useState(initial.avatar)
  const canContinue = name.trim().length > 0

  return (
    <main className={`profile-setup audience--${audience}`}>
      <section className="profile-setup__card">
        <p className="eyebrow">{t(locale, 'profileEyebrow')}</p>
        <h1>{t(locale, 'profileTitle')}</h1>
        <p className="profile-setup__description">{t(locale, 'profileDescription')}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!canContinue) return
            onSave({ schemaVersion: 1, name: name.trim(), audience, avatar })
          }}
        >
          <label className="profile-setup__language">
            {t(locale, 'language')}
            <select
              value={locale}
              onChange={(event) => onLocaleChange(event.target.value as Locale)}
            >
              {supportedLocales.map((option) => (
                <option key={option} value={option}>
                  {localeLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="profile-setup__audiences">
            <legend>{t(locale, 'audience')}</legend>
            {audiences.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  audience === option
                    ? 'profile-choice profile-choice--selected'
                    : 'profile-choice'
                }
                aria-pressed={audience === option}
                onClick={() => setAudience(option)}
              >
                <strong>{audienceLabel(locale, option)}</strong>
                <span>{audienceDescription(locale, option)}</span>
              </button>
            ))}
          </fieldset>
          <label className="profile-setup__name">
            {t(locale, 'profileName')}
            <input
              value={name}
              maxLength={24}
              placeholder={t(locale, 'profileNamePlaceholder')}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <fieldset className="profile-setup__avatars">
            <legend>{t(locale, 'avatar')}</legend>
            <div>
              {avatarOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  className={
                    avatar === option.id
                      ? 'avatar-choice avatar-choice--selected'
                      : 'avatar-choice'
                  }
                  aria-label={`${t(locale, 'avatar')} ${index + 1}`}
                  aria-pressed={avatar === option.id}
                  onClick={() => setAvatar(option.id)}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="button button--large" disabled={!canContinue}>
            {profile ? t(locale, 'saveProfile') : t(locale, 'continue')}
          </button>
        </form>
      </section>
    </main>
  )
}
