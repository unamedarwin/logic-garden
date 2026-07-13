import { useEffect, useRef } from 'react'
import type { SpatialPlan } from '../domain/spatialPlan'
import type { Audience, Position, Seed, ThemeId } from '../domain/types'
import { FloorTextureLayer } from './FloorTextureLayer'

interface LogicGridArtworkProps {
  readonly audience: Audience
  readonly plan?: SpatialPlan
  readonly positions: readonly Position[]
  readonly puzzleSeed: Seed
  readonly themeId: ThemeId
}

interface FloorPlanStyle {
  readonly corridor: number
  readonly wall: number
  readonly ink: number
  readonly obstacle: number
  readonly rooms: readonly number[]
}

const floorPlans: Record<Exclude<Audience, 'children'>, FloorPlanStyle> = {
  teens: {
    corridor: 0x19152b,
    wall: 0xf9f0dc,
    ink: 0x120f20,
    obstacle: 0x1e2138,
    rooms: [0x5b39a8, 0x2271c9, 0xe15a91, 0xe98730, 0x198f7d, 0xc74457],
  },
  adults: {
    corridor: 0xe7dfd0,
    wall: 0xfff9ee,
    ink: 0x5e6760,
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
  puzzleSeed,
  themeId,
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
  }, [audience, plan, positions])

  if (audience === 'children' || !plan) return null

  const columns = Math.max(...positions.map((position) => position.column)) + 1
  const rows = Math.max(...positions.map((position) => position.row)) + 1

  return (
    <div className="logic-grid-artwork" aria-hidden="true">
      <div ref={hostRef} className="logic-grid-artwork__canvas-host" />
      <FloorTextureLayer
        plan={plan}
        positions={positions}
        columns={columns}
        rows={rows}
        puzzleSeed={puzzleSeed}
        themeId={themeId}
      />
    </div>
  )
}
