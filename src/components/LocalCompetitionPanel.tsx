import { Camera, Copy, QrCode, Share2, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
// cspell:ignore qrcode
import type { CompetitionParticipant, CompetitionProfile } from '../multiplayer/protocol'
import { cameraSupported } from '../multiplayer/signaling'
import type { LocalCompetitionState } from '../multiplayer/useLocalCompetition'

interface LocalCompetitionPanelProps {
  readonly state: LocalCompetitionState
  readonly canStartRound: boolean
  readonly onProfileChange: (profile: CompetitionProfile) => void
  readonly onCreateOffer: () => void
  readonly onAcceptOffer: (code: string) => void
  readonly onAcceptAnswer: (code: string) => void
  readonly onStartRound: () => void
  readonly onReset: () => void
}

type ScanTarget = 'offer' | 'answer'

interface BarcodeDetection {
  readonly rawValue: string
}

interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<readonly BarcodeDetection[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { readonly formats?: readonly string[] }): BarcodeDetectorInstance
}

const connectionCopy = (state: LocalCompetitionState) => {
  if (!state.supported) return 'Aquest navegador no permet WebRTC DataChannel.'
  if (state.connectionState === 'idle') return 'Crea o uneix-te a una partida de grup.'
  if (state.connectionState === 'waiting-answer')
    return 'Fes que l’altre dispositiu escanegi aquest QR.'
  if (state.connectionState === 'waiting-master')
    return 'Mostra aquest QR al master per completar la connexió.'
  if (state.connectionState === 'connected') return 'Connexió directa activa.'
  if (state.connectionState === 'error')
    return state.error || 'La connexió no s’ha pogut completar.'
  return 'Preparant la connexió directa.'
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
      <textarea value={value} readOnly rows={3} aria-label={`${label} en text`} />
      <div className="competition-panel__inline-actions">
        <button
          type="button"
          onClick={() => {
            void copyText(value).then(() => setCopied(true))
          }}
        >
          <Copy aria-hidden="true" />
          {copied ? 'Copiat' : 'Copiar'}
        </button>
        <button type="button" onClick={() => void shareText(`Logic Garden · ${label}`, value)}>
          <Share2 aria-hidden="true" />
          Compartir codi
        </button>
      </div>
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let frame = 0
    let stream: MediaStream | null = null
    const detector =
      'BarcodeDetector' in window
        ? new (window.BarcodeDetector as BarcodeDetectorConstructor)({ formats: ['qr_code'] })
        : null
    if (!detector) {
      setError(
        'Aquest navegador no llegeix QR amb la càmera. Pots enganxar el codi manualment.',
      )
      return () => {
        active = false
      }
    }
    const scan = () => {
      if (!active) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (context && canvas.width > 0 && canvas.height > 0) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          void detector.detect(canvas).then((results) => {
            const value = results[0]?.rawValue
            if (!active || !value) return
            onCode(value)
            onClose()
          })
        }
      }
      frame = window.requestAnimationFrame(scan)
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((nextStream) => {
        if (!active) {
          nextStream.getTracks().forEach((track) => track.stop())
          return
        }
        stream = nextStream
        if (videoRef.current) {
          videoRef.current.srcObject = nextStream
          void videoRef.current.play()
        }
        scan()
      })
      .catch(() => setError('No hem pogut obrir la càmera. Pots enganxar el codi manualment.'))
    return () => {
      active = false
      window.cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onClose, onCode])

  return (
    <div className="competition-panel__scanner" role="dialog" aria-modal="true">
      <div>
        <h3>{target === 'offer' ? 'Escaneja la invitació' : 'Escaneja la resposta'}</h3>
        <video ref={videoRef} muted playsInline />
        <canvas ref={canvasRef} hidden />
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={onClose}>
          Tancar càmera
        </button>
      </div>
    </div>
  )
}

export const LocalCompetitionPanel = ({
  state,
  canStartRound,
  onProfileChange,
  onCreateOffer,
  onAcceptOffer,
  onAcceptAnswer,
  onStartRound,
  onReset,
}: LocalCompetitionPanelProps) => {
  const [offerInput, setOfferInput] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [scanTarget, setScanTarget] = useState<ScanTarget | null>(null)
  const standings = sortedParticipants(state.participants)
  const connectedParticipants = state.participants.filter(
    (participant) => participant.connected,
  )
  const roundComplete =
    connectedParticipants.length > 0 &&
    state.activeRound !== undefined &&
    connectedParticipants.every((participant) =>
      state.results.some(
        (result) =>
          result.roundId === state.activeRound?.id && result.participantId === participant.id,
      ),
    )

  return (
    <section id="local-competition" className="competition-panel" aria-label="Joc en grup">
      <div className="competition-panel__header">
        <span aria-hidden="true">
          <Users />
        </span>
        <div>
          <p className="eyebrow">Mode grup sense servidor</p>
          <h2>Joc en grup</h2>
          <p>
            Connecta dispositius amb QR i WebRTC. Tothom resol el mateix puzzle i el master
            espera que acabin els participants connectats.
          </p>
        </div>
      </div>
      <div className="competition-panel__profile">
        <label>
          Nom visible
          <input
            value={state.profile.name}
            maxLength={40}
            onChange={(event) =>
              onProfileChange({ ...state.profile, name: event.currentTarget.value })
            }
          />
        </label>
        <label>
          Avatar
          <input
            value={state.profile.avatar}
            maxLength={8}
            onChange={(event) =>
              onProfileChange({ ...state.profile, avatar: event.currentTarget.value })
            }
          />
        </label>
      </div>
      <p className="competition-panel__status">{connectionCopy(state)}</p>
      <div className="competition-panel__columns">
        <div>
          <h3>Master</h3>
          <button type="button" onClick={onCreateOffer} disabled={!state.supported}>
            <QrCode aria-hidden="true" />
            Crear QR d’invitació
          </button>
          <QrPayload label="Invitació de partida" value={state.offerCode} />
          <label>
            Resposta del participant
            <textarea
              value={answerInput}
              rows={3}
              onChange={(event) => setAnswerInput(event.currentTarget.value)}
            />
          </label>
          <div className="competition-panel__inline-actions">
            <button type="button" onClick={() => onAcceptAnswer(answerInput)}>
              Acceptar resposta
            </button>
            {cameraSupported() && (
              <button type="button" onClick={() => setScanTarget('answer')}>
                <Camera aria-hidden="true" />
                Escanejar resposta
              </button>
            )}
          </div>
          <button
            type="button"
            className="button"
            disabled={!canStartRound || state.role !== 'master'}
            onClick={onStartRound}
          >
            Iniciar ronda per a tothom
          </button>
        </div>
        <div>
          <h3>Participant</h3>
          <label>
            Invitació del master
            <textarea
              value={offerInput}
              rows={3}
              onChange={(event) => setOfferInput(event.currentTarget.value)}
            />
          </label>
          <div className="competition-panel__inline-actions">
            <button type="button" onClick={() => onAcceptOffer(offerInput)}>
              Crear resposta
            </button>
            {cameraSupported() && (
              <button type="button" onClick={() => setScanTarget('offer')}>
                <Camera aria-hidden="true" />
                Escanejar invitació
              </button>
            )}
          </div>
          <QrPayload label="Resposta al master" value={state.answerCode} />
        </div>
      </div>
      {standings.length > 0 && (
        <div className="competition-panel__standings">
          <h3>Classificació</h3>
          <ol>
            {standings.map((participant) => (
              <li key={participant.id}>
                <span>
                  {participant.avatar} {participant.name}
                </span>
                <span>
                  {participant.roundsFinished} rondes · {participant.cumulativeSeconds}s
                </span>
              </li>
            ))}
          </ol>
          {roundComplete && (
            <p role="status">
              Tothom ha acabat aquesta ronda. El master pot iniciar-ne una altra.
            </p>
          )}
        </div>
      )}
      <button type="button" className="competition-panel__reset" onClick={onReset}>
        Tancar sala local
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {scanTarget && (
        <Scanner
          target={scanTarget}
          onCode={(code) => {
            if (scanTarget === 'offer') {
              setOfferInput(code)
              void onAcceptOffer(code)
            } else {
              setAnswerInput(code)
              void onAcceptAnswer(code)
            }
          }}
          onClose={() => setScanTarget(null)}
        />
      )}
    </section>
  )
}
