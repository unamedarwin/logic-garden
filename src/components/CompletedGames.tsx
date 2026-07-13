import { formatCounter } from '../game/time'
import type { Locale } from '../domain/types'
import type { CompletedGame } from '../storage/statistics'
import { themeCopy } from '../domain/i18n'

interface CompletedGamesProps {
  readonly games?: readonly CompletedGame[]
  readonly locale: Locale
  readonly title: string
  readonly shareLabel: string
  readonly movesLabel: string
  readonly onShare: (game: CompletedGame) => void
}

const dateFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export const CompletedGames = ({
  games = [],
  locale,
  title,
  shareLabel,
  movesLabel,
  onShare,
}: CompletedGamesProps) => {
  if (games.length === 0) return null
  const formatDate = dateFormatter(locale)

  return (
    <section className="completed-games" aria-labelledby="completed-games-title">
      <h2 id="completed-games-title">{title}</h2>
      <div className="completed-games__list">
        {games.map((game) => (
          <article key={game.id} className="completed-games__item">
            <div>
              <strong>
                {game.theme
                  ? themeCopy(locale, game.theme).title
                  : (game.legacyTitle ?? 'Logic Garden')}
              </strong>
              <span>{formatDate.format(game.completedAt)}</span>
            </div>
            <p>
              {game.puzzleVariant === 'cube' && (
                <span className="completed-games__mode">5×5×3 · </span>
              )}
              {formatCounter(game.elapsedSeconds)} · {game.moves} {movesLabel}
            </p>
            <button type="button" onClick={() => onShare(game)}>
              {shareLabel}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
