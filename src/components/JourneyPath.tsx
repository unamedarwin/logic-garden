import { ChevronLeft, ChevronRight } from 'lucide-react'

export type JourneyStep = 'collection' | 'size' | 'difficulty' | 'adventure'

interface JourneyPathProps {
  readonly label: string
  readonly currentStep: JourneyStep
  readonly furthestStep: JourneyStep
  readonly steps: Readonly<Record<JourneyStep, string>>
  readonly previousLabel: string
  readonly nextLabel: string
  readonly canGoPrevious: boolean
  readonly canGoNext: boolean
  readonly onPrevious: () => void
  readonly onNext: () => void
  readonly onStepChange: (step: JourneyStep) => void
}

const journeySteps: readonly JourneyStep[] = ['collection', 'size', 'difficulty', 'adventure']

export const JourneyPath = ({
  label,
  currentStep,
  furthestStep,
  steps,
  previousLabel,
  nextLabel,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onStepChange,
}: JourneyPathProps) => {
  const furthestIndex = journeySteps.indexOf(furthestStep)

  return (
    <nav className="journey-path" aria-label={label}>
      <button
        type="button"
        className="journey-path__direction"
        aria-label={previousLabel}
        disabled={!canGoPrevious}
        onClick={onPrevious}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <ol>
        {journeySteps.map((step, index) => (
          <li key={step}>
            <button
              type="button"
              className={step === currentStep ? 'journey-path__step--current' : undefined}
              aria-current={step === currentStep ? 'step' : undefined}
              disabled={index > furthestIndex}
              onClick={() => onStepChange(step)}
            >
              <span aria-hidden="true">{index + 1}</span>
              {steps[step]}
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="journey-path__direction"
        aria-label={nextLabel}
        disabled={!canGoNext}
        onClick={onNext}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}
