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
import { AdventureSelector } from './components/AdventureSelector'
import { BoardSizeSelector } from './components/BoardSizeSelector'
import { BuildingSizeSelector } from './components/BuildingSizeSelector'
import { BuildingPlacementSelector } from './components/BuildingPlacementSelector'
import { CheckResultDialog } from './components/CheckResultDialog'
import { ChildMapSizeSelector } from './components/ChildMapSizeSelector'
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
import { JourneyPath, type JourneyStep } from './components/JourneyPath'
import { PuzzleCollectionSelector } from './components/PuzzleCollectionSelector'
import { ResultDialog } from './components/ResultDialog'
import { SceneIcon } from './components/SceneIcon'
import { SettingsDialog } from './components/SettingsDialog'
import {
  boardActionCopy,
  buildingPlacementCopy,
  challengeInviteCopy,
  challengeResultCopy,
  challengeShareCopy,
  checkResultCopy,
  gameFeedbackCopy,
  puzzleCollectionCopy,
  selectedCharacterPlacementCopy,
  t,
  themeCopy,
} from './domain/i18n'
import { buildChildNarrative } from './domain/childNarrative'
import { buildingDepthForPositions } from './domain/buildingPlan'
import { getTheme, themesForPuzzleCollection } from './domain/themes'
import {
  seed,
  type Audience,
  type CharacterId,
  type Difficulty,
  type PuzzleCollection,
  type ThemeId,
} from './domain/types'
import {
  gameReducer,
  createGameState,
  type GameAction,
  type GameState,
} from './game/gameReducer'
import { isCheckFeedback } from './game/feedback'
import { progress } from './game/selectors'
import { elapsedSeconds, formatCounter } from './game/time'
import { generatePuzzle, generatePuzzleForCollection } from './generator/puzzleGenerator'
import { GENERATOR_VERSION } from './generator/version'
import { registerServiceWorker } from './pwa/registerServiceWorker'
import { clearSavedGame, loadSavedGame, saveGame } from './storage/savedGame'
import { hasVisited, markVisited } from './storage/visit'
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

const minimumBoardZoom = 1
const maximumBoardZoom = 2.5

const clampBoardZoom = (zoom: number) =>
  Math.min(maximumBoardZoom, Math.max(minimumBoardZoom, zoom))

const touchDistance = (touches: TouchList) => {
  const first = touches.item(0)
  const second = touches.item(1)
  if (!first || !second) return undefined
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
}

type AppView = 'home' | 'game'
type HomeJourneyStep = JourneyStep

const emptyStatistics: Statistics = {
  schemaVersion: 4,
  completed: 0,
  hintsUsed: 0,
  recentSeeds: [],
  history: [],
}

const HomeScene = ({ collection }: { readonly collection: PuzzleCollection }) => {
  if (collection === 'two-dimensional') {
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

  if (collection === 'three-dimensional') {
    return (
      <div className="home-hero__scene home-hero__scene--three-dimensional" aria-hidden="true">
        <span className="scene-building__roof" />
        <span className="scene-building">
          {Array.from({ length: 3 }, (_, floor) => (
            <i key={floor}>
              <span />
              <span />
              <span />
              <span />
            </i>
          ))}
        </span>
        <span className="scene-building__path" />
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
      <span className="scene-friend scene-friend--one">
        <SceneIcon emoji="👧🏻" />
      </span>
      <span className="scene-friend scene-friend--two">
        <SceneIcon emoji="👦🏼" />
      </span>
      <span className="scene-flower scene-flower--one">✿</span>
      <span className="scene-flower scene-flower--two">✿</span>
    </div>
  )
}

const createSeed = () => globalThis.crypto?.randomUUID?.() ?? `adventure-${Date.now()}`

const gameMatchesSetup = (
  game: GameState,
  preferences: Preferences,
  selectedThemeId: ThemeId,
) => {
  const collection: PuzzleCollection =
    game.puzzle.boardMode === 'logic-cube'
      ? 'three-dimensional'
      : game.puzzle.boardMode === 'logic-grid'
        ? 'two-dimensional'
        : 'children'
  if (collection !== preferences.collection) return false
  if (game.puzzle.theme !== selectedThemeId) return false
  if (collection === 'three-dimensional') {
    return (
      game.puzzle.difficulty === preferences.difficulty &&
      buildingDepthForPositions(game.puzzle.positions) === preferences.buildingDepth &&
      (game.puzzle.buildingPlacement ?? 'cells') === preferences.buildingPlacement
    )
  }
  if (game.puzzle.difficulty !== preferences.difficulty) return false
  if (collection === 'children') {
    return game.puzzle.characters.length === preferences.childMapSize
  }
  return (
    collection !== 'two-dimensional' ||
    Math.sqrt(game.puzzle.positions.length) === preferences.advancedGridSize
  )
}

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [statistics, setStatistics] = useState<Statistics>(emptyStatistics)
  const [game, setGame] = useState<GameState | null>(null)
  const [view, setView] = useState<AppView>('home')
  const [homeJourneyStep, setHomeJourneyStep] = useState<HomeJourneyStep>('collection')
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(
    () => themesForPuzzleCollection('children')[0]!.id,
  )
  const [ready, setReady] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [notice, setNotice] = useState('')
  const [firstVisit, setFirstVisit] = useState(false)
  const [showHintPicker, setShowHintPicker] = useState(false)
  const [showCheckResult, setShowCheckResult] = useState(false)
  const [sharedChallenge, setSharedChallenge] = useState<SharedGameRoute | null>(null)
  const [showChallengeIntro, setShowChallengeIntro] = useState(false)
  const [challengeFirstVisit, setChallengeFirstVisit] = useState(false)
  const [activeDragCharacterId, setActiveDragCharacterId] = useState<CharacterId | null>(null)
  const [boardZoom, setBoardZoom] = useState(1)
  const boardScrollRef = useRef<HTMLDivElement>(null)
  const boardZoomRef = useRef(boardZoom)
  const pinchGestureRef = useRef<{ readonly distance: number; readonly zoom: number } | null>(
    null,
  )
  const setupStepRef = useRef<HTMLDivElement>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )
  const showOfflineReady = useEffectEvent(() => {
    setNotice(t(preferences.locale, 'offlineReady'))
  })

  useEffect(() => {
    let active = true
    const browserLanguages =
      navigator.languages.length > 0 ? navigator.languages : [navigator.language]
    void Promise.all([
      loadPreferences(browserLanguages),
      loadStatistics(),
      loadSavedGame(),
      hasVisited(),
    ]).then(([storedPreferences, storedStatistics, savedGame, visited]) => {
      if (!active) return
      setPreferences(storedPreferences)
      setStatistics(storedStatistics)
      const shared = parseSharedGameRoute(window.location)
      setFirstVisit(!visited)
      setChallengeFirstVisit(!visited)
      void markVisited()
      if (shared) {
        setSharedChallenge(shared)
        setShowChallengeIntro(true)
      } else if (savedGame?.state.status === 'playing') {
        setGame(savedGame.state)
        setSelectedThemeId(savedGame.state.puzzle.theme)
        setView('game')
        setSharedChallenge(savedGame.challenge ?? null)
      } else {
        setSelectedThemeId(themesForPuzzleCollection(storedPreferences.collection)[0]!.id)
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
    document.documentElement.dataset.audience = game
      ? (getTheme(game.puzzle.theme).audience ?? 'children')
      : preferences.collection === 'children'
        ? 'children'
        : preferences.collection === 'two-dimensional'
          ? 'teens'
          : 'adults'
  }, [game, preferences, ready])

  useEffect(() => {
    if (game?.status === 'playing') void saveGame(game, sharedChallenge ?? undefined)
  }, [game, sharedChallenge])

  useEffect(() => {
    boardZoomRef.current = boardZoom
  }, [boardZoom])

  useEffect(() => {
    const scrollArea = boardScrollRef.current
    if (!scrollArea) return
    scrollArea.scrollLeft = 0
    scrollArea.scrollTop = 0
    setBoardZoom(1)
    setActiveDragCharacterId(null)
    pinchGestureRef.current = null
  }, [game?.puzzle.id])

  useEffect(() => {
    if (boardZoom !== 1) return
    const scrollArea = boardScrollRef.current
    if (!scrollArea) return
    scrollArea.scrollLeft = 0
    scrollArea.scrollTop = 0
    pinchGestureRef.current = null
  }, [boardZoom])

  useEffect(() => {
    if (view !== 'game') return undefined
    const scrollArea = boardScrollRef.current
    if (!scrollArea) return undefined

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        pinchGestureRef.current = null
        return
      }
      const distance = touchDistance(event.touches)
      if (!distance) return
      pinchGestureRef.current = { distance, zoom: boardZoomRef.current }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2) return
      const currentDistance = touchDistance(event.touches)
      const gesture = pinchGestureRef.current
      if (!currentDistance || !gesture) return
      event.preventDefault()
      setBoardZoom(
        clampBoardZoom(
          Number((gesture.zoom * (currentDistance / gesture.distance)).toFixed(2)),
        ),
      )
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinchGestureRef.current = null
    }

    scrollArea.addEventListener('touchstart', onTouchStart, { passive: true })
    scrollArea.addEventListener('touchmove', onTouchMove, { passive: false })
    scrollArea.addEventListener('touchend', onTouchEnd)
    scrollArea.addEventListener('touchcancel', onTouchEnd)
    return () => {
      scrollArea.removeEventListener('touchstart', onTouchStart)
      scrollArea.removeEventListener('touchmove', onTouchMove)
      scrollArea.removeEventListener('touchend', onTouchEnd)
      scrollArea.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [game?.puzzle.id, view])

  useEffect(() => {
    if (!ready || view !== 'home') return
    const frame = window.requestAnimationFrame(() => setupStepRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [homeJourneyStep, ready, view])

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
    collection: PuzzleCollection = preferences.collection,
    themeId: ThemeId = selectedThemeId,
  ) => {
    setGenerating(true)
    try {
      const nextGame = createGameState(
        generatePuzzleForCollection(
          difficulty,
          source,
          collection,
          preferences.advancedGridSize,
          preferences.childMapSize,
          preferences.buildingDepth,
          themeId,
          preferences.buildingPlacement,
        ),
      )
      setGame(nextGame)
      setView('game')
      setSharedChallenge(null)
      setShowChallengeIntro(false)
      setShowHintPicker(false)
      setShowCheckResult(false)
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
      resetPageScroll()
      setNotice('')
    } catch {
      setNotice(t(preferences.locale, 'gamePreparationError'))
    } finally {
      setGenerating(false)
    }
  }

  const openHomeJourneyStep = (step: HomeJourneyStep) => {
    setView('home')
    setHomeJourneyStep(step)
    setShowChallengeIntro(false)
    setShowHintPicker(false)
    setShowCheckResult(false)
    window.history.replaceState({}, '', import.meta.env.BASE_URL)
    resetPageScroll()
    setNotice('')
  }

  const returnToHome = () => {
    if (game) setSelectedThemeId(game.puzzle.theme)
    openHomeJourneyStep('difficulty')
  }

  const resumeGame = () => {
    if (!game) return
    setView('game')
    setShowHintPicker(false)
    setShowCheckResult(false)
    resetPageScroll()
    setNotice('')
  }

  const openJourneyStep = (step: JourneyStep) => {
    openHomeJourneyStep(step)
  }

  const acceptSharedChallenge = () => {
    if (!sharedChallenge) return
    setGenerating(true)
    try {
      setPreferences((current) => ({
        ...current,
        difficulty: sharedChallenge.difficulty,
        collection:
          sharedChallenge.variant === 'cube'
            ? 'three-dimensional'
            : sharedChallenge.audience === 'children'
              ? 'children'
              : 'two-dimensional',
        ...(sharedChallenge.gridSize ? { advancedGridSize: sharedChallenge.gridSize } : {}),
        ...(sharedChallenge.childMapSize ? { childMapSize: sharedChallenge.childMapSize } : {}),
        ...(sharedChallenge.buildingDepth
          ? { buildingDepth: sharedChallenge.buildingDepth }
          : {}),
        ...(sharedChallenge.buildingPlacement
          ? { buildingPlacement: sharedChallenge.buildingPlacement }
          : {}),
      }))
      const acceptedGame = createGameState(
        generatePuzzle(
          sharedChallenge.difficulty,
          sharedChallenge.seed,
          sharedChallenge.audience,
          sharedChallenge.variant ?? 'spatial',
          sharedChallenge.gridSize,
          sharedChallenge.childMapSize,
          sharedChallenge.buildingDepth,
          sharedChallenge.buildingPlacement ?? 'cells',
        ),
      )
      setGame(acceptedGame)
      setSelectedThemeId(acceptedGame.puzzle.theme)
      setView('game')
      setShowChallengeIntro(false)
      setShowCheckResult(false)
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
      : (getTheme(game.puzzle.theme).audience ?? 'adults')
    : preferences.collection === 'children'
      ? 'children'
      : preferences.collection === 'two-dimensional'
        ? 'teens'
        : 'adults'

  const runGameAction = (action: GameAction) => {
    if (!game) return
    const nextGame = gameReducer(game, action)
    setGame(nextGame)
    if (action.type === 'check') setShowCheckResult(nextGame.status !== 'won')
    if (action.type === 'check' && nextGame.status === 'won' && game.status !== 'won') {
      void clearSavedGame()
      const finishedAt = nextGame.finishedAt ?? Date.now()
      const completion = {
        seed: nextGame.puzzle.seed,
        theme: nextGame.puzzle.theme,
        difficulty: nextGame.puzzle.difficulty,
        generatorVersion: nextGame.puzzle.metadata.generatorVersion,
        elapsedSeconds: elapsedSeconds(nextGame.startedAt, finishedAt),
        moves: nextGame.moves,
        hintsUsed: nextGame.hintsUsed,
      }
      void recordCompletion(
        nextGame.puzzle.boardMode === 'logic-cube'
          ? {
              ...completion,
              puzzleVariant: 'cube',
              audience: activeAudience === 'children' ? 'adults' : activeAudience,
              buildingDepth: buildingDepthForPositions(nextGame.puzzle.positions),
              buildingPlacement: nextGame.puzzle.buildingPlacement ?? 'cells',
            }
          : nextGame.puzzle.boardMode === 'logic-grid'
            ? {
                ...completion,
                puzzleVariant: 'spatial',
                audience: activeAudience === 'children' ? 'adults' : activeAudience,
                gridSize: Math.sqrt(nextGame.puzzle.positions.length) as 6 | 9 | 16,
              }
            : {
                ...completion,
                puzzleVariant: 'spatial',
                audience: 'children',
                childMapSize: nextGame.puzzle.characters.length as 4 | 6 | 8,
              },
      ).then(setStatistics)
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
    if (!game) return
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
          ...(game.puzzle.boardMode === 'logic-grid'
            ? { gridSize: Math.sqrt(game.puzzle.positions.length) as 6 | 9 | 16 }
            : game.puzzle.boardMode === 'map'
              ? { childMapSize: game.puzzle.characters.length as 4 | 6 | 8 }
              : { buildingDepth: buildingDepthForPositions(game.puzzle.positions) }),
          ...(game.puzzle.boardMode === 'logic-cube'
            ? { buildingPlacement: game.puzzle.buildingPlacement ?? 'cells' }
            : {}),
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
          gridSize: completedGame.gridSize,
          childMapSize: completedGame.childMapSize,
          buildingDepth: completedGame.buildingDepth,
          buildingPlacement: completedGame.buildingPlacement,
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

  const journeySteps: Readonly<Record<JourneyStep, string>> = {
    collection: t(preferences.locale, 'collectionStep'),
    mode: buildingPlacementCopy(preferences.locale).step,
    size: t(preferences.locale, 'sizeStep'),
    difficulty: t(preferences.locale, 'difficultyStep'),
    adventure: t(preferences.locale, 'adventureStep'),
  }

  if (!game || view === 'home') {
    const heroCopy = puzzleCollectionCopy(preferences.locale, preferences.collection)
    const homeAudience =
      preferences.collection === 'children'
        ? 'children'
        : preferences.collection === 'two-dimensional'
          ? 'teens'
          : 'adults'
    const canResumeCurrentSetup = game
      ? gameMatchesSetup(game, preferences, selectedThemeId)
      : false
    const homeJourneyOrder: readonly JourneyStep[] =
      preferences.collection === 'three-dimensional'
        ? ['collection', 'mode', 'size', 'difficulty', 'adventure']
        : ['collection', 'size', 'difficulty', 'adventure']
    const currentJourneyIndex = homeJourneyOrder.indexOf(homeJourneyStep)
    const normalizedJourneyStep =
      currentJourneyIndex >= 0 ? homeJourneyStep : homeJourneyOrder[0]!
    const normalizedJourneyIndex = homeJourneyOrder.indexOf(normalizedJourneyStep)
    const furthestJourneyStep = canResumeCurrentSetup
      ? homeJourneyOrder.at(-1)!
      : homeJourneyOrder[Math.min(homeJourneyOrder.length - 1, normalizedJourneyIndex + 1)]!
    return (
      <main
        className={`app-shell home-screen audience--${homeAudience} collection--${preferences.collection}`}
      >
        <GameHeader
          online={online}
          connectionLabel={connectionLabel}
          homeLabel={t(preferences.locale, 'goHome')}
          settingsLabel={t(preferences.locale, 'settings')}
          onOpenSettings={() => setShowSettings(true)}
          onGoHome={() => openHomeJourneyStep('collection')}
        />
        <JourneyPath
          label={t(preferences.locale, 'journeyPath')}
          currentStep={normalizedJourneyStep}
          furthestStep={furthestJourneyStep}
          steps={journeySteps}
          stepOrder={homeJourneyOrder}
          previousLabel={t(preferences.locale, 'previousStep')}
          nextLabel={t(preferences.locale, 'nextStep')}
          canGoPrevious={normalizedJourneyIndex > 0}
          canGoNext={normalizedJourneyIndex < homeJourneyOrder.length - 1}
          onPrevious={() => {
            const previous = homeJourneyOrder[normalizedJourneyIndex - 1]
            if (previous) openHomeJourneyStep(previous)
          }}
          onNext={() => {
            const next = homeJourneyOrder[normalizedJourneyIndex + 1]
            if (next) openHomeJourneyStep(next)
          }}
          onStepChange={openJourneyStep}
        />
        <section
          className={`home-hero ${normalizedJourneyStep === 'collection' ? '' : 'home-hero--setup'}`}
        >
          <div className="home-hero__copy">
            <p className="eyebrow">{heroCopy.eyebrow}</p>
            <h1>{heroCopy.title}</h1>
            <p className="home-hero__description">{heroCopy.description}</p>
            <div
              ref={setupStepRef}
              className="setup-step"
              tabIndex={-1}
              role="group"
              aria-label={journeySteps[normalizedJourneyStep]}
            >
              {normalizedJourneyStep === 'collection' && (
                <PuzzleCollectionSelector
                  value={preferences.collection}
                  locale={preferences.locale}
                  label={t(preferences.locale, 'puzzleCollection')}
                  onChange={(collection) => {
                    setPreferences({ ...preferences, collection })
                    setSelectedThemeId(themesForPuzzleCollection(collection)[0]!.id)
                  }}
                />
              )}
              {normalizedJourneyStep === 'mode' && (
                <BuildingPlacementSelector
                  value={preferences.buildingPlacement}
                  locale={preferences.locale}
                  onChange={(buildingPlacement) =>
                    setPreferences({ ...preferences, buildingPlacement })
                  }
                />
              )}
              {normalizedJourneyStep === 'size' &&
                (preferences.collection === 'children' ? (
                  <ChildMapSizeSelector
                    value={preferences.childMapSize}
                    locale={preferences.locale}
                    label={t(preferences.locale, 'childMapSize')}
                    onChange={(childMapSize) =>
                      setPreferences({ ...preferences, childMapSize })
                    }
                  />
                ) : preferences.collection === 'two-dimensional' ? (
                  <BoardSizeSelector
                    value={preferences.advancedGridSize}
                    locale={preferences.locale}
                    label={t(preferences.locale, 'boardSize')}
                    onChange={(advancedGridSize) =>
                      setPreferences({ ...preferences, advancedGridSize })
                    }
                  />
                ) : (
                  <BuildingSizeSelector
                    value={preferences.buildingDepth}
                    locale={preferences.locale}
                    label={t(preferences.locale, 'buildingSize')}
                    onChange={(buildingDepth) =>
                      setPreferences({ ...preferences, buildingDepth })
                    }
                  />
                ))}
              {normalizedJourneyStep === 'difficulty' && (
                <DifficultySelector
                  value={preferences.difficulty}
                  locale={preferences.locale}
                  collection={preferences.collection}
                  label={t(preferences.locale, 'difficulty')}
                  onChange={(difficulty) => setPreferences({ ...preferences, difficulty })}
                />
              )}
              {normalizedJourneyStep === 'adventure' && (
                <>
                  <AdventureSelector
                    value={selectedThemeId}
                    collection={preferences.collection}
                    locale={preferences.locale}
                    label={t(preferences.locale, 'chooseAdventure')}
                    onChange={setSelectedThemeId}
                  />
                  <div className="home-hero__actions">
                    <button
                      type="button"
                      className="button button--large"
                      disabled={generating}
                      onClick={() => (canResumeCurrentSetup ? resumeGame() : startGame())}
                    >
                      <span aria-hidden="true">✦</span>{' '}
                      {generating
                        ? '…'
                        : t(preferences.locale, canResumeCurrentSetup ? 'resumeGame' : 'play')}
                    </button>
                    <p className="home-stat">
                      <strong>{statistics.completed}</strong>{' '}
                      {t(preferences.locale, 'adventuresCompleted')}
                    </p>
                  </div>
                </>
              )}
            </div>
            <details className="how-it-works">
              <summary>{t(preferences.locale, 'howItWorks')}</summary>
              <p>{t(preferences.locale, 'howToPlayText')}</p>
            </details>
          </div>
          <HomeScene collection={preferences.collection} />
        </section>
        <CompletedGames
          games={statistics.history}
          locale={preferences.locale}
          title={t(preferences.locale, 'completedGames')}
          shareLabel={t(preferences.locale, 'challengeSomeone')}
          movesLabel={t(preferences.locale, 'moves').toLowerCase()}
          onShare={shareCompletedGame}
        />
        <InstallPrompt
          label={t(preferences.locale, 'install')}
          locale={preferences.locale}
          prominent={firstVisit}
        />
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

  const childNarrative =
    game.puzzle.boardMode === 'map'
      ? buildChildNarrative(game.puzzle, preferences.locale)
      : undefined
  const localizedTheme = themeCopy(preferences.locale, game.puzzle.theme)
  const copy =
    childNarrative ??
    (game.puzzle.boardMode === 'logic-cube'
      ? {
          ...localizedTheme,
          title: game.puzzle.title,
          introduction: game.puzzle.introduction,
          objective: game.puzzle.objective,
        }
      : localizedTheme)
  const boardActions = boardActionCopy(preferences.locale)
  const boardTitle = t(
    preferences.locale,
    game.puzzle.boardMode === 'logic-cube'
      ? 'logicCube'
      : game.puzzle.boardMode === 'logic-grid'
        ? 'logicGrid'
        : 'map',
  )
  const boardInstruction =
    game.puzzle.boardMode === 'logic-cube' && game.puzzle.buildingPlacement === 'rooms'
      ? buildingPlacementCopy(preferences.locale).roomInstruction
      : t(
          preferences.locale,
          game.puzzle.boardMode === 'logic-cube'
            ? 'logicCubeInstruction'
            : game.puzzle.boardMode === 'logic-grid'
              ? 'logicGridInstruction'
              : 'mapInstruction',
        )
  const currentPuzzleCollection: PuzzleCollection =
    game.puzzle.boardMode === 'logic-cube'
      ? 'three-dimensional'
      : game.puzzle.boardMode === 'logic-grid'
        ? 'two-dimensional'
        : 'children'
  const activeBoardCharacterId = activeDragCharacterId ?? game.selectedCharacterId
  const activeDragCharacter = game.puzzle.characters.find(
    (character) => character.id === activeDragCharacterId,
  )
  const gameProgress = progress(game)
  const currentElapsedSeconds = elapsedSeconds(game.startedAt, game.finishedAt)
  const checkFeedback =
    game.feedback && isCheckFeedback(game.feedback) ? game.feedback : undefined
  const checkResult = checkFeedback
    ? checkResultCopy(preferences.locale, checkFeedback, preferences.showCheckProgress)
    : undefined
  const localizedGameFeedback =
    game.feedback && !isCheckFeedback(game.feedback)
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
      <JourneyPath
        label={t(preferences.locale, 'journeyPath')}
        currentStep="adventure"
        furthestStep="adventure"
        steps={journeySteps}
        stepOrder={
          currentPuzzleCollection === 'three-dimensional'
            ? ['collection', 'mode', 'size', 'difficulty', 'adventure']
            : ['collection', 'size', 'difficulty', 'adventure']
        }
        previousLabel={t(preferences.locale, 'previousStep')}
        nextLabel={t(preferences.locale, 'nextStep')}
        canGoPrevious
        canGoNext={false}
        onPrevious={returnToHome}
        onNext={() => undefined}
        onStepChange={openJourneyStep}
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
        <div className="game-counter">
          <GameTimer
            startedAt={game.startedAt}
            finishedAt={game.finishedAt}
            label={t(preferences.locale, 'timer')}
          />
        </div>
      </section>
      <p className="objective-line">{copy.objective}</p>
      {childNarrative && (
        <section className="illustrated-story-premise" aria-label={copy.title}>
          <strong>{copy.introduction}</strong>
          <span>{copy.objective}</span>
        </section>
      )}
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
            <div className="map-area__toolbar">
              <div className="map-area__heading">
                <div>
                  <p className="eyebrow">{boardTitle}</p>
                  <h2>
                    {activeBoardCharacterId
                      ? selectedCharacterPlacementCopy(
                          preferences.locale,
                          game.puzzle.characters.find(
                            (character) => character.id === activeBoardCharacterId,
                          )?.name ?? '',
                        )
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
                  aria-label={t(preferences.locale, 'fitBoard')}
                  aria-pressed={boardZoom === 1}
                  onClick={() => setBoardZoom(1)}
                >
                  <Scan aria-hidden="true" />
                  <span className="board-view-controls__fit-label">
                    {t(preferences.locale, 'fitBoard')}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={boardZoom === 1}
                  aria-label={t(preferences.locale, 'zoomOutBoard')}
                  onClick={() => setBoardZoom((current) => clampBoardZoom(current - 0.5))}
                >
                  <ZoomOut aria-hidden="true" />
                </button>
                <span className="board-view-controls__value">
                  {Math.round(boardZoom * 100)}%
                </span>
                <button
                  type="button"
                  disabled={boardZoom === maximumBoardZoom}
                  aria-label={t(preferences.locale, 'zoomInBoard')}
                  onClick={() => setBoardZoom((current) => clampBoardZoom(current + 0.5))}
                >
                  <ZoomIn aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              ref={boardScrollRef}
              className={`game-board-scroll ${boardZoom > 1 ? 'game-board-scroll--zoomed' : 'game-board-scroll--fit'}`}
            >
              {game.puzzle.boardMode === 'logic-cube' ? (
                <LogicCubeBoard
                  positions={game.puzzle.positions}
                  buildingPlacement={game.puzzle.buildingPlacement ?? 'cells'}
                  characters={game.puzzle.characters}
                  items={game.puzzle.items}
                  assignments={game.assignments}
                  selectedCharacterId={activeBoardCharacterId}
                  draggedCharacterId={activeDragCharacterId ?? undefined}
                  boardLabel={boardTitle}
                  elevatorLabel={t(preferences.locale, 'elevator')}
                  floorUpLabel={t(preferences.locale, 'floorUp')}
                  floorDownLabel={t(preferences.locale, 'floorDown')}
                  returnLabel={t(preferences.locale, 'returnToTray')}
                  moveToPositionLabel={boardActions.moveToPosition}
                  selectPositionLabel={boardActions.selectPosition}
                  locale={preferences.locale}
                  themeId={game.puzzle.theme}
                  puzzleSeed={game.puzzle.seed}
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
            <CharacterClueRail
              puzzle={game.puzzle}
              narrative={childNarrative}
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
            className="game-action game-action--undo"
            onClick={() => runGameAction({ type: 'undo' })}
            disabled={game.past.length === 0}
          >
            <Undo2 aria-hidden="true" />
            {t(preferences.locale, 'undo')}
          </button>
          <button
            type="button"
            className="game-action game-action--redo"
            onClick={() => runGameAction({ type: 'redo' })}
            disabled={game.future.length === 0}
          >
            <Redo2 aria-hidden="true" />
            {t(preferences.locale, 'redo')}
          </button>
          <button
            type="button"
            className="game-action game-action--restart"
            onClick={() => runGameAction({ type: 'reset' })}
          >
            <RotateCcw aria-hidden="true" />
            {t(preferences.locale, 'restart')}
          </button>
          <button type="button" className="game-action game-action--hint" onClick={requestHint}>
            <Lightbulb aria-hidden="true" />
            {t(preferences.locale, 'hint')}
          </button>
          <button
            type="button"
            className="game-action game-action--share"
            onClick={shareCurrentGame}
          >
            <Share2 aria-hidden="true" />
            {t(preferences.locale, 'share')}
          </button>
        </div>
        <div className="game-actions__primary">
          <button
            type="button"
            className="game-action game-action--home"
            onClick={returnToHome}
          >
            <Home aria-hidden="true" />
            {t(preferences.locale, 'changeDifficulty')}
          </button>
          <button
            type="button"
            className="game-action game-action--new"
            onClick={() =>
              startGame(
                game.puzzle.difficulty,
                createSeed(),
                currentPuzzleCollection,
                game.puzzle.theme,
              )
            }
          >
            <Shuffle aria-hidden="true" />
            {t(preferences.locale, 'newGame')}
          </button>
          <button
            type="button"
            className="button game-action game-action--check"
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
      {showCheckResult && checkResult && (
        <CheckResultDialog
          title={checkResult.title}
          message={checkResult.message}
          score={checkResult.score}
          continueLabel={t(preferences.locale, 'continuePlaying')}
          closeLabel={t(preferences.locale, 'close')}
          onClose={() => setShowCheckResult(false)}
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
          progressLabel={checkResult?.score}
          onNewGame={() =>
            startGame(
              game.puzzle.difficulty,
              createSeed(),
              currentPuzzleCollection,
              game.puzzle.theme,
            )
          }
          onChangeDifficulty={returnToHome}
          onShare={shareCurrentGame}
        />
      )}
    </main>
  )
}
