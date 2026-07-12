import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { parseSharedGameRoute, shareUrl } from './app/routes'
import { CharacterTray } from './components/CharacterTray'
import { CluePanel } from './components/CluePanel'
import { DifficultySelector } from './components/DifficultySelector'
import { GameBoard } from './components/GameBoard'
import { GameHeader } from './components/GameHeader'
import { InstallPrompt } from './components/InstallPrompt'
import { ResultDialog } from './components/ResultDialog'
import { SettingsDialog } from './components/SettingsDialog'
import { UpdatePrompt } from './components/UpdatePrompt'
import { t, themeCopy } from './domain/i18n'
import type { Difficulty } from './domain/types'
import {
  gameReducer,
  createGameState,
  type GameAction,
  type GameState,
} from './game/gameReducer'
import { progress, unplacedCharacters } from './game/selectors'
import { generatePuzzle } from './generator/puzzleGenerator'
import { registerServiceWorker } from './pwa/registerServiceWorker'
import { clearSavedGame, loadSavedGame, saveGame } from './storage/savedGame'
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './storage/preferences'
import { loadStatistics, recordCompletion, type Statistics } from './storage/statistics'

const emptyStatistics: Statistics = {
  schemaVersion: 1,
  completed: 0,
  hintsUsed: 0,
  recentSeeds: [],
}

const createSeed = () => globalThis.crypto?.randomUUID?.() ?? `adventure-${Date.now()}`

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [statistics, setStatistics] = useState<Statistics>(emptyStatistics)
  const [game, setGame] = useState<GameState | null>(null)
  const [ready, setReady] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null)
  const [notice, setNotice] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  useEffect(() => {
    let active = true
    void Promise.all([loadPreferences(), loadStatistics(), loadSavedGame()]).then(
      ([storedPreferences, storedStatistics, savedGame]) => {
        if (!active) return
        setPreferences(storedPreferences)
        setStatistics(storedStatistics)
        const shared = parseSharedGameRoute(window.location)
        if (shared) {
          setGame(createGameState(generatePuzzle(shared.difficulty, shared.seed)))
        } else if (savedGame?.status === 'playing') {
          setGame(savedGame)
        }
        setReady(true)
      },
    )
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    void savePreferences(preferences)
    document.documentElement.lang = preferences.locale
    document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion)
  }, [preferences, ready])

  useEffect(() => {
    if (game?.status === 'playing') void saveGame(game)
  }, [game])

  useEffect(() => {
    const setOnlineState = () => setOnline(navigator.onLine)
    window.addEventListener('online', setOnlineState)
    window.addEventListener('offline', setOnlineState)
    return () => {
      window.removeEventListener('online', setOnlineState)
      window.removeEventListener('offline', setOnlineState)
    }
  }, [])

  useEffect(() => {
    const update = registerServiceWorker({
      onNeedRefresh: () => setUpdateAvailable(true),
      onOfflineReady: () =>
        setNotice('Logic Garden ja està preparat per jugar sense connexió.'),
    })
    setApplyUpdate(() => () => {
      void update(true)
    })
  }, [])

  const startGame = (
    difficulty: Difficulty = preferences.difficulty,
    source = createSeed(),
  ) => {
    setGenerating(true)
    try {
      const nextGame = createGameState(generatePuzzle(difficulty, source))
      setGame(nextGame)
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
      setNotice('')
    } catch {
      setNotice('No hem pogut preparar aquesta aventura. Prova una partida nova.')
    } finally {
      setGenerating(false)
    }
  }

  const returnToHome = () => {
    setGame(null)
    void clearSavedGame()
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
    setNotice('')
  }

  const runGameAction = (action: GameAction) => {
    if (!game) return
    const nextGame = gameReducer(game, action)
    setGame(nextGame)
    if (action.type === 'check' && nextGame.status === 'won' && game.status !== 'won') {
      void clearSavedGame()
      void recordCompletion(nextGame.puzzle.seed, nextGame.hintsUsed)
      setStatistics((current) => ({
        ...current,
        completed: current.completed + 1,
        hintsUsed: current.hintsUsed + nextGame.hintsUsed,
      }))
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    if (!game || !event.over) return
    const character = game.puzzle.characters.find(
      (candidate) => candidate.id === String(event.active.id),
    )
    const position = game.puzzle.positions.find(
      (candidate) => `position:${candidate.id}` === String(event.over?.id),
    )
    if (character && position) {
      runGameAction({
        type: 'move-character',
        characterId: character.id,
        positionId: position.id,
      })
    }
  }

  const shareCurrentGame = () => {
    if (!game) return
    const url = shareUrl(game.puzzle)
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(url)
        setNotice(t(preferences.locale, 'copied'))
      } catch {
        setNotice(url)
      }
    }
    if (navigator.share) {
      void navigator.share({ title: 'Logic Garden', url }).catch(() => {
        void copyLink()
      })
    } else {
      void copyLink()
    }
  }

  const connectionLabel = t(preferences.locale, online ? 'online' : 'offline')

  if (!ready) {
    return <main className="loading-screen">Preparant el jardí de lògica…</main>
  }

  if (!game) {
    return (
      <main className="app-shell home-screen">
        <GameHeader
          online={online}
          connectionLabel={connectionLabel}
          homeLabel={t(preferences.locale, 'goHome')}
          settingsLabel={t(preferences.locale, 'settings')}
          onOpenSettings={() => setShowSettings(true)}
        />
        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="eyebrow">{t(preferences.locale, 'heroEyebrow')}</p>
            <h1>{t(preferences.locale, 'heroTitle')}</h1>
            <p className="home-hero__description">{t(preferences.locale, 'heroDescription')}</p>
            <DifficultySelector
              value={preferences.difficulty}
              locale={preferences.locale}
              label={t(preferences.locale, 'difficulty')}
              onChange={(difficulty) => setPreferences({ ...preferences, difficulty })}
            />
            <div className="home-hero__actions">
              <button
                type="button"
                className="button button--large"
                disabled={generating}
                onClick={() => startGame()}
              >
                <span aria-hidden="true">✦</span>{' '}
                {generating ? '…' : t(preferences.locale, 'play')}
              </button>
              <p className="home-stat">
                <strong>{statistics.completed}</strong>{' '}
                {t(preferences.locale, 'adventuresCompleted')}
              </p>
            </div>
            <details className="how-it-works">
              <summary>{t(preferences.locale, 'howItWorks')}</summary>
              <p>{t(preferences.locale, 'howToPlayText')}</p>
            </details>
          </div>
          <div className="home-hero__scene" aria-hidden="true">
            <span className="scene-sun">☀</span>
            <span className="scene-cloud scene-cloud--one">☁</span>
            <span className="scene-cloud scene-cloud--two">☁</span>
            <div className="scene-hill scene-hill--back" />
            <div className="scene-hill scene-hill--front" />
            <span className="scene-friend scene-friend--one">🦊</span>
            <span className="scene-friend scene-friend--two">🐰</span>
            <span className="scene-flower scene-flower--one">✿</span>
            <span className="scene-flower scene-flower--two">✿</span>
          </div>
        </section>
        <InstallPrompt label={t(preferences.locale, 'install')} />
        {showSettings && (
          <SettingsDialog
            preferences={preferences}
            locale={preferences.locale}
            title={t(preferences.locale, 'settings')}
            onChange={setPreferences}
            onClose={() => setShowSettings(false)}
          />
        )}
      </main>
    )
  }

  const copy = themeCopy(preferences.locale, game.puzzle.theme)
  const gameProgress = progress(game)
  const availableCharacters = unplacedCharacters(game)

  return (
    <main className={`app-shell game-screen theme--${game.puzzle.theme}`}>
      <GameHeader
        online={online}
        connectionLabel={connectionLabel}
        homeLabel={t(preferences.locale, 'goHome')}
        settingsLabel={t(preferences.locale, 'settings')}
        onOpenSettings={() => setShowSettings(true)}
        onGoHome={returnToHome}
      />
      <section className="adventure-banner">
        <div className="adventure-banner__title">
          <span className="adventure-banner__stamp" aria-hidden="true">
            {game.puzzle.characters[0]?.emoji ?? '✦'}
          </span>
          <div>
            <p className="eyebrow">
              {t(preferences.locale, 'adventure')} · {t(preferences.locale, 'difficulty')}
            </p>
            <h1>{copy.title}</h1>
            <p>{copy.introduction}</p>
          </div>
        </div>
        <div className="adventure-banner__metrics">
          <div>
            <strong>
              {gameProgress.placed}
              <small>/{gameProgress.total}</small>
            </strong>
            <span>{t(preferences.locale, 'progress')}</span>
          </div>
          <div>
            <strong>{game.moves}</strong>
            <span>{t(preferences.locale, 'moves')}</span>
          </div>
        </div>
      </section>
      <p className="objective-line">{copy.objective}</p>
      <p className="sr-only" aria-live="polite">
        {game.feedback ?? notice}
      </p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="game-layout">
          <section className="map-area">
            <div className="map-area__heading">
              <div>
                <p className="eyebrow">{t(preferences.locale, 'map')}</p>
                <h2>
                  {game.selectedCharacterId
                    ? game.puzzle.characters.find(
                        (character) => character.id === game.selectedCharacterId,
                      )?.name
                    : t(preferences.locale, 'mapInstruction')}
                </h2>
              </div>
              <span className="map-area__prompt">
                {t(preferences.locale, 'mapInstruction')}
              </span>
            </div>
            <GameBoard
              positions={game.puzzle.positions}
              characters={game.puzzle.characters}
              assignments={game.assignments}
              selectedCharacterId={game.selectedCharacterId}
              boardLabel={t(preferences.locale, 'map')}
              emptyLabel={t(preferences.locale, 'emptyPlace')}
              onMoveToPosition={(positionId) => {
                if (game.selectedCharacterId) {
                  runGameAction({
                    type: 'move-character',
                    characterId: game.selectedCharacterId,
                    positionId,
                  })
                } else {
                  setNotice('Primer tria un amic de la safata o del mapa.')
                }
              }}
              onSelectCharacter={(character) =>
                runGameAction({ type: 'select-character', characterId: character.id })
              }
            />
            <div className="tray-wrap">
              <h2>{t(preferences.locale, 'characters')}</h2>
              <CharacterTray
                characters={availableCharacters}
                selectedCharacterId={game.selectedCharacterId}
                label={t(preferences.locale, 'characters')}
                onSelect={(character) =>
                  runGameAction({ type: 'select-character', characterId: character.id })
                }
              />
            </div>
          </section>
          <CluePanel
            puzzle={game.puzzle}
            locale={preferences.locale}
            highlightedClueId={game.highlightedClueId}
            label={t(preferences.locale, 'clues')}
          />
        </div>
      </DndContext>
      <div className="game-actions" aria-label="Accions de joc">
        <div className="game-actions__secondary">
          <button
            type="button"
            onClick={() => runGameAction({ type: 'undo' })}
            disabled={game.past.length === 0}
          >
            {t(preferences.locale, 'undo')}
          </button>
          <button
            type="button"
            onClick={() => runGameAction({ type: 'redo' })}
            disabled={game.future.length === 0}
          >
            {t(preferences.locale, 'redo')}
          </button>
          <button type="button" onClick={() => runGameAction({ type: 'reset' })}>
            {t(preferences.locale, 'restart')}
          </button>
          <button type="button" onClick={() => runGameAction({ type: 'hint' })}>
            {t(preferences.locale, 'hint')}
          </button>
        </div>
        <div className="game-actions__primary">
          <button type="button" onClick={returnToHome}>
            {t(preferences.locale, 'changeDifficulty')}
          </button>
          <button type="button" onClick={() => startGame()}>
            {t(preferences.locale, 'newGame')}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => runGameAction({ type: 'check' })}
          >
            {t(preferences.locale, 'check')}
          </button>
        </div>
      </div>
      {(game.feedback || notice) && (
        <p className="feedback" role="status">
          {game.feedback ?? notice}
        </p>
      )}
      <InstallPrompt label={t(preferences.locale, 'install')} />
      {showSettings && (
        <SettingsDialog
          preferences={preferences}
          locale={preferences.locale}
          title={t(preferences.locale, 'settings')}
          onChange={setPreferences}
          onClose={() => setShowSettings(false)}
        />
      )}
      {game.status === 'won' && (
        <ResultDialog
          title={copy.title}
          message={copy.victory}
          moves={game.moves}
          hintsUsed={game.hintsUsed}
          movesLabel={t(preferences.locale, 'moves').toLowerCase()}
          hintsLabel={t(preferences.locale, 'hintsUsed')}
          newGameLabel={t(preferences.locale, 'newGame')}
          changeDifficultyLabel={t(preferences.locale, 'changeDifficulty')}
          shareLabel={t(preferences.locale, 'share')}
          onNewGame={() => startGame()}
          onChangeDifficulty={returnToHome}
          onShare={shareCurrentGame}
        />
      )}
      {updateAvailable && applyUpdate && (
        <UpdatePrompt
          message={t(preferences.locale, 'updateReady')}
          action={t(preferences.locale, 'update')}
          onUpdate={applyUpdate}
        />
      )}
    </main>
  )
}
