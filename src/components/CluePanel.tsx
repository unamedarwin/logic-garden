import type { Locale, Puzzle } from '../domain/types'
import { ClueSentence } from './ClueSentence'

interface CluePanelProps {
  readonly puzzle: Puzzle
  readonly locale: Locale
  readonly highlightedClueId?: string
  readonly label: string
}

export const CluePanel = ({ puzzle, locale, highlightedClueId, label }: CluePanelProps) => (
  <details className="clue-panel">
    <summary>
      <span>{label}</span>
      <span className="clue-panel__count" aria-hidden="true">
        {puzzle.clues.length}
      </span>
    </summary>
    <ol>
      {puzzle.clues.map((clue) => (
        <li
          key={clue.id}
          className={highlightedClueId === clue.id ? 'clue-panel__highlighted' : ''}
        >
          <ClueSentence puzzle={puzzle} clue={clue} locale={locale} />
        </li>
      ))}
    </ol>
  </details>
)
