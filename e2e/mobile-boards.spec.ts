import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

type Collection = 'Aventures il·lustrades' | 'Puzzles 2D' | 'Puzzles 3D'

const chooseRadio = async (radio: Locator) => {
  await radio.focus()
  await radio.press('Space')
  await expect(radio).toBeChecked()
}

const startGame = async (page: Page, collection: Collection, sizeLabel: RegExp) => {
  await page.goto('./')
  await chooseRadio(page.getByRole('radio', { name: new RegExp(`^${collection}`, 'u') }))
  await page.getByRole('button', { name: 'Pas següent' }).click()
  await chooseRadio(page.getByRole('radio', { name: sizeLabel }))
  await page.getByRole('button', { name: 'Pas següent' }).click()
  await chooseRadio(page.getByRole('radio', { name: /^Difícil/u }))
  await page.getByRole('button', { name: 'Pas següent' }).click()
  await chooseRadio(page.locator('.adventure-selector input[type="radio"]').first())
  await page.getByRole('button', { name: 'Juga' }).click()
  await expect(page.locator('.game-screen')).toBeVisible()
}

const expectNoDocumentOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }))
  expect(overflow.document).toBeLessThanOrEqual(1)
  expect(overflow.body).toBeLessThanOrEqual(1)
}

const expectFitBoard = async (page: Page) => {
  const dimensions = await page.locator('.game-board-scroll--fit').evaluate((element) => ({
    horizontal: element.scrollWidth - element.clientWidth,
    vertical: element.scrollHeight - element.clientHeight,
    sources: Array.from(element.querySelectorAll<HTMLElement>('*'))
      .map((candidate) => ({
        className: candidate.className,
        horizontal: candidate.scrollWidth - candidate.clientWidth,
        right:
          candidate.getBoundingClientRect().right -
          (element.getBoundingClientRect().left + element.clientWidth),
      }))
      .filter((candidate) => candidate.horizontal > 1 || candidate.right > 1)
      .sort((first, second) => second.right - first.right)
      .slice(0, 8),
  }))
  expect(dimensions.horizontal, JSON.stringify(dimensions.sources)).toBeLessThanOrEqual(1)
  expect(dimensions.vertical).toBeLessThanOrEqual(1)
}

const expectContextAboveActions = async (page: Page) => {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const context = document.querySelector<HTMLElement>('.character-clue-rail__context')
        const actions = document.querySelector<HTMLElement>('.game-actions')
        if (!context || !actions) return Number.POSITIVE_INFINITY
        return context.getBoundingClientRect().bottom - actions.getBoundingClientRect().top
      }),
    )
    .toBeLessThanOrEqual(-8)
}

const expectCentered = async (token: Locator, cell: Locator) => {
  await expect(token).toBeVisible()
  const geometry = await cell.evaluate((element) => {
    const wrapper = element.querySelector<HTMLElement>('.location-cell__token')
    const character = element.querySelector<HTMLElement>('.character-token')
    const box = (candidate: HTMLElement | null) => {
      if (!candidate) return null
      const bounds = candidate.getBoundingClientRect()
      const style = getComputedStyle(candidate)
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        left: style.left,
        right: style.right,
        inset: style.inset,
      }
    }
    return {
      cell: box(element as HTMLElement),
      wrapper: box(wrapper),
      character: box(character),
    }
  })
  const tokenBox = geometry.character
  const cellBox = geometry.cell
  expect(tokenBox).not.toBeNull()
  expect(cellBox).not.toBeNull()
  if (!tokenBox || !cellBox) return
  const tokenCenter = {
    x: tokenBox.x + tokenBox.width / 2,
    y: tokenBox.y + tokenBox.height / 2,
  }
  const cellCenter = {
    x: cellBox.x + cellBox.width / 2,
    y: cellBox.y + cellBox.height / 2,
  }
  expect(Math.abs(tokenCenter.x - cellCenter.x), JSON.stringify(geometry)).toBeLessThanOrEqual(
    1,
  )
  expect(Math.abs(tokenCenter.y - cellCenter.y)).toBeLessThanOrEqual(1)
}

const saveEvidence = async (page: Page, testInfo: TestInfo, name: string) => {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.localStorage.setItem('logic-garden:install-prompt:v1', 'dismissed')
  })
})

for (const size of [4, 6, 8] as const) {
  test(`Children ${size} rooms exposes contextual clues and textured places`, async ({
    page,
  }, testInfo) => {
    await startGame(page, 'Aventures il·lustrades', new RegExp(`${size} amics`, 'u'))
    const board = page.locator('.game-board--child-map')
    const rooms = board.locator('.location-cell')
    await expect(rooms).toHaveCount(size)
    await expect(page.locator('.character-clue-rail__person')).toHaveCount(size)
    await expect(page.locator('.tray-wrap')).toHaveCount(0)

    const roomArtwork = await rooms.evaluateAll((elements) =>
      elements.map((element) => ({
        material: element.getAttribute('data-room-material'),
        backgroundImage: getComputedStyle(element).backgroundImage,
      })),
    )
    expect(roomArtwork.every(({ material }) => Boolean(material))).toBe(true)
    expect(roomArtwork.every(({ backgroundImage }) => backgroundImage !== 'none')).toBe(true)
    expect(new Set(roomArtwork.map(({ material }) => material)).size).toBeGreaterThanOrEqual(3)

    if (size === 8) {
      await page.locator('.character-clue-rail__people').scrollIntoViewIfNeeded()
      await expectContextAboveActions(page)
    }

    await page.locator('.character-clue-rail__person').first().click()
    await expect(page.locator('.objective-line')).toContainText(/misteri/u)
    await expect(page.locator('.character-clue-rail__clue').first()).toHaveAttribute(
      'data-source-clue-id',
      /.+/u,
    )
    const railBounds = await page.locator('.character-clue-rail').evaluate((element) => {
      const people = element.querySelector<HTMLElement>('.character-clue-rail__people')
      const context = element.querySelector<HTMLElement>('.character-clue-rail__context')
      return {
        peopleBottom: people?.getBoundingClientRect().bottom ?? 0,
        contextTop: context?.getBoundingClientRect().top ?? 0,
      }
    })
    expect(railBounds.contextTop).toBeGreaterThanOrEqual(railBounds.peopleBottom - 1)
    await expect(page.locator('.character-clue-rail__clue').first()).toBeVisible()
    await expectContextAboveActions(page)
    await expect(page.locator('.clue-panel')).not.toHaveAttribute('open', '')
    await expectNoDocumentOverflow(page)
    await expectFitBoard(page)
    await saveEvidence(page, testInfo, `children-${size}-empty`)

    const destination = rooms.first()
    await destination.locator('.location-cell__target').click()
    await expect(destination.locator('.character-token')).toBeVisible()
    await expectContextAboveActions(page)
    await expect(destination).toHaveAttribute('data-room-material', /.+/u)
    await saveEvidence(page, testInfo, `children-${size}-placed`)
  })
}

test('Illustrated 8-person story stays clear at the iPhone 16e viewport', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await startGame(page, 'Aventures il·lustrades', /8 amics/u)
  await page.locator('.character-clue-rail__people').scrollIntoViewIfNeeded()
  await expectContextAboveActions(page)
  await page.locator('.character-clue-rail__person').last().click()
  await expect(page.locator('.character-clue-rail__story-beat').first()).toBeVisible()
  await expectContextAboveActions(page)
  await page.locator('.location-cell__target').first().click()
  await expectContextAboveActions(page)
  await expectNoDocumentOverflow(page)
  await saveEvidence(page, testInfo, 'illustrated-8-iphone-16e')
})

for (const size of [6, 9, 16] as const) {
  test(`2D ${size}x${size} fits and centers a placed person`, async ({ page }, testInfo) => {
    await startGame(page, 'Puzzles 2D', new RegExp(`${size}×${size}`, 'u'))
    const board = page.locator('.game-board--logic-grid')
    await expect(board).toHaveAttribute('data-grid-size', String(size))
    await expect(board.locator('.location-cell')).toHaveCount(size * size)
    await expectNoDocumentOverflow(page)
    await expectFitBoard(page)
    await saveEvidence(page, testInfo, `logic-grid-${size}-empty`)

    await page.locator('.character-clue-rail__person').first().click()
    const destination = board.locator('.location-cell:not(.location-cell--blocked)').first()
    await destination.locator('.location-cell__target').click()
    const token = destination.locator('.character-token')
    await expect(token).toBeVisible()
    await expectCentered(token, destination)
    await expectNoDocumentOverflow(page)
    await saveEvidence(page, testInfo, `logic-grid-${size}-placed`)
  })
}

for (const depth of [3, 6, 10] as const) {
  test(`3D ${depth} floors exposes walls and every fitted floor`, async ({
    page,
  }, testInfo) => {
    await startGame(page, 'Puzzles 3D', new RegExp(`^${depth} plantes(?: · recomanat)?$`, 'u'))
    const cube = page.locator('.logic-cube')
    await expect(cube).toHaveAttribute('data-grid-depth', String(depth))
    const floors = cube.getByRole('tab')
    await expect(floors).toHaveCount(depth)

    for (let layer = 0; layer < depth; layer += 1) {
      await floors.nth(layer).click()
      await expect(floors.nth(layer)).toHaveAttribute('aria-selected', 'true')
      await expect(cube.locator('.logic-cube__surface .location-cell')).toHaveCount(25)
      await expect(cube.locator('.logic-cube__wall')).toHaveCount(4)
      const walls = await cube.locator('.logic-cube__wall').evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect()
          return { width: box.width, height: box.height }
        }),
      )
      expect(walls.every((wall) => wall.width >= 2 || wall.height >= 2)).toBe(true)
    }

    const targetSize = await floors.first().boundingBox()
    expect(targetSize?.height ?? 0).toBeGreaterThanOrEqual(44)
    expect(targetSize?.width ?? 0).toBeGreaterThanOrEqual(44)
    const stacking = await cube.evaluate((element) => {
      const wall = element.querySelector<HTMLElement>('.logic-cube__walls')
      const target = element.querySelector<HTMLElement>('.location-cell__target')
      return {
        wall: Number(wall ? getComputedStyle(wall).zIndex : 0),
        target: Number(target ? getComputedStyle(target).zIndex : 0),
      }
    })
    expect(stacking.target).toBeGreaterThan(stacking.wall)
    await expectNoDocumentOverflow(page)
    await expectFitBoard(page)
    await saveEvidence(page, testInfo, `logic-cube-${depth}-empty`)

    await page.locator('.character-clue-rail__person').first().click()
    const destination = cube.locator('.location-cell:not(.location-cell--blocked)').first()
    await destination.locator('.location-cell__target').click()
    const token = destination.locator('.character-token')
    await expect(token).toBeVisible()
    await expectCentered(token, destination)
    await expectNoDocumentOverflow(page)
    await saveEvidence(page, testInfo, `logic-cube-${depth}-placed`)
  })
}
