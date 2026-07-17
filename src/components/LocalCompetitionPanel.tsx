import { Camera, Copy, QrCode, Share2, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
// cspell:ignore qrcode testid emparellament
import type { CompetitionParticipant } from '../multiplayer/protocol'
import { cameraSupported } from '../multiplayer/signaling'
import type { LocalCompetitionState } from '../multiplayer/useLocalCompetition'
import { useDialogFocus } from './useDialogFocus'

interface LocalCompetitionPanelProps {
  readonly state: LocalCompetitionState
  readonly canStartRound: boolean
  readonly roundInProgress: boolean
  readonly selectedSetupLabel?: string
  readonly onClose: () => void
  readonly onCreateOffer: () => void
  readonly onAcceptOffer: (code: string) => void
  readonly onAcceptAnswer: (code: string) => void
  readonly onStartRound: () => void
  readonly onConfigureGame: () => void
  readonly onCancelPairing: () => void
  readonly onDisconnect: () => void
}

type CompetitionScreen = 'choose' | 'master' | 'participant'
type ScanTarget = 'offer' | 'answer'

const connectionCopy = (state: LocalCompetitionState, connectedCount: number) => {
  if (!state.supported) return 'Aquest navegador no permet el joc en grup.'
  if (connectedCount > 1 && state.connectionState !== 'error') {
    return state.connectionState === 'connected'
      ? 'Sala connectada. Podeu continuar encara que tanquis aquesta finestra.'
      : 'La sala continua connectada mentre preparem una altra invitació.'
  }
  if (state.connectionState === 'creating-offer') return 'Preparant la invitació…'
  if (state.connectionState === 'waiting-answer')
    return 'Esperant la resposta de l’altre dispositiu.'
  if (state.connectionState === 'creating-answer') return 'Completant la connexió…'
  if (state.connectionState === 'waiting-master')
    return 'Falta que qui ha creat la partida accepti la resposta.'
  if (state.connectionState === 'connected') return 'Connexió directa activa. Ja podeu jugar.'
  if (state.connectionState === 'error')
    return state.error || 'No hem pogut completar la connexió.'
  return 'Tria com vols entrar a la partida.'
}

const sortedParticipants = (participants: readonly CompetitionParticipant[]) =>
  [...participants].sort((first, second) => {
    if (first.cumulativeSeconds !== second.cumulativeSeconds) {
      return first.cumulativeSeconds - second.cumulativeSeconds
    }
    return second.roundsFinished - first.roundsFinished
  })

const copyText = async (text: string) => navigator.clipboard.writeText(text)

const shareText = async (title: string, text: string) => {
  if (navigator.share) {
    await navigator.share({ title, text })
    return
  }
  await copyText(text)
}

const QrPayload = ({ label, value }: { readonly label: string; readonly value: string }) => {
  const [copied, setCopied] = useState(false)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let active = true
    if (!value) {
      setSvg('')
      return () => {
        active = false
      }
    }
    void import('qrcode-generator').then((module) => {
      if (!active) return
      const qr = module.default(0, 'M')
      qr.addData(value)
      qr.make()
      setSvg(qr.createSvgTag({ scalable: true, margin: 2 }))
    })
    return () => {
      active = false
    }
  }, [value])

  if (!value) return null
  return (
    <div className="competition-panel__qr">
      <div
        className="competition-panel__qr-image"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="competition-panel__inline-actions">
        <button type="button" onClick={() => void shareText(`Logic Garden · ${label}`, value)}>
          <Share2 aria-hidden="true" /> Compartir
        </button>
        <button
          type="button"
          onClick={() => {
            void copyText(value).then(() => setCopied(true))
          }}
        >
          <Copy aria-hidden="true" /> {copied ? 'Copiat' : 'Copiar'}
        </button>
      </div>
      <details>
        <summary>Veure el codi en text</summary>
        <textarea value={value} readOnly rows={3} aria-label={`${label} en text`} />
      </details>
    </div>
  )
}

const Scanner = ({
  target,
  onCode,
  onClose,
}: {
  readonly target: ScanTarget
  readonly onCode: (code: string) => void
  readonly onClose: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let scanner: { start: () => Promise<void>; destroy: () => void } | null = null

    const start = async () => {
      try {
        const video = videoRef.current
        if (!video) return
        const QrScanner = (await import('qr-scanner')).default
        if (!active) return
        scanner = new QrScanner(
          video,
          (result) => {
            if (!active) return
            onCode(result.data)
            onClose()
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        )
        await scanner.start()
      } catch {
        if (active) setError('No hem pogut obrir la càmera. També pots enganxar el codi.')
      }
    }

    void start()
    return () => {
      active = false
      scanner?.destroy()
    }
  }, [onClose, onCode])

  return (
    <div className="competition-panel__scanner settings-backdrop" role="presentation">
      <section className="settings-dialog" role="dialog" aria-modal="true">
        <div className="dialog-heading">
          <h3>{target === 'offer' ? 'Escaneja la invitació' : 'Escaneja la resposta'}</h3>
          <button type="button" className="icon-button" aria-label="Tancar" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>
        <video ref={videoRef} muted playsInline />
        {error && <p role="alert">{error}</p>}
      </section>
    </div>
  )
}

export const LocalCompetitionPanel = ({
  state,
  canStartRound,
  roundInProgress,
  selectedSetupLabel,
  onClose,
  onCreateOffer,
  onAcceptOffer,
  onAcceptAnswer,
  onStartRound,
  onConfigureGame,
  onCancelPairing,
  onDisconnect,
}: LocalCompetitionPanelProps) => {
  const dialogRef = useDialogFocus(onClose)
  const [screen, setScreen] = useState<CompetitionScreen>(state.role ?? 'choose')
  const [offerInput, setOfferInput] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [scanTarget, setScanTarget] = useState<ScanTarget | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const standings = sortedParticipants(state.participants)
  const activeScreen = state.role ?? screen
  const connectedParticipants = state.participants.filter(
    (participant) => participant.connected,
  )
  const isPairing =
    state.connectionState === 'creating-offer' ||
    state.connectionState === 'waiting-answer' ||
    state.connectionState === 'creating-answer' ||
    state.connectionState === 'waiting-master'
  const hasConnectedRoom = connectedParticipants.length > 1

  useEffect(() => {
    if (state.role) setScreen(state.role)
  }, [state.role])

  const createInvitation = () => {
    setAnswerInput('')
    onCreateOffer()
  }

  return (
    <div className="settings-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="settings-dialog competition-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="competition-title"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Dos dispositius, un mateix misteri</p>
            <h2 id="competition-title">
              {hasConnectedRoom ? `Connectat · ${connectedParticipants.length}` : 'Joc en grup'}
            </h2>
          </div>
          <button type="button" className="icon-button" aria-label="Tancar" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>

        {activeScreen === 'choose' ? (
          <div className="competition-panel__step">
            <ol className="competition-panel__progress" aria-label="Com funciona">
              <li aria-current="step">Tria el teu paper</li>
              <li>Connecta els dispositius</li>
              <li>Jugueu al mateix puzzle</li>
            </ol>
            <p>Una persona crea la sala. La resta s’hi uneix amb dos escanejos.</p>
            <button type="button" className="button" onClick={() => setScreen('master')}>
              <QrCode aria-hidden="true" /> Crear una partida
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setScreen('participant')}
            >
              <Camera aria-hidden="true" /> Unir-m’hi
            </button>
          </div>
        ) : (
          <div className="competition-panel__step">
            <ol className="competition-panel__progress" aria-label="Progrés de la connexió">
              <li>Paper triat</li>
              <li aria-current="step">
                {hasConnectedRoom ? 'Dispositius connectats' : 'Connecta'}
              </li>
              <li>Jugueu</li>
            </ol>
            <p className="competition-panel__identity">
              <span aria-hidden="true">{state.profile.avatar}</span>
              <span>
                Tu ets <strong>{state.profile.name}</strong> en aquesta sala
              </span>
            </p>
            <p className="competition-panel__status" role="status">
              {connectionCopy(state, connectedParticipants.length)}
            </p>

            {activeScreen === 'master' && state.connectionState === 'idle' && (
              <button type="button" className="button" onClick={createInvitation}>
                <QrCode aria-hidden="true" /> Crear invitació
              </button>
            )}
            {activeScreen === 'master' && state.offerCode && isPairing && (
              <>
                <p>1. L’altra persona ha d’escanejar o rebre aquesta invitació.</p>
                <QrPayload label="Invitació de partida" value={state.offerCode} />
                <p>2. Escaneja la resposta que apareixerà al seu dispositiu.</p>
                {cameraSupported() && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => setScanTarget('answer')}
                  >
                    <Camera aria-hidden="true" /> Escanejar resposta
                  </button>
                )}
                <details>
                  <summary>Enganxar la resposta</summary>
                  <textarea
                    value={answerInput}
                    rows={3}
                    aria-label="Resposta del participant"
                    onChange={(event) => setAnswerInput(event.currentTarget.value)}
                  />
                  <button type="button" onClick={() => onAcceptAnswer(answerInput)}>
                    Acceptar resposta
                  </button>
                </details>
              </>
            )}
            {activeScreen === 'participant' && !state.answerCode && (
              <>
                {cameraSupported() && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => setScanTarget('offer')}
                  >
                    <Camera aria-hidden="true" /> Escanejar invitació
                  </button>
                )}
                <details>
                  <summary>Enganxar la invitació</summary>
                  <textarea
                    value={offerInput}
                    rows={3}
                    aria-label="Invitació del creador"
                    onChange={(event) => setOfferInput(event.currentTarget.value)}
                  />
                  <button type="button" onClick={() => onAcceptOffer(offerInput)}>
                    Preparar resposta
                  </button>
                </details>
              </>
            )}
            {activeScreen === 'participant' &&
              state.answerCode &&
              state.connectionState !== 'connected' && (
                <>
                  <p>Mostra aquesta resposta a qui ha creat la partida.</p>
                  <QrPayload label="Resposta al creador" value={state.answerCode} />
                </>
              )}
            {hasConnectedRoom && (
              <div className="competition-panel__connected">
                <p>
                  <Users aria-hidden="true" />
                  <strong>{connectedParticipants.length} participants connectats</strong>
                </p>
                <ul className="competition-panel__people" aria-label="Participants connectats">
                  {connectedParticipants.map((participant) => (
                    <li key={participant.id}>
                      <span aria-hidden="true">{participant.avatar}</span> {participant.name}
                      <small>
                        {participant.role === 'master' ? 'Creador' : 'Participant'}
                        {participant.id === state.profile.id ? ' · Tu' : ''}
                      </small>
                    </li>
                  ))}
                </ul>
                <div className="competition-panel__selection" data-testid="group-setup-summary">
                  <span>{roundInProgress ? 'Ronda en curs' : 'Puzzle seleccionat'}</span>
                  <strong>
                    {state.activeRound?.title ??
                      selectedSetupLabel ??
                      (state.role === 'master'
                        ? 'Encara no has triat el puzzle'
                        : 'El creador està triant el puzzle')}
                  </strong>
                </div>
                {state.role === 'master' && !roundInProgress && !isPairing && (
                  <div className="competition-panel__lobby-actions">
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={onConfigureGame}
                    >
                      Escollir o canviar el puzzle
                    </button>
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={createInvitation}
                    >
                      <QrCode aria-hidden="true" /> Afegir participant
                    </button>
                    <button
                      type="button"
                      className="button"
                      disabled={!canStartRound}
                      onClick={onStartRound}
                    >
                      Jugar amb aquesta selecció
                    </button>
                  </div>
                )}
                {state.role === 'participant' && !roundInProgress && (
                  <p>El creador triarà el puzzle i iniciarà la ronda per a tothom.</p>
                )}
                {roundInProgress && <p>La sala queda oberta mentre completeu la ronda.</p>}
              </div>
            )}
            {standings.some((participant) => participant.roundsFinished > 0) && (
              <ol>
                {standings.map((participant) => (
                  <li key={participant.id}>
                    {participant.avatar} {participant.name}: {participant.cumulativeSeconds}s
                  </li>
                ))}
              </ol>
            )}
            {state.error && <p role="alert">{state.error}</p>}
            {isPairing && (
              <button type="button" onClick={onCancelPairing}>
                Cancel·lar l’emparellament
              </button>
            )}
            {!hasConnectedRoom && !isPairing && state.role && (
              <button type="button" onClick={() => setConfirmDisconnect(true)}>
                Canviar de paper
              </button>
            )}
            {hasConnectedRoom && (
              <button type="button" onClick={() => setConfirmDisconnect(true)}>
                {state.role === 'master' ? 'Tancar la sala' : 'Desconnectar-me'}
              </button>
            )}
            {confirmDisconnect && (
              <div className="competition-panel__confirmation" role="alertdialog">
                <strong>
                  {state.role === 'master'
                    ? 'Vols tancar la sala per a tothom?'
                    : 'Vols desconnectar-te de la sala?'}
                </strong>
                <p>Aquesta acció sí que tancarà la connexió directa.</p>
                <div className="competition-panel__inline-actions">
                  <button type="button" onClick={() => setConfirmDisconnect(false)}>
                    Continuar connectat
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      onDisconnect()
                      setScreen('choose')
                      setConfirmDisconnect(false)
                    }}
                  >
                    {state.role === 'master' ? 'Sí, tancar la sala' : 'Sí, desconnectar-me'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {scanTarget && (
          <Scanner
            target={scanTarget}
            onCode={(code) => {
              if (scanTarget === 'offer') {
                setOfferInput(code)
                onAcceptOffer(code)
              } else {
                setAnswerInput(code)
                onAcceptAnswer(code)
              }
            }}
            onClose={() => setScanTarget(null)}
          />
        )}
      </section>
    </div>
  )
}
