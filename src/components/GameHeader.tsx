interface GameHeaderProps {
  readonly online: boolean
  readonly connectionLabel: string
  readonly homeLabel: string
  readonly settingsLabel: string
  readonly onOpenSettings: () => void
  readonly onGoHome?: () => void
}

export const GameHeader = ({
  online,
  connectionLabel,
  homeLabel,
  settingsLabel,
  onOpenSettings,
  onGoHome,
}: GameHeaderProps) => (
  <header className="game-header">
    {onGoHome ? (
      <button
        type="button"
        className="game-header__brand"
        aria-label={homeLabel}
        onClick={onGoHome}
      >
        <span className="game-header__mark" aria-hidden="true">
          LG
        </span>
        <span>Logic Garden</span>
      </button>
    ) : (
      <a className="game-header__brand" href={import.meta.env.BASE_URL} aria-label={homeLabel}>
        <span className="game-header__mark" aria-hidden="true">
          LG
        </span>
        <span>Logic Garden</span>
      </a>
    )}
    <div className="game-header__tools">
      <span className={`connection-pill ${online ? '' : 'connection-pill--offline'}`}>
        <span aria-hidden="true">{online ? '●' : '○'}</span> {connectionLabel}
      </span>
      <button
        type="button"
        className="icon-button"
        aria-label={settingsLabel}
        onClick={onOpenSettings}
      >
        ⚙
      </button>
    </div>
  </header>
)
