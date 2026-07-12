interface GameHeaderProps {
  readonly online: boolean
  readonly connectionLabel: string
  readonly settingsLabel: string
  readonly onOpenSettings: () => void
}

export const GameHeader = ({
  online,
  connectionLabel,
  settingsLabel,
  onOpenSettings,
}: GameHeaderProps) => (
  <header className="game-header">
    <a className="game-header__brand" href="/" aria-label="Logic Garden, inici">
      <span className="game-header__mark" aria-hidden="true">
        LG
      </span>
      <span>Logic Garden</span>
    </a>
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
