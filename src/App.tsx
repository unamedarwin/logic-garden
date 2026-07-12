import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Check, Home, Lightbulb, Redo2, RotateCcw, Shuffle, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { parseSharedGameRoute, shareUrl } from './app/routes'
import { CharacterTray } from './components/CharacterTray'
import { CharacterClueRail } from './components/CharacterClueRail'
import { CluePanel } from './components/CluePanel'
import { CompletedGames } from './components/CompletedGames'
import { DifficultySelector } from './components/DifficultySelector'
import { GameBoard } from './components/GameBoard'
import { GameHeader } from './components/GameHeader'
import { GameTimer } from './components/GameTimer'
import { HintCharacterDialog } from './components/HintCharacterDialog'
import { InstallPrompt } from './components/InstallPrompt'
import { ProfileSetup } from './components/ProfileSetup'
import { ResultDialog } from './components/ResultDialog'
import { SettingsDialog } from './components/SettingsDialog'
import { UpdatePrompt } from './components/UpdatePrompt'
import { audienceHeroCopy, audienceLabel, boardActionCopy, t, themeCopy } from './domain/i18n'
import { avatarOptions, type PlayerProfile } from './domain/profile'
import { seed, type Audience, type Difficulty } from './domain/types'
import {
  gameReducer,
  createGameState,
  type GameAction,
  type GameState,
} from './game/gameReducer'
import { progress, unplacedCharacters } from './game/selectors'
import { elapsedSeconds, formatCounter } from './game/time'
import { generatePuzzle } from './generator/puzzleGenerator'
import { registerServiceWorker } from './pwa/registerServiceWorker'
import { loadProfile, saveProfile } from './storage/profile'
import { clearSavedGame, loadSavedGame, saveGame } from './storage/savedGame'
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from './storage/preferences'
import {
  loadStatistics,
  recordCompletion,
  type CompletedGame,
  type Statistics,
} from './storage/statistics'

const emptyStatistics: Statistics = {
  schemaVersion: 2,
  completed: 0,
  hintsUsed: 0,
  recentSeeds: [],
  history: [],
}

const HomeScene = ({ audience }: { readonly audience: Audience }) => {
  if (audience === 'teens') {
    return (
      <div className="home-hero__scene home-hero__scene--teens" aria-hidden="true">
        <span className="scene-neon scene-neon--one">✦</span>
        <span className="scene-neon scene-neon--two">●</span>
        <span className="scene-sticker scene-sticker--one">🎧</span>
        <span className="scene-sticker scene-sticker--two">⚽</span>
        <span className="scene-sticker scene-sticker--three">🎨</span>
        <span className="scene-grid" />
      </div>
    )
  }

  if (audience === 'adults') {
    return (
      <div className="home-hero__scene home-hero__scene--adults" aria-hidden="true">
        <span className="scene-paper scene-paper--one">📚</span>
        <span className="scene-paper scene-paper--two">🪴</span>
        <span className="scene-paper scene-paper--three">☕</span>
        <span className="scene-line scene-line--one" />
        <span className="scene-line scene-line--two" />
      </div>
    )
  }

  return (
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
  )
}

const createSeed = () => globalThis.crypto?.randomUUID?.() ?? `adventure-${Date.now()}`

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [statistics, setStatistics] = useState<Statistics>(emptyStatistics)
  const [game, setGame] = useState<GameState | null>(null)
  const [ready, setReady] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null)
  const [notice, setNotice] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [showHintPicker, setShowHintPicker] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  useEffect(() => {
    let active = true
    void Promise.all([
      loadPreferences(),
      loadStatistics(),
      loadSavedGame(),
      loadProfile(),
    ]).then(([storedPreferences, storedStatistics, savedGame, storedProfile]) => {
      if (!active) return
      setPreferences(storedPreferences)
      setStatistics(storedStatistics)
      setProfile(storedProfile)
      const shared = parseSharedGameRoute(window.location)
      if (storedProfile && shared) {
        setGame(
          createGameState(generatePuzzle(shared.difficulty, shared.seed, shared.audience)),
        )
      } else if (storedProfile && savedGame?.status === 'playing') {
        setGame(savedGame)
      }
      setReady(true)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    void savePreferences(preferences)
    document.documentElement.lang = preferences.locale
    document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion)
    document.documentElement.dataset.audience = profile?.audience ?? 'children'
  }, [preferences, profile, ready])

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
    if (!profile) return
    setGenerating(true)
    try {
      const nextGame = createGameState(generatePuzzle(difficulty, source, profile.audience))
      setGame(nextGame)
      setShowHintPicker(false)
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
    setShowHintPicker(false)
    void clearSavedGame()
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
    setNotice('')
  }

  const savePlayerProfile = (nextProfile: PlayerProfile) => {
    setProfile(nextProfile)
    void saveProfile(nextProfile)
    void clearSavedGame()
    setGame(null)
    setEditingProfile(false)
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
  }

  const runGameAction = (action: GameAction) => {
    if (!game) return
    const nextGame = gameReducer(game, action)
    setGame(nextGame)
    if (action.type === 'check' && nextGame.status === 'won' && game.status !== 'won') {
      void clearSavedGame()
      const finishedAt = nextGame.finishedAt ?? Date.now()
      void recordCompletion({
        seed: nextGame.puzzle.seed,
        title: themeCopy(preferences.locale, nextGame.puzzle.theme).title,
        audience: profile?.audience ?? 'children',
        difficulty: nextGame.puzzle.difficulty,
        elapsedSeconds: elapsedSeconds(nextGame.startedAt, finishedAt),
        moves: nextGame.moves,
        hintsUsed: nextGame.hintsUsed,
      }).then(setStatistics)
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

  const shareWithSystemMenu = (url: string, title: string) => {
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(url)
        setNotice(t(preferences.locale, 'copied'))
      } catch {
        setNotice(url)
      }
    }
    if (navigator.share) {
      void navigator.share({ title, text: title, url }).then(
        () => setNotice(t(preferences.locale, 'shared')),
        (error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return
          void copyLink()
        },
      )
    } else {
      void copyLink()
    }
  }

  const shareCurrentGame = () => {
    if (!game || !profile) return
    shareWithSystemMenu(
      shareUrl(game.puzzle, profile.audience),
      `Logic Garden: ${game.puzzle.title}`,
    )
  }

  const shareCompletedGame = (completedGame: CompletedGame) => {
    shareWithSystemMenu(
      shareUrl(
        { difficulty: completedGame.difficulty, seed: seed(completedGame.seed) },
        completedGame.audience,
      ),
      `Logic Garden: ${completedGame.title}`,
    )
  }

  const requestHint = () => {
    if (!game) return
    if (game.selectedCharacterId) {
      runGameAction({ type: 'hint' })
      return
    }
    setShowHintPicker(true)
  }

  const connectionLabel = t(preferences.locale, online ? 'online' : 'offline')

  if (!ready) {
    return <main className="loading-screen">Preparant el jardí de lògica…</main>
  }

  if (!profile || editingProfile) {
    return (
      <ProfileSetup profile={profile} locale={preferences.locale} onSave={savePlayerProfile} />
    )
  }

  if (!game) {
    const heroCopy = audienceHeroCopy(preferences.locale, profile.audience)
    const avatar = avatarOptions.find((option) => option.id === profile.avatar)
    return (
      <main className={`app-shell home-screen audience--${profile.audience}`}>
        <GameHeader
          online={online}
          connectionLabel={connectionLabel}
          homeLabel={t(preferences.locale, 'goHome')}
          settingsLabel={t(preferences.locale, 'settings')}
          onOpenSettings={() => setShowSettings(true)}
        />
        <section className="home-hero">
          <div className="home-hero__copy">
            <p className="eyebrow">{heroCopy.eyebrow}</p>
            <h1>{heroCopy.title}</h1>
            <p className="home-hero__description">{heroCopy.description}</p>
            <section className="profile-summary" aria-label={profile.name}>
              <span className="profile-summary__avatar" aria-hidden="true">
                {avatar?.emoji}
              </span>
              <div>
                <strong>{profile.name}</strong>
                <span>{audienceLabel(preferences.locale, profile.audience)}</span>
              </div>
              <button type="button" onClick={() => setEditingProfile(true)}>
                {t(preferences.locale, 'editProfile')}
              </button>
            </section>
            <DifficultySelector
              value={preferences.difficulty}
              locale={preferences.locale}
              audience={profile.audience}
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
          <HomeScene audience={profile.audience} />
        </section>
        <CompletedGames
          games={statistics.history}
          locale={preferences.locale}
          title={t(preferences.locale, 'completedGames')}
          shareLabel={t(preferences.locale, 'share')}
          movesLabel={t(preferences.locale, 'moves').toLowerCase()}
          onShare={shareCompletedGame}
        />
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
  const boardActions = boardActionCopy(preferences.locale)
  const boardTitle = t(
    preferences.locale,
    game.puzzle.boardMode === 'logic-grid' ? 'logicGrid' : 'map',
  )
  const boardInstruction = t(
    preferences.locale,
    game.puzzle.boardMode === 'logic-grid' ? 'logicGridInstruction' : 'mapInstruction',
  )
  const gameProgress = progress(game)
  const availableCharacters = unplacedCharacters(game)

  return (
    <main
      className={`app-shell game-screen audience--${profile.audience} theme--${game.puzzle.theme}`}
    >
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
      <div className="game-counter">
        <GameTimer
          startedAt={game.startedAt}
          finishedAt={game.finishedAt}
          label={t(preferences.locale, 'timer')}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {game.feedback ?? notice}
      </p>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="game-layout">
          <section className="map-area">
            <div className="map-area__heading">
              <div>
                <p className="eyebrow">{boardTitle}</p>
                <h2>
                  {game.selectedCharacterId
                    ? game.puzzle.characters.find(
                        (character) => character.id === game.selectedCharacterId,
                      )?.name
                    : boardInstruction}
                </h2>
              </div>
              <span className="map-area__prompt">{boardInstruction}</span>
            </div>
            <GameBoard
              positions={game.puzzle.positions}
              characters={game.puzzle.characters}
              items={game.puzzle.items}
              assignments={game.assignments}
              selectedCharacterId={game.selectedCharacterId}
              boardLabel={boardTitle}
              emptyLabel={t(preferences.locale, 'emptyPlace')}
              returnLabel={t(preferences.locale, 'returnToTray')}
              moveToPositionLabel={boardActions.moveToPosition}
              selectPositionLabel={boardActions.selectPosition}
              boardMode={game.puzzle.boardMode}
              audience={profile.audience}
              spatialPlanId={game.puzzle.spatialPlanId}
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
              onRemoveCharacter={(characterId) =>
                runGameAction({ type: 'remove-character', characterId })
              }
            />
            {game.puzzle.boardMode === 'logic-grid' ? (
              <CharacterClueRail
                puzzle={game.puzzle}
                assignments={game.assignments}
                locale={preferences.locale}
                selectedCharacterId={game.selectedCharacterId}
                label={t(preferences.locale, 'characters')}
                emptyLabel={t(preferences.locale, 'noCharacterClue')}
                onSelect={(character) =>
                  runGameAction({ type: 'select-character', characterId: character.id })
                }
              />
            ) : (
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
            )}
          </section>
          <section className="clue-area">
            <CluePanel
              puzzle={game.puzzle}
              locale={preferences.locale}
              highlightedClueId={game.highlightedClueId}
              label={t(preferences.locale, 'clues')}
            />
          </section>
        </div>
      </DndContext>
      <div className="game-actions" aria-label="Accions de joc">
        <div className="game-actions__secondary">
          <button
            type="button"
            onClick={() => runGameAction({ type: 'undo' })}
            disabled={game.past.length === 0}
          >
            <Undo2 aria-hidden="true" />
            {t(preferences.locale, 'undo')}
          </button>
          <button
            type="button"
            onClick={() => runGameAction({ type: 'redo' })}
            disabled={game.future.length === 0}
          >
            <Redo2 aria-hidden="true" />
            {t(preferences.locale, 'redo')}
          </button>
          <button type="button" onClick={() => runGameAction({ type: 'reset' })}>
            <RotateCcw aria-hidden="true" />
            {t(preferences.locale, 'restart')}
          </button>
          <button type="button" onClick={requestHint}>
            <Lightbulb aria-hidden="true" />
            {t(preferences.locale, 'hint')}
          </button>
        </div>
        <div className="game-actions__primary">
          <button type="button" onClick={returnToHome}>
            <Home aria-hidden="true" />
            {t(preferences.locale, 'changeDifficulty')}
          </button>
          <button type="button" onClick={() => startGame()}>
            <Shuffle aria-hidden="true" />
            {t(preferences.locale, 'newGame')}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => runGameAction({ type: 'check' })}
          >
            <Check aria-hidden="true" />
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
      {showHintPicker && (
        <HintCharacterDialog
          characters={game.puzzle.characters}
          title={t(preferences.locale, 'hintPickerTitle')}
          description={t(preferences.locale, 'hintPickerDescription')}
          closeLabel={t(preferences.locale, 'close')}
          onSelect={(character) => {
            setShowHintPicker(false)
            runGameAction({ type: 'hint', characterId: character.id })
          }}
          onClose={() => setShowHintPicker(false)}
        />
      )}
      {game.status === 'won' && (
        <ResultDialog
          title={copy.title}
          message={copy.victory}
          elapsed={formatCounter(elapsedSeconds(game.startedAt, game.finishedAt))}
          moves={game.moves}
          hintsUsed={game.hintsUsed}
          movesLabel={t(preferences.locale, 'moves').toLowerCase()}
          hintsLabel={t(preferences.locale, 'hintsUsed')}
          newGameLabel={t(preferences.locale, 'newGame')}
          changeDifficultyLabel={t(preferences.locale, 'changeDifficulty')}
          shareLabel={t(preferences.locale, 'share')}
          timeLabel={t(preferences.locale, 'timer').toLowerCase()}
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
