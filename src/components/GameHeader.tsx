import { Users } from 'lucide-react'

interface GameHeaderProps {
  readonly online: boolean
  readonly connectionLabel: string
  readonly homeLabel: string
  readonly settingsLabel: string
  readonly onOpenSettings: () => void
  readonly onGoHome?: () => void
  readonly groupConnection?: {
    readonly label: string
    readonly accessibilityLabel: string
    readonly state: 'connected' | 'disconnected'
    readonly count?: number
    readonly onOpen: () => void
  }
}

export const GameHeader = ({
  online,
  connectionLabel,
  homeLabel,
  settingsLabel,
  onOpenSettings,
  onGoHome,
  groupConnection,
}: GameHeaderProps) => (
  <header className={`game-header ${groupConnection ? 'game-header--group' : ''}`}>
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
      {groupConnection && (
        <button
          type="button"
          className={`connection-pill connection-pill--group connection-pill--${groupConnection.state}`}
          aria-label={groupConnection.accessibilityLabel}
          onClick={groupConnection.onOpen}
        >
          <Users aria-hidden="true" />
          <span>{groupConnection.label}</span>
          {groupConnection.count !== undefined && <strong>{groupConnection.count}</strong>}
        </button>
      )}
      {!online && (
        <span className="connection-pill connection-pill--offline">
          <span aria-hidden="true">○</span> {connectionLabel}
        </span>
      )}
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
