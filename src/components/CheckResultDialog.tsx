import { Lightbulb } from 'lucide-react'
import { useDialogFocus } from './useDialogFocus'

interface CheckResultDialogProps {
  readonly title: string
  readonly message: string
  readonly score?: string
  readonly continueLabel: string
  readonly closeLabel: string
  readonly onClose: () => void
}

export const CheckResultDialog = ({
  title,
  message,
  score,
  continueLabel,
  closeLabel,
  onClose,
}: CheckResultDialogProps) => {
  const dialogRef = useDialogFocus(onClose)
  return (
    <div className="check-result-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="check-result-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="check-result-title"
      >
        <div className="dialog-heading">
          <span className="check-result-dialog__mark" aria-hidden="true">
            <Lightbulb />
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <h2 id="check-result-title">{title}</h2>
        {score && <strong className="check-result-dialog__score">{score}</strong>}
        <p>{message}</p>
        <button type="button" className="button" onClick={onClose}>
          {continueLabel}
        </button>
      </section>
    </div>
  )
}
