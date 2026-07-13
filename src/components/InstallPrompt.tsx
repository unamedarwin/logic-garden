import { useEffect, useState } from 'react'
import { installPromptCopy } from '../domain/i18n'
import type { Locale } from '../domain/types'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptProps {
  readonly label: string
  readonly locale: Locale
  readonly prominent?: boolean
}

const dismissedKey = 'logic-garden:install-prompt:v1'

const wasDismissed = () => {
  try {
    return localStorage.getItem(dismissedKey) === 'dismissed'
  } catch {
    return false
  }
}

const isStandalone = () =>
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches) ||
  Boolean((navigator as Navigator & { readonly standalone?: boolean }).standalone)

export const InstallPrompt = ({ label, locale, prominent = false }: InstallPromptProps) => {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(wasDismissed)

  useEffect(() => {
    const onBeforeInstallPrompt = (nextEvent: Event) => {
      nextEvent.preventDefault()
      setEvent(nextEvent as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  const userAgent = navigator.userAgent
  const ios = /iPad|iPhone|iPod/iu.test(userAgent)
  const android = /Android/iu.test(userAgent)
  if (dismissed || isStandalone() || (!event && !ios && !android)) return null
  const copy = installPromptCopy(locale)
  const dismiss = () => {
    try {
      localStorage.setItem(dismissedKey, 'dismissed')
    } catch {
      // Dismissal persistence is optional in private browsing.
    }
    setDismissed(true)
  }

  return (
    <aside className={`install-prompt ${prominent ? 'install-prompt--prominent' : ''}`}>
      <div>
        <strong>{copy.title}</strong>
        <span>{ios ? copy.ios : copy.android}</span>
      </div>
      <div className="install-prompt__actions">
        {event && (
          <button
            type="button"
            className="button"
            onClick={() => {
              void event
                .prompt()
                .then(() => event.userChoice)
                .then(({ outcome }) => {
                  if (outcome === 'accepted') dismiss()
                  else setEvent(null)
                })
            }}
          >
            {label}
          </button>
        )}
        <button type="button" className="button button--secondary" onClick={dismiss}>
          {copy.dismiss}
        </button>
      </div>
    </aside>
  )
}
