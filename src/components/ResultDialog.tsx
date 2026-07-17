import type { CompetitionParticipant, CompetitionRoundResult } from '../multiplayer/protocol'
import { useDialogFocus } from './useDialogFocus'

interface CompetitionSummary {
  readonly participants: readonly CompetitionParticipant[]
  readonly results: readonly CompetitionRoundResult[]
  readonly roundId: string
}

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
  readonly competitionSummary?: CompetitionSummary
}

const resultTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

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
  competitionSummary,
}: ResultDialogProps) => {
  const dialogRef = useDialogFocus()
  const roundResults = competitionSummary?.results.filter(
    (result) => result.roundId === competitionSummary.roundId,
  )
  const connectedParticipants = competitionSummary?.participants.filter(
    (participant) => participant.connected,
  )
  const allFinished = Boolean(
    connectedParticipants?.length &&
    connectedParticipants.every((participant) =>
      roundResults?.some((result) => result.participantId === participant.id),
    ),
  )
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
        {competitionSummary && connectedParticipants && roundResults && (
          <div className="result-dialog__competition" aria-live="polite">
            <strong>
              {allFinished ? 'Tothom ha acabat la ronda.' : 'Esperant la resta del grup…'}
            </strong>
            <ul>
              {connectedParticipants.map((participant) => {
                const result = roundResults.find(
                  (candidate) => candidate.participantId === participant.id,
                )
                return (
                  <li key={participant.id}>
                    <span>
                      <span aria-hidden="true">{participant.avatar}</span> {participant.name}
                    </span>
                    <strong>
                      {result ? resultTime(result.elapsedSeconds) : 'Encara juga'}
                    </strong>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <div className="button-row">
          {!competitionSummary && (
            <button
              type="button"
              className="button button--secondary"
              onClick={onChangeDifficulty}
            >
              {changeDifficultyLabel}
            </button>
          )}
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
