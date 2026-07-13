import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  Check,
  Home,
  Lightbulb,
  Redo2,
  RotateCcw,
  Scan,
  Share2,
  Shuffle,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { parseSharedGameRoute, shareUrl, type SharedGameRoute } from './app/routes'
import { ChallengeIntroDialog } from './components/ChallengeIntroDialog'
import { CharacterTray } from './components/CharacterTray'
import { CharacterClueRail } from './components/CharacterClueRail'
import { CharacterTokenPreview } from './components/CharacterToken'
import { CluePanel } from './components/CluePanel'
import { CompletedGames } from './components/CompletedGames'
import { DifficultySelector } from './components/DifficultySelector'
import { GameBoard } from './components/GameBoard'
import { LogicCubeBoard } from './components/LogicCubeBoard'
import { GameHeader } from './components/GameHeader'
import { GameTimer } from './components/GameTimer'
import { HintCharacterDialog } from './components/HintCharacterDialog'
import { InstallPrompt } from './components/InstallPrompt'
import { ProfileSetup } from './components/ProfileSetup'
import { ResultDialog } from './components/ResultDialog'
import { SettingsDialog } from './components/SettingsDialog'
import {
  audienceHeroCopy,
  audienceLabel,
  boardActionCopy,
  challengeInviteCopy,
  challengeResultCopy,
  challengeShareCopy,
  gameFeedbackCopy,
  t,
  themeCopy,
} from './domain/i18n'
import { avatarOptions, type PlayerProfile } from './domain/profile'
import { getTheme } from './domain/themes'
import {
  seed,
  type Audience,
  type CharacterId,
  type Difficulty,
  type PuzzleVariant,
} from './domain/types'
import {
  gameReducer,
  createGameState,
  type GameAction,
  type GameState,
} from './game/gameReducer'
import { progress, unplacedCharacters } from './game/selectors'
import { elapsedSeconds, formatCounter } from './game/time'
import { generatePuzzle } from './generator/puzzleGenerator'
import { GENERATOR_VERSION } from './generator/version'
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

const resetPageScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

const emptyStatistics: Statistics = {
  schemaVersion: 4,
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
  const [notice, setNotice] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [showHintPicker, setShowHintPicker] = useState(false)
  const [sharedChallenge, setSharedChallenge] = useState<SharedGameRoute | null>(null)
  const [showChallengeIntro, setShowChallengeIntro] = useState(false)
  const [challengeFirstVisit, setChallengeFirstVisit] = useState(false)
  const [activeDragCharacterId, setActiveDragCharacterId] = useState<CharacterId | null>(null)
  const [boardZoom, setBoardZoom] = useState(1)
  const boardScrollRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )
  const showOfflineReady = useEffectEvent(() => {
    setNotice(t(preferences.locale, 'offlineReady'))
  })

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
      setChallengeFirstVisit(!storedProfile)
      if (storedProfile && shared) {
        setSharedChallenge(shared)
        setShowChallengeIntro(true)
      } else if (storedProfile && savedGame?.state.status === 'playing') {
        setGame(savedGame.state)
        setSharedChallenge(savedGame.challenge ?? null)
      } else {
        setSharedChallenge(shared)
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
    if (game?.status === 'playing') void saveGame(game, sharedChallenge ?? undefined)
  }, [game, sharedChallenge])

  useEffect(() => {
    const scrollArea = boardScrollRef.current
    if (!scrollArea) return
    scrollArea.scrollLeft = 0
    scrollArea.scrollTop = 0
    setBoardZoom(1)
    setActiveDragCharacterId(null)
  }, [game?.puzzle.id])

  useEffect(() => {
    if (boardZoom !== 1) return
    const scrollArea = boardScrollRef.current
    if (!scrollArea) return
    scrollArea.scrollLeft = 0
    scrollArea.scrollTop = 0
  }, [boardZoom])

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
    const worker = registerServiceWorker({ onOfflineReady: showOfflineReady })
    return worker.dispose
  }, [])

  const startGame = (
    difficulty: Difficulty = preferences.difficulty,
    source = createSeed(),
    variant: PuzzleVariant = preferences.puzzleVariant,
  ) => {
    if (!profile) return
    setGenerating(true)
    try {
      const effectiveVariant = profile.audience === 'children' ? 'spatial' : variant
      const effectiveDifficulty = effectiveVariant === 'cube' ? 'hard' : difficulty
      const nextGame = createGameState(
        generatePuzzle(effectiveDifficulty, source, profile.audience, effectiveVariant),
      )
      setGame(nextGame)
      setSharedChallenge(null)
      setShowChallengeIntro(false)
      setShowHintPicker(false)
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
      resetPageScroll()
      setNotice('')
    } catch {
      setNotice(t(preferences.locale, 'gamePreparationError'))
    } finally {
      setGenerating(false)
    }
  }

  const returnToHome = () => {
    setGame(null)
    setSharedChallenge(null)
    setShowChallengeIntro(false)
    setShowHintPicker(false)
    void clearSavedGame()
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
    resetPageScroll()
    setNotice('')
  }

  const savePlayerProfile = (nextProfile: PlayerProfile) => {
    setProfile(nextProfile)
    void saveProfile(nextProfile)
    void clearSavedGame()
    if (sharedChallenge) {
      setGame(null)
      setShowChallengeIntro(true)
    } else {
      setGame(null)
    }
    setEditingProfile(false)
    if (!sharedChallenge) window.history.replaceState({}, '', import.meta.env.BASE_URL)
    resetPageScroll()
  }

  const acceptSharedChallenge = () => {
    if (!profile || !sharedChallenge) return
    setGenerating(true)
    try {
      setGame(
        createGameState(
          generatePuzzle(
            sharedChallenge.difficulty,
            sharedChallenge.seed,
            sharedChallenge.audience,
            sharedChallenge.variant ?? 'spatial',
          ),
        ),
      )
      setShowChallengeIntro(false)
      setChallengeFirstVisit(false)
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
      resetPageScroll()
      setNotice('')
    } catch {
      setSharedChallenge(null)
      setShowChallengeIntro(false)
      setNotice(t(preferences.locale, 'gamePreparationError'))
    } finally {
      setGenerating(false)
    }
  }

  const activeAudience: Audience = game
    ? game.puzzle.boardMode === 'map'
      ? 'children'
      : (getTheme(game.puzzle.theme).audience ?? profile?.audience ?? 'adults')
    : (profile?.audience ?? 'children')

  const runGameAction = (action: GameAction) => {
    if (!game) return
    const nextGame = gameReducer(game, action)
    setGame(nextGame)
    if (action.type === 'check' && nextGame.status === 'won' && game.status !== 'won') {
      void clearSavedGame()
      const finishedAt = nextGame.finishedAt ?? Date.now()
      void recordCompletion({
        seed: nextGame.puzzle.seed,
        theme: nextGame.puzzle.theme,
        audience: activeAudience,
        difficulty: nextGame.puzzle.difficulty,
        puzzleVariant: nextGame.puzzle.boardMode === 'logic-cube' ? 'cube' : 'spatial',
        generatorVersion: nextGame.puzzle.metadata.generatorVersion,
        elapsedSeconds: elapsedSeconds(nextGame.startedAt, finishedAt),
        moves: nextGame.moves,
        hintsUsed: nextGame.hintsUsed,
      }).then(setStatistics)
    }
  }

  const onDragStart = (event: DragStartEvent) => {
    const characterId = String(event.active.id)
    const character = game?.puzzle.characters.find((candidate) => candidate.id === characterId)
    if (character) setActiveDragCharacterId(character.id)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragCharacterId(null)
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

  const shareWithSystemMenu = (url: string, title: string, text: string = title) => {
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(url)
        setNotice(t(preferences.locale, 'copied'))
      } catch {
        setNotice(url)
      }
    }
    if (navigator.share) {
      void navigator.share({ title, text, url }).then(
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
    const title = themeCopy(preferences.locale, game.puzzle.theme).title
    const completedSeconds =
      game.status === 'won' ? elapsedSeconds(game.startedAt, game.finishedAt) : undefined
    shareWithSystemMenu(
      shareUrl(
        {
          difficulty: game.puzzle.difficulty,
          seed: game.puzzle.seed,
          generatorVersion: game.puzzle.metadata.generatorVersion,
          variant: game.puzzle.boardMode === 'logic-cube' ? 'cube' : 'spatial',
        },
        activeAudience,
        completedSeconds,
      ),
      `Logic Garden: ${title}`,
      challengeShareCopy(
        preferences.locale,
        title,
        completedSeconds === undefined ? undefined : formatCounter(completedSeconds),
      ),
    )
  }

  const shareCompletedGame = (completedGame: CompletedGame) => {
    if (completedGame.generatorVersion !== GENERATOR_VERSION) {
      setNotice(t(preferences.locale, 'oldShareUnavailable'))
      return
    }
    const completedTitle = completedGame.theme
      ? themeCopy(preferences.locale, completedGame.theme).title
      : (completedGame.legacyTitle ?? 'Logic Garden')
    shareWithSystemMenu(
      shareUrl(
        {
          difficulty: completedGame.difficulty,
          seed: seed(completedGame.seed),
          generatorVersion: completedGame.generatorVersion,
          variant: completedGame.puzzleVariant ?? 'spatial',
        },
        completedGame.audience,
        completedGame.elapsedSeconds,
      ),
      `Logic Garden: ${completedTitle}`,
      challengeShareCopy(
        preferences.locale,
        completedTitle,
        formatCounter(completedGame.elapsedSeconds),
      ),
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
  const challengeInvite = sharedChallenge
    ? challengeInviteCopy(
        preferences.locale,
        sharedChallenge.benchmarkSeconds === undefined
          ? undefined
          : formatCounter(sharedChallenge.benchmarkSeconds),
      )
    : null

  if (!ready) {
    return <main className="loading-screen">{t(preferences.locale, 'preparing')}</main>
  }

  if (!profile || editingProfile) {
    return (
      <>
        <ProfileSetup
          profile={profile}
          locale={preferences.locale}
          onLocaleChange={(locale) => setPreferences({ ...preferences, locale })}
          onSave={savePlayerProfile}
        />
        <InstallPrompt
          label={t(preferences.locale, 'install')}
          locale={preferences.locale}
          prominent={!profile}
        />
      </>
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
              variant={preferences.puzzleVariant}
              label={t(preferences.locale, 'difficulty')}
              onChange={(difficulty) => setPreferences({ ...preferences, difficulty })}
              onVariantChange={(puzzleVariant) =>
                setPreferences({ ...preferences, puzzleVariant })
              }
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
          shareLabel={t(preferences.locale, 'challengeSomeone')}
          movesLabel={t(preferences.locale, 'moves').toLowerCase()}
          onShare={shareCompletedGame}
        />
        <InstallPrompt label={t(preferences.locale, 'install')} locale={preferences.locale} />
        {showChallengeIntro && challengeInvite && (
          <ChallengeIntroDialog
            title={challengeInvite.title}
            welcome={challengeFirstVisit ? challengeInvite.welcome : undefined}
            message={challengeInvite.message}
            actionLabel={challengeInvite.play}
            onContinue={acceptSharedChallenge}
          />
        )}
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
    game.puzzle.boardMode === 'logic-cube'
      ? 'logicCube'
      : game.puzzle.boardMode === 'logic-grid'
        ? 'logicGrid'
        : 'map',
  )
  const boardInstruction = t(
    preferences.locale,
    game.puzzle.boardMode === 'logic-cube'
      ? 'logicCubeInstruction'
      : game.puzzle.boardMode === 'logic-grid'
        ? 'logicGridInstruction'
        : 'mapInstruction',
  )
  const currentPuzzleVariant: PuzzleVariant =
    game.puzzle.boardMode === 'logic-cube' ? 'cube' : 'spatial'
  const activeBoardCharacterId = activeDragCharacterId ?? game.selectedCharacterId
  const activeDragCharacter = game.puzzle.characters.find(
    (character) => character.id === activeDragCharacterId,
  )
  const gameProgress = progress(game)
  const availableCharacters = unplacedCharacters(game)
  const currentElapsedSeconds = elapsedSeconds(game.startedAt, game.finishedAt)
  const localizedGameFeedback = game.feedback
    ? gameFeedbackCopy(preferences.locale, game.feedback)
    : undefined
  const challengeResult =
    sharedChallenge?.benchmarkSeconds === undefined
      ? null
      : challengeResultCopy(
          preferences.locale,
          formatCounter(sharedChallenge.benchmarkSeconds),
          formatCounter(currentElapsedSeconds),
          currentElapsedSeconds < sharedChallenge.benchmarkSeconds,
        )

  return (
    <main
      className={`app-shell game-screen audience--${activeAudience} theme--${game.puzzle.theme}`}
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
        {localizedGameFeedback ?? notice}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragCancel={() => setActiveDragCharacterId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="game-layout">
          <section className="map-area">
            <div className="map-area__heading">
              <div>
                <p className="eyebrow">{boardTitle}</p>
                <h2>
                  {activeBoardCharacterId
                    ? game.puzzle.characters.find(
                        (character) => character.id === activeBoardCharacterId,
                      )?.name
                    : boardInstruction}
                </h2>
              </div>
              <span className="map-area__prompt">{boardInstruction}</span>
            </div>
            <div
              className="board-view-controls"
              role="group"
              aria-label={t(preferences.locale, 'boardZoom')}
            >
              <button
                type="button"
                aria-pressed={boardZoom === 1}
                onClick={() => setBoardZoom(1)}
              >
                <Scan aria-hidden="true" />
                {t(preferences.locale, 'fitBoard')}
              </button>
              <button
                type="button"
                disabled={boardZoom === 1}
                aria-label={t(preferences.locale, 'zoomOutBoard')}
                onClick={() => setBoardZoom((current) => Math.max(1, current - 0.5))}
              >
                <ZoomOut aria-hidden="true" />
              </button>
              <span className="board-view-controls__value">{Math.round(boardZoom * 100)}%</span>
              <button
                type="button"
                disabled={boardZoom === 2.5}
                aria-label={t(preferences.locale, 'zoomInBoard')}
                onClick={() => setBoardZoom((current) => Math.min(2.5, current + 0.5))}
              >
                <ZoomIn aria-hidden="true" />
              </button>
            </div>
            <div
              ref={boardScrollRef}
              className={`game-board-scroll ${boardZoom > 1 ? 'game-board-scroll--zoomed' : 'game-board-scroll--fit'}`}
            >
              {game.puzzle.boardMode === 'logic-cube' ? (
                <LogicCubeBoard
                  positions={game.puzzle.positions}
                  characters={game.puzzle.characters}
                  assignments={game.assignments}
                  selectedCharacterId={activeBoardCharacterId}
                  draggedCharacterId={activeDragCharacterId ?? undefined}
                  boardLabel={boardTitle}
                  returnLabel={t(preferences.locale, 'returnToTray')}
                  moveToPositionLabel={boardActions.moveToPosition}
                  selectPositionLabel={boardActions.selectPosition}
                  locale={preferences.locale}
                  themeId={game.puzzle.theme}
                  zoom={boardZoom}
                  onMoveToPosition={(positionId) => {
                    if (game.selectedCharacterId) {
                      runGameAction({
                        type: 'move-character',
                        characterId: game.selectedCharacterId,
                        positionId,
                      })
                    } else {
                      setNotice(t(preferences.locale, 'selectPersonFirst'))
                    }
                  }}
                  onRemoveCharacter={(characterId) =>
                    runGameAction({ type: 'remove-character', characterId })
                  }
                />
              ) : (
                <GameBoard
                  positions={game.puzzle.positions}
                  characters={game.puzzle.characters}
                  assignments={game.assignments}
                  selectedCharacterId={activeBoardCharacterId}
                  draggedCharacterId={activeDragCharacterId ?? undefined}
                  boardLabel={boardTitle}
                  emptyLabel={t(preferences.locale, 'emptyPlace')}
                  returnLabel={t(preferences.locale, 'returnToTray')}
                  moveToPositionLabel={boardActions.moveToPosition}
                  selectPositionLabel={boardActions.selectPosition}
                  boardMode={game.puzzle.boardMode}
                  audience={activeAudience}
                  locale={preferences.locale}
                  puzzleSeed={game.puzzle.seed}
                  themeId={game.puzzle.theme}
                  spatialPlanId={game.puzzle.spatialPlanId}
                  zoom={boardZoom}
                  onMoveToPosition={(positionId) => {
                    if (game.selectedCharacterId) {
                      runGameAction({
                        type: 'move-character',
                        characterId: game.selectedCharacterId,
                        positionId,
                      })
                    } else {
                      setNotice(t(preferences.locale, 'selectPersonFirst'))
                    }
                  }}
                  onRemoveCharacter={(characterId) =>
                    runGameAction({ type: 'remove-character', characterId })
                  }
                />
              )}
            </div>
            {game.puzzle.boardMode !== 'map' ? (
              <CharacterClueRail
                puzzle={game.puzzle}
                assignments={game.assignments}
                locale={preferences.locale}
                selectedCharacterId={game.selectedCharacterId}
                label={t(preferences.locale, 'characters')}
                emptyLabel={t(preferences.locale, 'noCharacterClue')}
                previousClueLabel={t(preferences.locale, 'previousClue')}
                nextClueLabel={t(preferences.locale, 'nextClue')}
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
        <DragOverlay dropAnimation={null}>
          {activeDragCharacter && (
            <CharacterTokenPreview character={activeDragCharacter} variant="drag-overlay" />
          )}
        </DragOverlay>
      </DndContext>
      <div className="game-actions" aria-label={t(preferences.locale, 'gameActions')}>
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
          <button type="button" onClick={shareCurrentGame}>
            <Share2 aria-hidden="true" />
            {t(preferences.locale, 'challengeSomeone')}
          </button>
        </div>
        <div className="game-actions__primary">
          <button type="button" onClick={returnToHome}>
            <Home aria-hidden="true" />
            {t(preferences.locale, 'changeDifficulty')}
          </button>
          <button
            type="button"
            onClick={() =>
              startGame(game.puzzle.difficulty, createSeed(), currentPuzzleVariant)
            }
          >
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
      {(localizedGameFeedback || notice) && (
        <p className="feedback" role="status">
          {localizedGameFeedback ?? notice}
        </p>
      )}
      <InstallPrompt label={t(preferences.locale, 'install')} locale={preferences.locale} />
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
          shareLabel={t(
            preferences.locale,
            sharedChallenge ? 'returnChallenge' : 'challengeSomeone',
          )}
          timeLabel={t(preferences.locale, 'timer').toLowerCase()}
          challengeMessage={challengeResult?.message}
          challengeShareHint={challengeResult?.share}
          onNewGame={() =>
            startGame(game.puzzle.difficulty, createSeed(), currentPuzzleVariant)
          }
          onChangeDifficulty={returnToHome}
          onShare={shareCurrentGame}
        />
      )}
    </main>
  )
}
