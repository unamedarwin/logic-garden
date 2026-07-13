import { useEffect, useRef } from 'react'
import type { SpatialPlan } from '../domain/spatialPlan'
import type { Audience, CharacterId, Position, PositionId } from '../domain/types'

interface LogicGridArtworkProps {
  readonly audience: Audience
  readonly plan?: SpatialPlan
  readonly positions: readonly Position[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
}

interface FloorPlanStyle {
  readonly corridor: number
  readonly wall: number
  readonly ink: number
  readonly crossed: number
  readonly obstacle: number
  readonly rooms: readonly number[]
}

const floorPlans: Record<Exclude<Audience, 'children'>, FloorPlanStyle> = {
  teens: {
    corridor: 0x19152b,
    wall: 0xf9f0dc,
    ink: 0x120f20,
    crossed: 0xf05287,
    obstacle: 0x1e2138,
    rooms: [0x5b39a8, 0x2271c9, 0xe15a91, 0xe98730, 0x198f7d, 0xc74457],
  },
  adults: {
    corridor: 0xe7dfd0,
    wall: 0xfff9ee,
    ink: 0x5e6760,
    crossed: 0xb06455,
    obstacle: 0x65766b,
    rooms: [0xe3cfab, 0xc4d7cf, 0xdac6b1, 0xd5dec2, 0xdec7ce, 0xc6d7c6],
  },
}

const pathPoints = (
  zones: SpatialPlan['zones'],
  width: number,
  height: number,
  index: number,
) => zones[index]!.path.flatMap((point) => [point.x * width, point.y * height])

export const LogicGridArtwork = ({
  audience,
  plan,
  positions,
  assignments,
}: LogicGridArtworkProps) => {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || audience === 'children' || !plan) return

    let active = true
    let destroy = () => undefined

    const paint = async () => {
      const { Application, Graphics } = await import('pixi.js')
      if (!active) return

      const bounds = host.getBoundingClientRect()
      const width = Math.max(1, Math.round(bounds.width))
      const height = Math.max(1, Math.round(bounds.height))
      const columns = Math.max(...positions.map((position) => position.column)) + 1
      const rows = Math.max(...positions.map((position) => position.row)) + 1
      const assigned = new Set(Object.values(assignments))
      const occupied = positions.filter((position) => assigned.has(position.id))
      const occupiedRows = new Set(occupied.map((position) => position.row))
      const occupiedColumns = new Set(occupied.map((position) => position.column))
      const visual = floorPlans[audience]
      const app = new Application()

      await app.init({
        width,
        height,
        antialias: audience === 'adults',
        autoDensity: true,
        backgroundAlpha: 0,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      })
      if (!active) {
        app.destroy()
        return
      }

      const graphic = new Graphics()
      app.stage.addChild(graphic)
      const cellWidth = width / columns
      const cellHeight = height / rows
      const wallWidth = audience === 'adults' ? 2.7 : 3

      graphic
        .roundRect(0, 0, width, height, Math.max(9, width * 0.025))
        .fill({ color: visual.corridor })
        .stroke({ color: visual.ink, width: wallWidth + 1, alpha: 0.92 })

      plan.zones.forEach((_, index) => {
        graphic
          .poly(pathPoints(plan.zones, width, height, index), true)
          .fill({ color: visual.rooms[index % visual.rooms.length]!, alpha: 0.96 })
          .stroke({
            color: visual.ink,
            width: wallWidth,
            alpha: 0.9,
            pixelLine: audience === 'teens',
          })
      })

      const textureSpacing = Math.max(14, width / 26)
      plan.zones.forEach((_, index) => {
        const texture = new Graphics()
        const mask = new Graphics()
          .poly(pathPoints(plan.zones, width, height, index), true)
          .fill({ color: 0xffffff })
        texture.mask = mask

        for (let row = 0, y = textureSpacing / 2; y < height; row += 1, y += textureSpacing) {
          for (
            let column = 0, x = textureSpacing / 2;
            x < width;
            column += 1, x += textureSpacing
          ) {
            if ((row + column + index) % 3 !== 0) continue
            if (audience === 'adults') {
              const radius = Math.max(0.8, textureSpacing * 0.065)
              texture
                .circle(x, y, radius)
                .fill({ color: visual.ink, alpha: 0.1 + (index % 2) * 0.025 })
              if ((row + index) % 2 === 0) {
                texture
                  .moveTo(x + radius * 2.5, y)
                  .lineTo(x + textureSpacing * 0.34, y)
                  .stroke({ color: visual.ink, width: 1, alpha: 0.07 })
              }
            } else {
              const length = textureSpacing * 0.28
              const vertical = (row + column + index) % 2 === 0
              texture
                .roundRect(
                  x - (vertical ? 1 : length / 2),
                  y - (vertical ? length / 2 : 1),
                  vertical ? 2 : length,
                  vertical ? length : 2,
                  1,
                )
                .fill({ color: visual.wall, alpha: 0.13 })
            }
          }
        }

        app.stage.addChild(texture, mask)
      })

      const overlay = new Graphics()
      app.stage.addChild(overlay)

      // A subtle movement grid is retained, but it is no longer the visual plan.
      for (let column = 1; column < columns; column += 1) {
        const x = column * cellWidth
        overlay
          .moveTo(x, 0)
          .lineTo(x, height)
          .stroke({ color: visual.wall, width: 1, alpha: audience === 'adults' ? 0.24 : 0.18 })
      }
      for (let row = 1; row < rows; row += 1) {
        const y = row * cellHeight
        overlay
          .moveTo(0, y)
          .lineTo(width, y)
          .stroke({ color: visual.wall, width: 1, alpha: audience === 'adults' ? 0.24 : 0.18 })
      }

      for (const position of positions) {
        const x = position.column * cellWidth
        const y = position.row * cellHeight
        if (position.blocked) {
          const inset = Math.max(1, Math.min(cellWidth, cellHeight) * 0.08)
          overlay
            .roundRect(
              x + inset,
              y + inset,
              cellWidth - inset * 2,
              cellHeight - inset * 2,
              Math.max(2, inset),
            )
            .fill({ color: visual.wall, alpha: audience === 'adults' ? 0.38 : 0.22 })
            .stroke({ color: visual.obstacle, width: 1, alpha: 0.36 })
          continue
        }
        const crossed =
          !assigned.has(position.id) &&
          (occupiedRows.has(position.row) || occupiedColumns.has(position.column))
        if (crossed) {
          const crossInset = audience === 'adults' ? 0.34 : 0.31
          const crossEnd = 1 - crossInset
          overlay
            .roundRect(
              x + 2,
              y + 2,
              cellWidth - 4,
              cellHeight - 4,
              Math.max(2, cellWidth * 0.08),
            )
            .fill({ color: visual.corridor, alpha: audience === 'adults' ? 0.28 : 0.38 })
          overlay
            .moveTo(x + cellWidth * crossInset, y + cellHeight * crossInset)
            .lineTo(x + cellWidth * crossEnd, y + cellHeight * crossEnd)
            .moveTo(x + cellWidth * crossEnd, y + cellHeight * crossInset)
            .lineTo(x + cellWidth * crossInset, y + cellHeight * crossEnd)
            .stroke({
              color: visual.crossed,
              width: Math.max(1, Math.min(cellWidth, cellHeight) * 0.045),
              alpha: audience === 'adults' ? 0.52 : 0.62,
            })
        }
      }

      app.canvas.className = 'logic-grid-artwork__canvas'
      app.canvas.setAttribute('aria-hidden', 'true')
      host.replaceChildren(app.canvas)
      destroy = () => {
        app.destroy()
        host.replaceChildren()
      }
    }

    void paint()
    return () => {
      active = false
      destroy()
    }
  }, [assignments, audience, plan, positions])

  return <div ref={hostRef} className="logic-grid-artwork" aria-hidden="true" />
}
