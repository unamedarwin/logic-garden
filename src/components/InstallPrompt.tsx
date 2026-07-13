import { useState, useSyncExternalStore } from 'react'
import { installPromptCopy } from '../domain/i18n'
import type { Locale } from '../domain/types'
import {
  clearInstallPromptEvent,
  consumeInstallPromptEvent,
  getInstallPromptEvent,
  subscribeToInstallPromptEvent,
} from './installPromptEventStore'

interface InstallPromptProps {
  readonly label: string
  readonly locale: Locale
  readonly prominent?: boolean
}

const dismissedKey = 'logic-garden:install-prompt:v1'

const rememberDismissal = () => {
  try {
    localStorage.setItem(dismissedKey, 'dismissed')
  } catch {
    // Dismissal persistence is optional in private browsing.
  }
}

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
  const event = useSyncExternalStore(
    subscribeToInstallPromptEvent,
    getInstallPromptEvent,
    getInstallPromptEvent,
  )
  const [dismissed, setDismissed] = useState(wasDismissed)

  const userAgent = navigator.userAgent
  const ios = /iPad|iPhone|iPod/iu.test(userAgent)
  const android = /Android/iu.test(userAgent)
  if (dismissed || isStandalone() || (!event && !ios && !android)) return null
  const copy = installPromptCopy(locale)
  const dismiss = () => {
    clearInstallPromptEvent()
    rememberDismissal()
    setDismissed(true)
  }
  const install = async () => {
    if (!event || !consumeInstallPromptEvent(event)) return
    try {
      await event.prompt()
      const { outcome } = await event.userChoice
      if (outcome === 'accepted') {
        rememberDismissal()
        setDismissed(true)
      }
    } catch {
      // A failed native prompt cannot be invoked again with the same event.
    }
  }

  return (
    <aside className={`install-prompt ${prominent ? 'install-prompt--prominent' : ''}`}>
      <div>
        <strong>{copy.title}</strong>
        <span>{ios ? copy.ios : copy.android}</span>
      </div>
      <div className="install-prompt__actions">
        {event && (
          <button type="button" className="button" onClick={() => void install()}>
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
