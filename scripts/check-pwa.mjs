import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const requiredFiles = ['dist/manifest.webmanifest', 'dist/sw.js', 'dist/index.html']
const missing = requiredFiles.filter((file) => !existsSync(resolve(file)))
if (missing.length > 0) throw new Error(`Falten recursos PWA: ${missing.join(', ')}`)

const manifest = JSON.parse(readFileSync(resolve('dist/manifest.webmanifest'), 'utf8'))
if (manifest.display !== 'standalone' || manifest.icons?.length < 2) {
  throw new Error('El manifest no té la configuració instal·lable esperada.')
}

const serviceWorker = readFileSync(resolve('dist/sw.js'), 'utf8')
if (!serviceWorker.includes('precacheAndRoute')) {
  throw new Error('El service worker no inclou la precàrrega essencial.')
}
if (!serviceWorker.includes('skipWaiting') || !serviceWorker.includes('clientsClaim')) {
  throw new Error('El service worker no activa automàticament les versions noves.')
}

console.log('PWA validada: manifest, service worker i precàrrega presents.')
