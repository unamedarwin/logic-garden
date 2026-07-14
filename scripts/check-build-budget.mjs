import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const dist = resolve(process.cwd(), 'dist')
const asPath = (path) => path.replaceAll('\\', '/')

const budgets = Object.freeze({
  entryRawBytes: 350_000,
  initialGzipBytes: 215_000,
  largestChunkRawBytes: 450_000,
  allJavaScriptGzipBytes: 500_000,
  allCssRawBytes: 65_000,
  distRawBytes: 2_000_000,
  chunkCount: 32,
})

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })

const bytes = (path) => statSync(path).size
const gzipBytes = (path) => gzipSync(readFileSync(path), { level: 9 }).byteLength
const relativeToDist = (path) => asPath(relative(dist, path))

const findInitialJavaScript = (indexHtml, entryPath) => {
  const initial = new Set([entryPath])
  const preloadPattern = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/g
  for (const match of indexHtml.matchAll(preloadPattern)) {
    initial.add(resolve(dist, match[1].replace(/^\/logic-garden\//, '')))
  }

  const pending = [...initial]
  const staticImportPattern = /\b(?:import|export)\s*(?:[^"']*?\sfrom\s*)?["']([^"']+)["']/g
  while (pending.length > 0) {
    const current = pending.pop()
    if (!current || !existsSync(current)) continue
    const source = readFileSync(current, 'utf8')
    for (const match of source.matchAll(staticImportPattern)) {
      if (!match[1].startsWith('.')) continue
      const dependency = resolve(dirname(current), match[1])
      if (initial.has(dependency)) continue
      initial.add(dependency)
      pending.push(dependency)
    }
  }

  return [...initial].filter((path) => path.endsWith('.js') && existsSync(path))
}

export const collectBuildMetrics = () => {
  if (!existsSync(dist)) throw new Error('No existeix dist. Executa pnpm build primer.')

  const files = walk(dist)
  const indexHtml = readFileSync(resolve(dist, 'index.html'), 'utf8')
  const entryMatch = indexHtml.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/)
  if (!entryMatch) throw new Error("No s'ha trobat el mòdul d'entrada a dist/index.html.")

  const entryPath = resolve(dist, entryMatch[1].replace(/^\/logic-garden\//, ''))
  if (!existsSync(entryPath))
    throw new Error(`No existeix l'entrada compilada ${entryMatch[1]}.`)

  const javascript = files.filter((path) => path.endsWith('.js'))
  const css = files.filter((path) => path.endsWith('.css'))
  const initialJavaScript = findInitialJavaScript(indexHtml, entryPath)
  const largestChunk = javascript.reduce((largest, path) =>
    bytes(path) > bytes(largest) ? path : largest,
  )

  return {
    entry: {
      file: relativeToDist(entryPath),
      rawBytes: bytes(entryPath),
      gzipBytes: gzipBytes(entryPath),
    },
    initialJavaScript: {
      files: initialJavaScript.map(relativeToDist).sort(),
      rawBytes: initialJavaScript.reduce((total, path) => total + bytes(path), 0),
      gzipBytes: initialJavaScript.reduce((total, path) => total + gzipBytes(path), 0),
    },
    largestChunk: {
      file: relativeToDist(largestChunk),
      rawBytes: bytes(largestChunk),
      gzipBytes: gzipBytes(largestChunk),
    },
    allJavaScript: {
      files: javascript.length,
      rawBytes: javascript.reduce((total, path) => total + bytes(path), 0),
      gzipBytes: javascript.reduce((total, path) => total + gzipBytes(path), 0),
    },
    allCss: {
      files: css.length,
      rawBytes: css.reduce((total, path) => total + bytes(path), 0),
      gzipBytes: css.reduce((total, path) => total + gzipBytes(path), 0),
    },
    dist: {
      files: files.length,
      rawBytes: files.reduce((total, path) => total + bytes(path), 0),
    },
  }
}

export const evaluateBuildBudgets = (metrics) =>
  [
    ['entry raw', metrics.entry.rawBytes, budgets.entryRawBytes],
    ['initial JavaScript gzip', metrics.initialJavaScript.gzipBytes, budgets.initialGzipBytes],
    ['largest chunk raw', metrics.largestChunk.rawBytes, budgets.largestChunkRawBytes],
    ['all JavaScript gzip', metrics.allJavaScript.gzipBytes, budgets.allJavaScriptGzipBytes],
    ['all CSS raw', metrics.allCss.rawBytes, budgets.allCssRawBytes],
    ['dist raw', metrics.dist.rawBytes, budgets.distRawBytes],
    ['JavaScript chunk count', metrics.allJavaScript.files, budgets.chunkCount],
  ].map(([name, actual, limit]) => ({ name, actual, limit, passed: actual <= limit }))

const formatKiB = (value) => `${(value / 1024).toFixed(1)} KiB`
const metrics = collectBuildMetrics()
const checks = evaluateBuildBudgets(metrics)

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ budgets, metrics, checks }, null, 2))
} else {
  console.log(
    [
      `Entrada: ${metrics.entry.file} (${formatKiB(metrics.entry.rawBytes)} / ${formatKiB(metrics.entry.gzipBytes)} gzip)`,
      `Graf inicial: ${metrics.initialJavaScript.files.length} chunks (${formatKiB(metrics.initialJavaScript.rawBytes)} / ${formatKiB(metrics.initialJavaScript.gzipBytes)} gzip)`,
      `Chunk màxim: ${metrics.largestChunk.file} (${formatKiB(metrics.largestChunk.rawBytes)})`,
      `JavaScript total: ${metrics.allJavaScript.files} chunks / ${formatKiB(metrics.allJavaScript.gzipBytes)} gzip`,
      `Dist total: ${metrics.dist.files} fitxers / ${formatKiB(metrics.dist.rawBytes)}`,
    ].join('\n'),
  )
}

const failures = checks.filter((check) => !check.passed)
if (failures.length > 0) {
  throw new Error(
    `Pressupost de build excedit:\n${failures
      .map(({ name, actual, limit }) => `- ${name}: ${actual} > ${limit}`)
      .join('\n')}`,
  )
}

console.log('Pressupostos de build validats.')
