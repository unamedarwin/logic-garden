import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const basePath = '/logic-garden/'
const requiredFiles = [
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'dist/index.html',
  'dist/offline.html',
  'dist/icon-192.svg',
  'dist/icon-512.svg',
]
const missing = requiredFiles.filter((file) => !existsSync(resolve(file)))
if (missing.length > 0) throw new Error(`Falten recursos PWA: ${missing.join(', ')}`)

const manifest = JSON.parse(readFileSync(resolve('dist/manifest.webmanifest'), 'utf8'))
if (
  manifest.display !== 'standalone' ||
  manifest.scope !== basePath ||
  manifest.start_url !== basePath ||
  !Array.isArray(manifest.icons)
) {
  throw new Error('El manifest no té la configuració instal·lable i l’abast esperats.')
}
for (const size of ['192x192', '512x512']) {
  const icon = manifest.icons.find((candidate) => candidate.sizes === size)
  if (!icon || !existsSync(resolve('dist', icon.src))) {
    throw new Error(`El manifest referencia una icona ${size} inexistent.`)
  }
}
if (!manifest.icons.some((icon) => icon.purpose?.includes('maskable'))) {
  throw new Error('El manifest no inclou cap icona maskable.')
}

const indexHtml = readFileSync(resolve('dist/index.html'), 'utf8')
if (!indexHtml.includes(`${basePath}manifest.webmanifest`)) {
  throw new Error('L’HTML no referencia el manifest dins del base path de GitHub Pages.')
}
const localReferences = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((url) => url.startsWith(basePath))
for (const url of localReferences) {
  const path = resolve('dist', url.slice(basePath.length))
  if (!existsSync(path)) throw new Error(`L’HTML referencia un recurs inexistent: ${url}`)
}

const serviceWorker = readFileSync(resolve('dist/sw.js'), 'utf8')
if (!serviceWorker.includes('precacheAndRoute')) {
  throw new Error('El service worker no inclou la precàrrega essencial.')
}
if (!serviceWorker.includes('skipWaiting') || !serviceWorker.includes('clientsClaim')) {
  throw new Error('El service worker no activa automàticament les versions noves.')
}
if (
  !serviceWorker.includes('cleanupOutdatedCaches') ||
  !serviceWorker.includes(`createHandlerBoundToURL("${basePath}index.html")`)
) {
  throw new Error(
    'El service worker no neteja cachés antics o no té el fallback de navegació correcte.',
  )
}

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
const distPath = resolve('dist')
const distFiles = walk(distPath)
const forbidden = distFiles.filter((path) => /\.(?:ts|tsx|map)$/i.test(path))
if (forbidden.length > 0) {
  throw new Error(
    `Dist conté fonts o source maps: ${forbidden.map((path) => relative(distPath, path)).join(', ')}`,
  )
}
const leakedSecret = distFiles.find((path) => readFileSync(path).includes('ghp_'))
if (leakedSecret)
  throw new Error(`Possible credencial publicada a ${relative(distPath, leakedSecret)}.`)

const precachedUrls = [...serviceWorker.matchAll(/\{url:"([^"]+)"/g)].map((match) => match[1])
const duplicateUrls = [
  ...new Set(precachedUrls.filter((url, index) => precachedUrls.indexOf(url) !== index)),
]
if (duplicateUrls.length > 0) {
  throw new Error(`El precache conté recursos duplicats: ${duplicateUrls.join(', ')}`)
}

const expectedPrecache = distFiles
  .map((path) => relative(distPath, path).replaceAll('\\', '/'))
  .filter(
    (path) =>
      /\.(?:html|js|css|svg|webmanifest)$/.test(path) &&
      path !== 'sw.js' &&
      !/^workbox-[\w-]+\.js$/u.test(path),
  )
const missingFromPrecache = expectedPrecache.filter((path) => !precachedUrls.includes(path))
if (missingFromPrecache.length > 0) {
  throw new Error(`Recursos offline absents del precache: ${missingFromPrecache.join(', ')}`)
}

console.log(
  `PWA validada: ${precachedUrls.length} recursos offline únics, manifest instal·lable i fallback ${basePath}.`,
)
