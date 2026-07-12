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
      window.history.replaceState({}, '', '/')
      setNotice('')
    } catch {
      setNotice('No hem pogut preparar aquesta aventura. Prova una partida nova.')
    } finally {
      setGenerating(false)
    }
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
          title="Logic Garden"
          online={online}
          connectionLabel={connectionLabel}
          settingsLabel={t(preferences.locale, 'settings')}
          onOpenSettings={() => setShowSettings(true)}
        />
        <section className="home-hero">
          <p className="eyebrow">PUZZLES DE DEDUCCIÓ · SENSE CONNEXIÓ</p>
          <h2>Posa cada amic al seu lloc amb pistes i imaginació.</h2>
          <p>Cada aventura té una única solució i es pot repetir amb la mateixa llavor.</p>
          <DifficultySelector
            value={preferences.difficulty}
            locale={preferences.locale}
            label={t(preferences.locale, 'difficulty')}
            onChange={(difficulty) => setPreferences({ ...preferences, difficulty })}
          />
          <button
            type="button"
            className="button button--large"
            disabled={generating}
            onClick={() => startGame()}
          >
            {generating ? '…' : t(preferences.locale, 'play')}
          </button>
          <details className="how-it-works">
            <summary>{t(preferences.locale, 'howItWorks')}</summary>
            <p>
              Tria un amic, toca un lloc del mapa i revisa les pistes. També pots arrossegar les
              peces.
            </p>
          </details>
          <p className="home-stat">{statistics.completed} aventures completades</p>
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
    <main className="app-shell game-screen">
      <GameHeader
        title={copy.title}
        online={online}
        connectionLabel={connectionLabel}
        settingsLabel={t(preferences.locale, 'settings')}
        onOpenSettings={() => setShowSettings(true)}
      />
      <section className="story-card">
        <p>{copy.introduction}</p>
        <strong>{copy.objective}</strong>
      </section>
      <p className="progress-line">
        {t(preferences.locale, 'progress')}: {gameProgress.placed}/{gameProgress.total} ·{' '}
        {t(preferences.locale, 'moves')}: {game.moves}
      </p>
      <p className="sr-only" aria-live="polite">
        {game.feedback ?? notice}
      </p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="game-layout">
          <section className="map-area">
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
        <button
          type="button"
          className="button"
          onClick={() => runGameAction({ type: 'check' })}
        >
          {t(preferences.locale, 'check')}
        </button>
        <button type="button" onClick={() => startGame()}>
          {t(preferences.locale, 'newGame')}
        </button>
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
          shareLabel={t(preferences.locale, 'share')}
          onNewGame={() => startGame()}
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
