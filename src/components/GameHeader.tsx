interface GameHeaderProps {
  readonly title: string
  readonly online: boolean
  readonly connectionLabel: string
  readonly settingsLabel: string
  readonly onOpenSettings: () => void
}

export const GameHeader = ({
  title,
  online,
  connectionLabel,
  settingsLabel,
  onOpenSettings,
}: GameHeaderProps) => (
  <header className="game-header">
    <a className="game-header__brand" href="/" aria-label="Logic Garden, inici">
      <span aria-hidden="true">✦</span> Logic Garden
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
    <h1>{title}</h1>
  </header>
)
