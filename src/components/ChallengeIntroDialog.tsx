import { useDialogFocus } from './useDialogFocus'

interface ChallengeIntroDialogProps {
  readonly title: string
  readonly welcome?: string
  readonly message: string
  readonly actionLabel: string
  readonly onContinue: () => void
}

export const ChallengeIntroDialog = ({
  title,
  welcome,
  message,
  actionLabel,
  onContinue,
}: ChallengeIntroDialogProps) => {
  const dialogRef = useDialogFocus()
  return (
    <div className="settings-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="challenge-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-title"
      >
        <span className="challenge-dialog__seal" aria-hidden="true">
          LG
        </span>
        {welcome && <p className="eyebrow">{welcome}</p>}
        <h2 id="challenge-title">{title}</h2>
        <p>{message}</p>
        <button type="button" className="button button--large" onClick={onContinue}>
          {actionLabel}
        </button>
      </section>
    </div>
  )
}
