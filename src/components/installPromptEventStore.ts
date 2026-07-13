export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = () => void

let retainedEvent: InstallPromptEvent | null = null
const listeners = new Set<Listener>()

const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

const retainInstallPromptEvent = (event: Event) => {
  event.preventDefault()
  retainedEvent = event as InstallPromptEvent
  notifyListeners()
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', retainInstallPromptEvent)
}

export const getInstallPromptEvent = () => retainedEvent

export const subscribeToInstallPromptEvent = (listener: Listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const consumeInstallPromptEvent = (event: InstallPromptEvent) => {
  if (retainedEvent !== event) return false
  retainedEvent = null
  notifyListeners()
  return true
}

export const clearInstallPromptEvent = () => {
  if (!retainedEvent) return
  retainedEvent = null
  notifyListeners()
}
