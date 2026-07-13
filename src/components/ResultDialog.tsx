interface ResultDialogProps {
  readonly title: string
  readonly message: string
  readonly elapsed: string
  readonly moves: number
  readonly hintsUsed: number
  readonly onNewGame: () => void
  readonly onChangeDifficulty: () => void
  readonly onShare: () => void
  readonly newGameLabel: string
  readonly changeDifficultyLabel: string
  readonly shareLabel: string
  readonly timeLabel: string
  readonly movesLabel: string
  readonly hintsLabel: string
  readonly challengeMessage?: string
  readonly challengeShareHint?: string
  readonly progressLabel?: string
}

export const ResultDialog = ({
  title,
  message,
  elapsed,
  moves,
  hintsUsed,
  onNewGame,
  onChangeDifficulty,
  onShare,
  newGameLabel,
  changeDifficultyLabel,
  shareLabel,
  timeLabel,
  movesLabel,
  hintsLabel,
  challengeMessage,
  challengeShareHint,
  progressLabel,
}: ResultDialogProps) => {
  const dialogRef = useDialogFocus()
  return (
    <div className="result-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="result-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
      >
        <span className="result-dialog__sparkles" aria-hidden="true">
          * * *
        </span>
        <h2 id="result-title">{title}</h2>
        <p>{message}</p>
        {progressLabel && (
          <strong className="result-dialog__check-progress">{progressLabel}</strong>
        )}
        <p className="result-dialog__stats">
          {elapsed} {timeLabel} · {moves} {movesLabel} · {hintsUsed} {hintsLabel}
        </p>
        {challengeMessage && (
          <div className="result-dialog__challenge-card">
            <strong>{challengeMessage}</strong>
            {challengeShareHint && <span>{challengeShareHint}</span>}
          </div>
        )}
        <div className="button-row">
          <button
            type="button"
            className="button button--secondary"
            onClick={onChangeDifficulty}
          >
            {changeDifficultyLabel}
          </button>
          <button type="button" className="button button--secondary" onClick={onShare}>
            {shareLabel}
          </button>
          <button type="button" className="button" onClick={onNewGame}>
            {newGameLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
import { useDialogFocus } from './useDialogFocus'
