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

      // A subtle movement grid is retained, but it is no longer the visual plan.
      for (let column = 1; column < columns; column += 1) {
        const x = column * cellWidth
        graphic
          .moveTo(x, 0)
          .lineTo(x, height)
          .stroke({ color: visual.wall, width: 1, alpha: audience === 'adults' ? 0.24 : 0.18 })
      }
      for (let row = 1; row < rows; row += 1) {
        const y = row * cellHeight
        graphic
          .moveTo(0, y)
          .lineTo(width, y)
          .stroke({ color: visual.wall, width: 1, alpha: audience === 'adults' ? 0.24 : 0.18 })
      }

      for (const position of positions) {
        const x = position.column * cellWidth
        const y = position.row * cellHeight
        if (position.blocked) {
          const inset = Math.max(2, Math.min(cellWidth, cellHeight) * 0.14)
          const kind = (position.row + position.column * 2) % 3
          const centerX = x + cellWidth / 2
          const centerY = y + cellHeight / 2
          if (audience === 'teens' && kind === 0) {
            graphic
              .circle(centerX, centerY, Math.min(cellWidth, cellHeight) * 0.37)
              .fill({ color: visual.obstacle, alpha: 0.98 })
              .stroke({ color: visual.wall, width: 1.5, alpha: 0.96 })
            graphic
              .circle(centerX, centerY, Math.min(cellWidth, cellHeight) * 0.12)
              .fill({ color: visual.crossed, alpha: 0.96 })
          } else if (audience === 'adults' && kind === 0) {
            graphic
              .circle(centerX, centerY, Math.min(cellWidth, cellHeight) * 0.32)
              .fill({ color: visual.obstacle, alpha: 0.96 })
              .stroke({ color: visual.wall, width: 1.3, alpha: 0.95 })
            graphic
              .circle(centerX, centerY, Math.min(cellWidth, cellHeight) * 0.17)
              .fill({ color: visual.rooms[3]!, alpha: 1 })
          } else if (kind === 1) {
            graphic
              .roundRect(
                x + inset,
                y + inset,
                cellWidth - inset * 2,
                cellHeight - inset * 2,
                inset,
              )
              .fill({ color: visual.obstacle, alpha: 0.98 })
              .stroke({ color: visual.wall, width: 1.5, alpha: 0.96 })
            graphic
              .moveTo(x + inset * 1.5, centerY)
              .lineTo(x + cellWidth - inset * 1.5, centerY)
              .stroke({ color: visual.wall, width: 1.2, alpha: 0.8 })
          } else {
            const radius = Math.min(cellWidth, cellHeight) * 0.38
            graphic
              .poly(
                [
                  centerX,
                  centerY - radius,
                  centerX + radius * 0.86,
                  centerY - radius * 0.48,
                  centerX + radius * 0.86,
                  centerY + radius * 0.48,
                  centerX,
                  centerY + radius,
                  centerX - radius * 0.86,
                  centerY + radius * 0.48,
                  centerX - radius * 0.86,
                  centerY - radius * 0.48,
                ],
                true,
              )
              .fill({ color: visual.obstacle, alpha: 0.98 })
              .stroke({ color: visual.wall, width: 1.4, alpha: 0.95 })
          }
          continue
        }
        const crossed =
          !assigned.has(position.id) &&
          (occupiedRows.has(position.row) || occupiedColumns.has(position.column))
        if (crossed) {
          graphic
            .roundRect(
              x + 2,
              y + 2,
              cellWidth - 4,
              cellHeight - 4,
              Math.max(2, cellWidth * 0.08),
            )
            .fill({ color: visual.corridor, alpha: audience === 'adults' ? 0.48 : 0.56 })
          graphic
            .moveTo(x + cellWidth * 0.25, y + cellHeight * 0.25)
            .lineTo(x + cellWidth * 0.75, y + cellHeight * 0.75)
            .moveTo(x + cellWidth * 0.75, y + cellHeight * 0.25)
            .lineTo(x + cellWidth * 0.25, y + cellHeight * 0.75)
            .stroke({
              color: visual.crossed,
              width: Math.max(1.4, cellWidth * 0.06),
              alpha: 0.82,
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
