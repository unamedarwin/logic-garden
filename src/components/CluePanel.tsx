import { renderClue } from '../domain/vocabulary'
import type { Locale, Puzzle } from '../domain/types'

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
          {renderClue(puzzle, clue, locale)}
        </li>
      ))}
    </ol>
  </details>
)
