import { useEffect, useRef } from 'react'
import type { Audience, CharacterId, Position, PositionId } from '../domain/types'

interface LogicGridArtworkProps {
  readonly audience: Audience
  readonly positions: readonly Position[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
}

interface FloorPlanStyle {
  readonly floor: number
  readonly wall: number
  readonly ink: number
  readonly blocked: number
  readonly rooms: readonly number[]
}

const floorPlans: Record<Exclude<Audience, 'children'>, FloorPlanStyle> = {
  teens: {
    floor: 0x18162c,
    wall: 0xf8f0dd,
    ink: 0x121522,
    blocked: 0xf8f0dd,
    rooms: [0x6437a5, 0x2867c7, 0xdc4f91, 0xe78b30, 0x1d9b83, 0xc94657],
  },
  adults: {
    floor: 0xf7f3ea,
    wall: 0xfffcf5,
    ink: 0x59645f,
    blocked: 0xb36453,
    rooms: [0xe1cfac, 0xc9d9d1, 0xd9c5b2, 0xd5dcc4, 0xddc9cf, 0xc9d9c7],
  },
}

const irregularRoom = (
  x: number,
  y: number,
  width: number,
  height: number,
  inset: number,
  variant: number,
) => {
  const left = x + inset
  const top = y + inset
  const right = x + width - inset
  const bottom = y + height - inset
  const corner = Math.min(width, height) * 0.13

  switch (variant % 4) {
    case 0:
      return [
        left + corner,
        top,
        right - corner * 0.35,
        top,
        right,
        top + corner,
        right - corner * 0.18,
        bottom - corner,
        right - corner,
        bottom,
        left + corner * 0.45,
        bottom - corner * 0.15,
        left,
        bottom - corner,
        left,
        top + corner * 0.7,
      ]
    case 1:
      return [
        left,
        top + corner * 0.65,
        left + corner,
        top,
        right - corner * 0.6,
        top + corner * 0.12,
        right,
        top + corner,
        right - corner * 0.1,
        bottom - corner * 0.5,
        right - corner,
        bottom,
        left + corner * 0.2,
        bottom,
        left + corner * 0.28,
        bottom - corner,
      ]
    case 2:
      return [
        left + corner * 0.55,
        top,
        right - corner,
        top,
        right,
        top + corner * 0.72,
        right - corner * 0.12,
        bottom - corner * 0.25,
        right - corner * 0.7,
        bottom,
        left + corner,
        bottom - corner * 0.2,
        left,
        bottom - corner,
        left + corner * 0.12,
        top + corner,
      ]
    default:
      return [
        left + corner,
        top + corner * 0.1,
        right - corner * 0.25,
        top,
        right,
        top + corner * 0.75,
        right - corner,
        bottom - corner * 0.1,
        right - corner * 0.28,
        bottom,
        left + corner * 0.52,
        bottom - corner * 0.12,
        left,
        bottom - corner,
        left + corner * 0.15,
        top + corner,
      ]
  }
}

export const LogicGridArtwork = ({
  audience,
  positions,
  assignments,
}: LogicGridArtworkProps) => {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || audience === 'children') return

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
      const placed = positions.filter((position) =>
        Object.values(assignments).includes(position.id),
      )
      const occupiedRows = new Set(placed.map((position) => position.row))
      const occupiedColumns = new Set(placed.map((position) => position.column))
      const floorPlan = floorPlans[audience]
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
      const inset = audience === 'adults' ? 3 : 2
      const roomRadius = audience === 'adults' ? 9 : 5

      graphic.roundRect(0, 0, width, height, roomRadius + 4).fill({ color: floorPlan.floor })

      for (const position of positions) {
        const x = position.column * cellWidth
        const y = position.row * cellHeight
        const color = floorPlan.rooms[position.column % floorPlan.rooms.length]!
        const crossed =
          !placed.some((candidate) => candidate.id === position.id) &&
          (occupiedRows.has(position.row) || occupiedColumns.has(position.column))

        graphic
          .poly(
            irregularRoom(
              x,
              y,
              cellWidth,
              cellHeight,
              inset,
              position.row * columns + position.column,
            ),
            true,
          )
          .fill({ color, alpha: crossed ? 0.18 : audience === 'adults' ? 0.94 : 0.58 })
          .stroke({
            color: floorPlan.ink,
            width: audience === 'adults' ? 1.25 : 2,
            alpha: audience === 'adults' ? 0.68 : 1,
            pixelLine: audience === 'teens',
          })

        // Floor marks make each cell feel like a place rather than a spreadsheet cell.
        if (!crossed) {
          const furnishingWidth = Math.max(14, cellWidth * 0.48)
          const furnishingHeight = Math.max(4, cellHeight * 0.08)
          const furnishingX = x + (cellWidth - furnishingWidth) / 2
          const furnishingY = y + cellHeight * (position.row === 0 ? 0.72 : 0.3)
          graphic
            .roundRect(
              furnishingX,
              furnishingY,
              furnishingWidth,
              furnishingHeight,
              furnishingHeight,
            )
            .fill({ color: floorPlan.wall, alpha: audience === 'adults' ? 0.54 : 0.28 })
        }

        if (crossed) {
          graphic
            .poly(
              irregularRoom(
                x,
                y,
                cellWidth,
                cellHeight,
                inset,
                position.row * columns + position.column,
              ),
              true,
            )
            .fill({ color: floorPlan.floor, alpha: audience === 'adults' ? 0.66 : 0.56 })
          graphic
            .moveTo(x + 7, y + cellHeight - 7)
            .lineTo(x + cellWidth - 7, y + 7)
            .stroke({
              color: floorPlan.blocked,
              width: audience === 'adults' ? 2.5 : 2,
              alpha: audience === 'adults' ? 0.72 : 0.9,
              pixelLine: audience === 'teens',
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
  }, [assignments, audience, positions])

  return <div ref={hostRef} className="logic-grid-artwork" aria-hidden="true" />
}
