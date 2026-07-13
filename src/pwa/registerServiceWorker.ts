import { registerSW } from 'virtual:pwa-register'

export interface ServiceWorkerCallbacks {
  readonly onOfflineReady: () => void
}

export interface ServiceWorkerHandle {
  readonly dispose: () => void
}

export const registerServiceWorker = ({
  onOfflineReady,
}: ServiceWorkerCallbacks): ServiceWorkerHandle => {
  let registration: ServiceWorkerRegistration | undefined
  const checkForUpdate = () => {
    if (document.visibilityState === 'visible') void registration?.update()
  }

  registerSW({
    immediate: true,
    onOfflineReady,
    onRegisteredSW: (_url, nextRegistration) => {
      registration = nextRegistration
      checkForUpdate()
    },
  })
  window.addEventListener('focus', checkForUpdate)
  document.addEventListener('visibilitychange', checkForUpdate)

  return {
    dispose: () => {
      window.removeEventListener('focus', checkForUpdate)
      document.removeEventListener('visibilitychange', checkForUpdate)
    },
  }
}
