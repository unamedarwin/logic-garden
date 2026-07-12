import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptProps {
  readonly label: string
}

export const InstallPrompt = ({ label }: InstallPromptProps) => {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    const onBeforeInstallPrompt = (nextEvent: Event) => {
      nextEvent.preventDefault()
      setEvent(nextEvent as InstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (!event) return null
  return (
    <button
      type="button"
      className="install-prompt"
      onClick={() => {
        void event.prompt().then(() => setEvent(null))
      }}
    >
      {label}
    </button>
  )
}
