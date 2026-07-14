import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const cssPath = resolve(process.cwd(), 'src/styles/globals.css')
const css = readFileSync(cssPath, 'utf8')

const ruleBody = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'u'))?.[1] ?? ''
}

describe('mobile accessibility styles', () => {
  it('keeps clue navigation and elevator controls at least 44px', () => {
    expect(ruleBody('.character-clue-rail__navigation button')).toMatch(/width:\s*44px/u)
    expect(ruleBody('.character-clue-rail__navigation button')).toMatch(/height:\s*44px/u)
    expect(ruleBody('.logic-cube__elevator-direction')).toMatch(/min-width:\s*44px/u)
    expect(ruleBody('.logic-cube__elevator-direction')).toMatch(/min-height:\s*44px/u)
    expect(ruleBody('.logic-cube__layer')).toMatch(/min-width:\s*44px/u)
    expect(ruleBody('.logic-cube__layer')).toMatch(/min-height:\s*44px/u)
  })

  it('keeps the variable-height elevator on one horizontally scrollable line', () => {
    const layers = ruleBody('.logic-cube__layers')
    expect(layers).toMatch(/display:\s*flex/u)
    expect(layers).toMatch(/overflow-x:\s*auto/u)
    expect(layers).toMatch(/scroll-snap-type:\s*inline mandatory/u)
    expect(ruleBody('.logic-cube__layer')).toMatch(/flex:\s*0 0 44px/u)
  })

  it('keeps every mobile action in the same seven-column row', () => {
    expect(css).toMatch(
      /@media \(max-width: 540px\)[\s\S]*?\.game-screen \.game-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(7, minmax\(0, 1fr\)\)[\s\S]*?\.game-screen \.game-actions__primary \.button\s*\{\s*grid-column:\s*auto;/u,
    )
  })
})
