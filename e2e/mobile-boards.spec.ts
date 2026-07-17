import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

type Collection = 'Aventures il·lustrades' | 'Puzzles 2D' | 'Puzzles 3D'

interface StartGameOptions {
  readonly difficulty?: RegExp
  readonly buildingPlacement?: RegExp
}

const chooseRadio = async (radio: Locator) => {
  await radio.focus()
  await radio.press('Space')
  await expect(radio).toBeChecked()
}

const startGame = async (
  page: Page,
  collection: Collection,
  sizeLabel: RegExp,
  options: StartGameOptions = {},
) => {
  await page.goto('./')
  await chooseRadio(page.getByRole('radio', { name: new RegExp(`^${collection}`, 'u') }))
  await page.getByRole('button', { name: 'Pas següent' }).click()
  if (collection === 'Puzzles 3D') {
    await chooseRadio(
      page.getByRole('radio', {
        name: options.buildingPlacement ?? /^Per estances/u,
      }),
    )
    await page.getByRole('button', { name: 'Pas següent' }).click()
  }
  await chooseRadio(page.getByRole('radio', { name: sizeLabel }))
  await page.getByRole('button', { name: 'Pas següent' }).click()
  await chooseRadio(page.getByRole('radio', { name: options.difficulty ?? /^Difícil/u }))
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

const expectElementCentered = async (element: Locator, container: Locator) => {
  await expect(element).toBeVisible()
  const [elementBox, containerBox] = await Promise.all([
    element.boundingBox(),
    container.boundingBox(),
  ])
  expect(elementBox).not.toBeNull()
  expect(containerBox).not.toBeNull()
  if (!elementBox || !containerBox) return
  expect(
    Math.abs(elementBox.x + elementBox.width / 2 - (containerBox.x + containerBox.width / 2)),
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs(elementBox.y + elementBox.height / 2 - (containerBox.y + containerBox.height / 2)),
  ).toBeLessThanOrEqual(1)
}

const dragWithPointer = async (page: Page, source: Locator, target: Locator) => {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) throw new Error('Expected visible drag source and target')
  const sourceCenter = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  }
  const targetCenter = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height / 2,
  }
  await page.mouse.move(sourceCenter.x, sourceCenter.y)
  await page.mouse.down()
  await page.mouse.move(sourceCenter.x + 12, sourceCenter.y - 12, { steps: 3 })
  await page.mouse.move(targetCenter.x, targetCenter.y, { steps: 12 })
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

test('Setup journey remains visible while the first collection step scrolls', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 393, height: 852 })
  await page.goto('./')
  const journey = page.locator('.home-screen > .journey-path')
  await page.getByRole('radio', { name: /^Puzzles 3D/u }).scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'auto' }))

  await expect(journey).toBeVisible()
  await expect(journey.getByRole('button', { name: /Tipus/u })).toHaveAttribute(
    'aria-current',
    'step',
  )
  const geometry = await journey.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return {
      top: bounds.top,
      bottom: bounds.bottom,
      viewportHeight: window.innerHeight,
      position: getComputedStyle(element).position,
    }
  })
  expect(geometry.position).toBe('sticky')
  expect(geometry.top).toBeGreaterThanOrEqual(0)
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight)
  await expectNoDocumentOverflow(page)
  await saveEvidence(page, testInfo, 'setup-sticky-journey')
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
    await expect(page.locator('.objective-line')).toContainText(
      /records|versions|pista|història/u,
    )
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
  await expect(page.locator('.illustrated-story-premise')).toBeVisible()
  await expect(page.locator('.illustrated-story-premise')).not.toBeEmpty()
  await page.locator('.character-clue-rail__people').scrollIntoViewIfNeeded()
  await expectContextAboveActions(page)
  await expect(page.locator('.character-clue-rail__story-progress')).toHaveAttribute(
    'data-story-stage',
    'opening',
  )
  await page.locator('.character-clue-rail__person').last().click()
  await expect(page.locator('.character-clue-rail__clue').first()).toBeVisible()
  await expect(page.locator('.character-clue-rail__story-beat')).toHaveCount(0)
  await expectContextAboveActions(page)
  await page.locator('.location-cell__target').first().click()
  await expect(page.locator('.character-clue-rail__story-progress')).toHaveAttribute(
    'data-story-stage',
    'gathering',
  )
  await expectContextAboveActions(page)
  await page.locator('.clue-panel > summary').click()
  const lastCompleteClue = page.locator('.clue-panel li').last()
  await lastCompleteClue.scrollIntoViewIfNeeded()
  const completeClueClearance = await page.evaluate(() => {
    const clue = document.querySelector<HTMLElement>('.clue-panel li:last-child')
    const actions = document.querySelector<HTMLElement>('.game-actions')
    if (!clue || !actions) return Number.POSITIVE_INFINITY
    return clue.getBoundingClientRect().bottom - actions.getBoundingClientRect().top
  })
  expect(completeClueClearance).toBeLessThanOrEqual(-8)
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

for (const tablet of [
  { name: 'portrait', width: 820, height: 1180 },
  { name: 'landscape', width: 1180, height: 820 },
] as const) {
  test(`Tablet ${tablet.name} keeps 2D placements centered`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: tablet.width, height: tablet.height })

    await startGame(page, 'Puzzles 2D', /16×16/u)
    const gridBoard = page.locator('.game-board--logic-grid')
    await expect(gridBoard).toHaveAttribute('data-grid-size', '16')
    await expectNoDocumentOverflow(page)
    await expectFitBoard(page)
    await page.locator('.character-clue-rail__person').first().click()
    const gridDestination = gridBoard
      .locator('.location-cell:not(.location-cell--blocked)')
      .first()
    await gridDestination.locator('.location-cell__target').click()
    await expectCentered(gridDestination.locator('.character-token'), gridDestination)
    await saveEvidence(page, testInfo, `tablet-${tablet.name}-2d-placed`)
  })

  test(`Tablet ${tablet.name} keeps 3D placements centered`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: tablet.width, height: tablet.height })
    await startGame(page, 'Puzzles 3D', /^10 plantes/u)
    const cube = page.locator('.logic-cube')
    await expect(cube).toHaveAttribute('data-grid-depth', '10')
    await expect(cube.getByRole('tab')).toHaveCount(10)
    await expectNoDocumentOverflow(page)
    await expectFitBoard(page)
    await page.locator('.character-clue-rail__person').first().click()
    const room = cube.locator('[data-room-target]').first()
    await room.locator('.logic-cube__room-button').click()
    await expectElementCentered(room.locator('.character-token'), room)
    await saveEvidence(page, testInfo, `tablet-${tablet.name}-3d-placed`)
  })
}

test('3D easy entry supports room drag, check feedback, and an explicit hint', async ({
  page,
}, testInfo) => {
  await startGame(page, 'Puzzles 3D', /^3 plantes · recomanat$/u, {
    difficulty: /^Per començar/u,
  })
  const cube = page.locator('.logic-cube')
  await expect(page.locator('.adventure-banner__title div > p:not(.eyebrow)')).toContainText(
    /Residents i botiguers/u,
  )
  await expect(page.locator('.objective-line')).toContainText(/llar o botiga/u)
  await expect(cube.getByRole('group', { name: /Primer pis/u })).toBeVisible()
  await expect(cube.getByRole('grid')).toHaveCount(0)
  await expect(page.locator('.character-clue-rail__clue').first()).toContainText('«')

  const person = page.locator('.character-clue-rail__person').first()
  const room = cube.locator('[data-room-target]').first()
  await dragWithPointer(page, person, room)
  await expect(room.locator('.logic-cube__room-preview')).toBeVisible()
  await page.mouse.up()
  await expect(room.locator('.character-token')).toBeVisible()
  await expectElementCentered(room.locator('.character-token'), room)

  await page.getByRole('button', { name: 'Comprovar' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText(/Encara|Gairebé/u)
  await page.getByRole('button', { name: 'Continua jugant' }).click()
  const placedBeforeHint = await page.locator('.character-clue-rail__person--placed').count()
  await page.getByRole('button', { name: 'Pista', exact: true }).click()
  await expect(page.locator('.character-clue-rail__person--placed')).toHaveCount(
    placedBeforeHint + 1,
  )
  await expectNoDocumentOverflow(page)
  await saveEvidence(page, testInfo, 'logic-cube-3-easy-hint')
})

test('3D advanced cell mode remains playable and persists a free-cell hypothesis', async ({
  page,
}, testInfo) => {
  await startGame(page, 'Puzzles 3D', /^3 plantes · recomanat$/u, {
    difficulty: /^Per començar/u,
    buildingPlacement: /^Per caselles/u,
  })
  const cube = page.locator('.logic-cube')
  await expect(cube.getByRole('grid', { name: /Primer pis/u })).toBeVisible()
  await expect(cube.getByRole('gridcell')).toHaveCount(25)
  await page.locator('.character-clue-rail__person').first().click()
  const destination = cube.locator('.location-cell__target:not(:disabled)').first()
  await destination.click()
  await expect(cube.locator('.character-token')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.game-screen')).toBeVisible()
  await expect(page.locator('.logic-cube .character-token')).toHaveCount(1)
  await expectNoDocumentOverflow(page)
  await saveEvidence(page, testInfo, 'logic-cube-3-cell-mode-restored')
})

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
      await expect(cube.locator('[data-room-target]')).toHaveCount(layer === 0 ? 2 : 4)
      const walls = await cube.locator('.logic-cube__wall').evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect()
          return { width: box.width, height: box.height }
        }),
      )
      expect(walls.every((wall) => wall.width >= 2 || wall.height >= 2)).toBe(true)
      const geometry = await cube.locator('.logic-cube__surface').evaluate((surface) => {
        const box = (element: Element) => {
          const bounds = element.getBoundingClientRect()
          return {
            left: bounds.left,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            width: bounds.width,
            height: bounds.height,
          }
        }
        const surfaceBox = box(surface)
        const cellLayer = surface.querySelector('.game-board__cells')
        const targetLayer = surface.querySelector('.logic-cube__room-targets')
        const targets = Array.from(
          surface.querySelectorAll<HTMLElement>('[data-room-target]'),
        ).map((target) => ({
          id: target.dataset.roomTarget,
          box: box(target),
          button: box(target.querySelector('.logic-cube__room-button')!),
        }))
        const furniture = Array.from(
          surface.querySelectorAll<HTMLElement>('.logic-cube__furniture'),
        ).map((item) => ({
          item: box(item),
          cell: box(item.closest('.logic-cube__cell')!),
        }))
        const doors = Array.from(
          surface.querySelectorAll<HTMLElement>('.logic-cube__door'),
        ).map((door) => ({ box: box(door), transform: getComputedStyle(door).transform }))
        const labels = Array.from(
          surface.querySelectorAll<HTMLElement>('.logic-cube__zone-label'),
        ).map((label) => ({
          box: box(label),
          fontSize: Number.parseFloat(getComputedStyle(label).fontSize),
          text: label.textContent,
          horizontalClip: label.scrollWidth - label.clientWidth,
          verticalClip: label.scrollHeight - label.clientHeight,
        }))
        return {
          surface: surfaceBox,
          cellLayer: cellLayer ? box(cellLayer) : null,
          targetLayer: targetLayer ? box(targetLayer) : null,
          targets,
          furniture,
          doors,
          labels,
        }
      })
      expect(geometry.targetLayer).toEqual(geometry.cellLayer)
      if (!geometry.cellLayer) throw new Error('Expected the interior cell layer')
      for (const target of geometry.targets) {
        expect(target.box.left).toBeGreaterThanOrEqual(geometry.cellLayer.left - 1)
        expect(target.box.top).toBeGreaterThanOrEqual(geometry.cellLayer.top - 1)
        expect(target.box.right).toBeLessThanOrEqual(geometry.cellLayer.right + 1)
        expect(target.box.bottom).toBeLessThanOrEqual(geometry.cellLayer.bottom + 1)
        expect(
          Math.abs(
            target.button.left +
              target.button.width / 2 -
              (target.box.left + target.box.width / 2),
          ),
        ).toBeLessThanOrEqual(1)
        expect(
          Math.abs(
            target.button.top +
              target.button.height / 2 -
              (target.box.top + target.box.height / 2),
          ),
        ).toBeLessThanOrEqual(1)
        expect(target.button.left - target.box.left).toBeLessThanOrEqual(3.5)
      }
      for (let first = 0; first < geometry.targets.length; first += 1) {
        for (let second = first + 1; second < geometry.targets.length; second += 1) {
          const a = geometry.targets[first]!.box
          const b = geometry.targets[second]!.box
          const overlap =
            Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
          expect(
            overlap,
            `${geometry.targets[first]!.id}/${geometry.targets[second]!.id}`,
          ).toBe(false)
        }
      }
      for (const { item, cell } of geometry.furniture) {
        expect(
          Math.abs(item.left + item.width / 2 - (cell.left + cell.width / 2)),
        ).toBeLessThanOrEqual(1)
        expect(
          Math.abs(item.top + item.height / 2 - (cell.top + cell.height / 2)),
        ).toBeLessThanOrEqual(1)
      }
      for (const door of geometry.doors) {
        expect(door.box.left).toBeGreaterThanOrEqual(geometry.surface.left - door.box.width / 2)
        expect(door.box.top).toBeGreaterThanOrEqual(geometry.surface.top - door.box.height / 2)
        expect(door.box.right).toBeLessThanOrEqual(geometry.surface.right + door.box.width / 2)
        expect(door.box.bottom).toBeLessThanOrEqual(
          geometry.surface.bottom + door.box.height / 2,
        )
        expect(door.transform).toMatch(/^matrix\(1, 0, 0, 1,/u)
      }
      for (const label of geometry.labels) {
        expect(label.fontSize, label.text ?? undefined).toBeGreaterThanOrEqual(8.5)
        expect(label.horizontalClip, label.text ?? undefined).toBeLessThanOrEqual(1)
        expect(label.verticalClip, label.text ?? undefined).toBeLessThanOrEqual(1)
        expect(label.box.left, label.text ?? undefined).toBeGreaterThanOrEqual(
          geometry.surface.left - 1,
        )
        expect(label.box.right, label.text ?? undefined).toBeLessThanOrEqual(
          geometry.surface.right + 1,
        )
        for (const { item } of geometry.furniture) {
          const overlapsFurniture =
            Math.min(label.box.right, item.right) - Math.max(label.box.left, item.left) > 1 &&
            Math.min(label.box.bottom, item.bottom) - Math.max(label.box.top, item.top) > 1
          expect(overlapsFurniture, label.text ?? undefined).toBe(false)
        }
        for (const { box: door } of geometry.doors) {
          const overlapsDoor =
            Math.min(label.box.right, door.right) - Math.max(label.box.left, door.left) > 1 &&
            Math.min(label.box.bottom, door.bottom) - Math.max(label.box.top, door.top) > 1
          expect(overlapsDoor, label.text ?? undefined).toBe(false)
        }
      }
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
    const destination = cube.locator('[data-room-target]').first()
    await destination.locator('.logic-cube__room-button').click()
    const token = destination.locator('.character-token')
    await expect(token).toBeVisible()
    await expectElementCentered(token, destination)
    await expectNoDocumentOverflow(page)
    await saveEvidence(page, testInfo, `logic-cube-${depth}-placed`)
  })
}
