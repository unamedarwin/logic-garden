export const elapsedSeconds = (startedAt: number, finishedAt?: number, now = Date.now()) =>
  Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1_000))

export const formatCounter = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
