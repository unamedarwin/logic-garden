import { registerSW } from 'virtual:pwa-register'

export interface ServiceWorkerCallbacks {
  readonly onNeedRefresh: () => void
  readonly onOfflineReady: () => void
}

export const registerServiceWorker = ({
  onNeedRefresh,
  onOfflineReady,
}: ServiceWorkerCallbacks) => registerSW({ onNeedRefresh, onOfflineReady })
