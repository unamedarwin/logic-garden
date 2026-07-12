interface ResultDialogProps {
  readonly title: string
  readonly message: string
  readonly moves: number
  readonly hintsUsed: number
  readonly onNewGame: () => void
  readonly onShare: () => void
  readonly newGameLabel: string
  readonly shareLabel: string
  readonly movesLabel: string
  readonly hintsLabel: string
}

export const ResultDialog = ({
  title,
  message,
  moves,
  hintsUsed,
  onNewGame,
  onShare,
  newGameLabel,
  shareLabel,
  movesLabel,
  hintsLabel,
}: ResultDialogProps) => (
  <div className="result-backdrop" role="presentation">
    <section
      className="result-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <span className="result-dialog__sparkles" aria-hidden="true">
        ✦ ✦ ✦
      </span>
      <h2 id="result-title">{title}</h2>
      <p>{message}</p>
      <p className="result-dialog__stats">
        {moves} {movesLabel} · {hintsUsed} {hintsLabel}
      </p>
      <div className="button-row">
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
