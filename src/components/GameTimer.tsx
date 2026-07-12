import { useEffect, useState } from 'react'
import { elapsedSeconds, formatCounter } from '../game/time'

interface GameTimerProps {
  readonly startedAt: number
  readonly finishedAt?: number
  readonly label: string
}

export const GameTimer = ({ startedAt, finishedAt, label }: GameTimerProps) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (finishedAt) return
    const interval = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(interval)
  }, [finishedAt])

  return (
    <span className="game-timer" aria-label={label}>
      <span className="game-timer__dot" aria-hidden="true" />
      {formatCounter(elapsedSeconds(startedAt, finishedAt, now))}
    </span>
  )
}
