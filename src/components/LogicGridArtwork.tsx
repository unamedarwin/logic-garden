import { useEffect, useRef } from 'react'
import type { Audience, CharacterId, Position, PositionId } from '../domain/types'

interface LogicGridArtworkProps {
  readonly audience: Audience
  readonly positions: readonly Position[]
  readonly assignments: Readonly<Partial<Record<CharacterId, PositionId>>>
}

const palettes: Record<Exclude<Audience, 'children'>, readonly string[]> = {
  teens: ['#6437a5', '#2867c7', '#dc4f91', '#e78b30', '#1d9b83', '#c94657'],
  adults: ['#84715a', '#476878', '#9b694a', '#7b8060', '#866573', '#47615b'],
}

const zoneIcons: Record<Exclude<Audience, 'children'>, readonly string[]> = {
  teens: ['🎧', '⚽', '🛹', '🎨', '🎹', '📸'],
  adults: ['📚', '🪴', '☕', '🏺', '🧺', '🗂️'],
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
      const { Application, Graphics, Text } = await import('pixi.js')
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
      const palette = palettes[audience]
      const icons = zoneIcons[audience]
      const app = new Application()

      await app.init({
        width,
        height,
        antialias: false,
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
      for (const position of positions) {
        const x = position.column * cellWidth
        const y = position.row * cellHeight
        const color = palette[position.column % palette.length]!
        const crossed =
          !placed.some((candidate) => candidate.id === position.id) &&
          (occupiedRows.has(position.row) || occupiedColumns.has(position.column))

        graphic
          .roundRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4, 5)
          .fill({ color, alpha: crossed ? 0.18 : 0.48 })
          .stroke({ color: '#121522', width: 2, pixelLine: true })

        if (crossed) {
          graphic
            .moveTo(x + 5, y + cellHeight - 5)
            .lineTo(x + cellWidth - 5, y + 5)
            .stroke({ color: '#f8f0dd', width: 2, pixelLine: true })

          const obstacle = new Text({
            text: '🧱',
            style: { fontFamily: 'sans-serif', fontSize: Math.max(12, cellWidth * 0.2) },
          })
          obstacle.x = x + cellWidth * 0.54
          obstacle.y = y + cellHeight * 0.28
          obstacle.alpha = 0.28
          app.stage.addChild(obstacle)
        }

        if (position.row === 0) {
          const icon = new Text({
            text: icons[position.column % icons.length]!,
            style: { fontFamily: 'sans-serif', fontSize: Math.max(14, cellWidth * 0.22) },
          })
          icon.x = x + 7
          icon.y = y + 5
          icon.alpha = crossed ? 0.28 : 0.82
          app.stage.addChild(icon)
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
