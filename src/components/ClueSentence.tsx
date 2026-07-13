import { renderClueParts } from '../domain/vocabulary'
import type { Clue, Locale, Puzzle } from '../domain/types'
import { SceneIcon } from './SceneIcon'

interface ClueSentenceProps {
  readonly puzzle: Puzzle
  readonly clue: Clue
  readonly locale: Locale
}

export const ClueSentence = ({ puzzle, clue, locale }: ClueSentenceProps) => (
  <>
    {renderClueParts(puzzle, clue, locale).map((part, index) =>
      part.type === 'icon' ? (
        <SceneIcon
          key={`${part.emoji}:${index}`}
          emoji={part.emoji}
          className="clue-sentence__icon"
        />
      ) : (
        <span key={`text:${index}`}>{part.text}</span>
      ),
    )}
  </>
)
