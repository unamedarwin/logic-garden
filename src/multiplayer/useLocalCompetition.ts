import { useEffect, useRef, useState } from 'react'
import {
  decodePeerCompetitionMessage,
  encodePeerCompetitionMessage,
  type CompetitionParticipant,
  type CompetitionProfile,
  type CompetitionRound,
  type CompetitionRoundResult,
  type CompetitionSetup,
  type PeerCompetitionMessage,
} from './protocol'
import { decodeSignalEnvelope, encodeSignalEnvelope, type SignalEnvelope } from './signaling'

export type CompetitionConnectionState =
  | 'idle'
  | 'creating-offer'
  | 'waiting-answer'
  | 'creating-answer'
  | 'waiting-master'
  | 'connected'
  | 'unsupported'
  | 'error'

export interface LocalCompetitionState {
  readonly supported: boolean
  readonly role: 'master' | 'participant' | null
  readonly lobbyId: string | null
  readonly connectionState: CompetitionConnectionState
  readonly profile: CompetitionProfile
  readonly participants: readonly CompetitionParticipant[]
  readonly results: readonly CompetitionRoundResult[]
  readonly activeRound?: CompetitionRound
  readonly selectedSetup?: CompetitionSetup
  readonly offerCode: string
  readonly answerCode: string
  readonly error: string
}

const iceTimeoutMs = 8000
const connectionTimeoutMs = 30_000

const temporaryProfiles = [
  { names: ['Roure alegre', 'Roure valent', 'Roure serè', 'Roure curiós'], avatar: '🌳' },
  { names: ['Lluna clara', 'Lluna riallera', 'Lluna serena', 'Lluna curiosa'], avatar: '🌙' },
  { names: ['Corall curiós', 'Corall viu', 'Corall amable', 'Corall valent'], avatar: '🪸' },
  {
    names: ['Brúixola viva', 'Brúixola curiosa', 'Brúixola valenta', 'Brúixola alegre'],
    avatar: '🧭',
  },
  { names: ['Estel brillant', 'Estel veloç', 'Estel serè', 'Estel juganer'], avatar: '⭐' },
  { names: ['Menta fresca', 'Menta alegre', 'Menta viva', 'Menta curiosa'], avatar: '🌿' },
  {
    names: ['Cometa veloç', 'Cometa brillant', 'Cometa valent', 'Cometa curiós'],
    avatar: '☄️',
  },
  {
    names: ['Onada tranquil·la', 'Onada alegre', 'Onada valenta', 'Onada curiosa'],
    avatar: '🌊',
  },
  { names: ['Gla juganera', 'Gla valenta', 'Gla alegre', 'Gla curiosa'], avatar: '🌰' },
  { names: ['Núvol serè', 'Núvol alegre', 'Núvol valent', 'Núvol curiós'], avatar: '☁️' },
  { names: ['Far brillant', 'Far amable', 'Far valent', 'Far serè'], avatar: '🗼' },
  { names: ['Còdol rodó', 'Còdol alegre', 'Còdol valent', 'Còdol curiós'], avatar: '🪨' },
] as const

const temporaryOrigins = [
  'del bosc',
  'de la costa',
  'del jardí',
  'de la plaça',
  'del cel',
  'del camí',
] as const

const createId = () =>
  globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 16) ??
  `peer${Date.now().toString(36)}`

const defaultProfile = (): CompetitionProfile => {
  const id = createId()
  const hash = [...id].reduce(
    (total, character) => Math.imul(total ^ character.charCodeAt(0), 16_777_619) >>> 0,
    2_166_136_261,
  )
  const preset = temporaryProfiles[hash % temporaryProfiles.length] ?? temporaryProfiles[0]
  const name = preset.names[Math.floor(hash / temporaryProfiles.length) % preset.names.length]
  const origin =
    temporaryOrigins[
      Math.floor(hash / (temporaryProfiles.length * preset.names.length)) %
        temporaryOrigins.length
    ] ?? temporaryOrigins[0]
  return {
    id,
    name: `${name ?? preset.names[0]} ${origin}`,
    avatar: preset.avatar,
  }
}

const waitForIceGathering = (connection: RTCPeerConnection) =>
  new Promise<void>((resolve) => {
    if (connection.iceGatheringState === 'complete') {
      resolve()
      return
    }
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      connection.removeEventListener('icegatheringstatechange', onChange)
      window.clearTimeout(timer)
      resolve()
    }
    const onChange = () => {
      if (connection.iceGatheringState === 'complete') finish()
    }
    const timer = window.setTimeout(finish, iceTimeoutMs)
    connection.addEventListener('icegatheringstatechange', onChange)
  })

const participantFromProfile = (
  profile: CompetitionProfile,
  role: CompetitionParticipant['role'],
  connected: boolean,
  results: readonly CompetitionRoundResult[],
): CompetitionParticipant => {
  const ownResults = results.filter((result) => result.participantId === profile.id)
  return {
    ...profile,
    role,
    connected,
    cumulativeSeconds: ownResults.reduce((total, result) => total + result.elapsedSeconds, 0),
    roundsFinished: ownResults.length,
  }
}

const mergeParticipants = (
  current: readonly CompetitionParticipant[],
  next: CompetitionParticipant,
) => {
  const without = current.filter((participant) => participant.id !== next.id)
  return [...without, next].sort((first, second) =>
    first.role === second.role
      ? first.name.localeCompare(second.name)
      : first.role.localeCompare(second.role),
  )
}

export const useLocalCompetition = (onRoundReceived: (round: CompetitionRound) => void) => {
  const [state, setState] = useState<LocalCompetitionState>(() => {
    const supported = typeof RTCPeerConnection !== 'undefined'
    const profile = defaultProfile()
    return {
      supported,
      role: null,
      lobbyId: null,
      connectionState: supported ? 'idle' : 'unsupported',
      profile,
      participants: [],
      results: [],
      offerCode: '',
      answerCode: '',
      error: '',
    }
  })
  const stateRef = useRef(state)
  const connectionsRef = useRef(new Map<string, RTCPeerConnection>())
  const channelsRef = useRef(new Map<string, RTCDataChannel>())
  const peerProfilesRef = useRef(new Map<string, CompetitionProfile>())
  const connectionTimersRef = useRef(new Map<string, number>())
  const pendingPeerIdRef = useRef<string | null>(null)
  const sessionVersionRef = useRef(0)
  const onRoundReceivedRef = useRef(onRoundReceived)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    onRoundReceivedRef.current = onRoundReceived
  }, [onRoundReceived])

  useEffect(
    () => () => {
      for (const channel of channelsRef.current.values()) channel.close()
      for (const connection of connectionsRef.current.values()) connection.close()
      for (const timer of connectionTimersRef.current.values()) window.clearTimeout(timer)
    },
    [],
  )

  const sendToPeers = (message: PeerCompetitionMessage) => {
    for (const channel of channelsRef.current.values()) {
      if (channel.readyState === 'open') channel.send(encodePeerCompetitionMessage(message))
    }
  }

  useEffect(() => {
    if (state.role !== 'master' || !state.lobbyId) return
    const snapshot: PeerCompetitionMessage = {
      type: 'standings',
      lobbyId: state.lobbyId,
      participants: state.participants,
      results: state.results,
      ...(state.selectedSetup ? { selectedSetup: state.selectedSetup } : {}),
    }
    const encoded = encodePeerCompetitionMessage(snapshot)
    for (const channel of channelsRef.current.values()) {
      if (channel.readyState === 'open') channel.send(encoded)
    }
  }, [state.lobbyId, state.participants, state.results, state.role, state.selectedSetup])

  const handlePeerMessage = (message: PeerCompetitionMessage, peerId: string) => {
    const current = stateRef.current
    const peerProfile = peerProfilesRef.current.get(peerId)
    if (current.lobbyId && message.lobbyId !== current.lobbyId) return
    if (message.type === 'hello') {
      if (peerProfile && message.profile.id !== peerProfile.id) return
      const peerRole = current.role === 'participant' ? 'master' : 'participant'
      const nextParticipant = participantFromProfile(
        message.profile,
        peerRole,
        true,
        current.results,
      )
      setState((previous) => ({
        ...previous,
        participants: mergeParticipants(previous.participants, nextParticipant),
      }))
      return
    }
    if (message.type === 'round-started') {
      if (current.role !== 'participant') return
      setState((previous) => ({
        ...previous,
        activeRound: message.round,
        connectionState: 'connected',
      }))
      onRoundReceivedRef.current(message.round)
      return
    }
    if (message.type === 'setup-selected') {
      if (current.role !== 'participant') return
      setState((previous) => ({ ...previous, selectedSetup: message.setup }))
      return
    }
    if (message.type === 'peer-left') {
      if (!peerProfile || message.profileId !== peerProfile.id) return
      if (current.role === 'participant') {
        sessionVersionRef.current += 1
        for (const channel of channelsRef.current.values()) channel.close()
        for (const connection of connectionsRef.current.values()) connection.close()
        channelsRef.current.clear()
        connectionsRef.current.clear()
        peerProfilesRef.current.clear()
        setState((previous) => ({
          ...previous,
          connectionState: 'error',
          participants: previous.participants.map((participant) => ({
            ...participant,
            connected: participant.id === previous.profile.id,
          })),
          error: 'El creador ha tancat la sala.',
        }))
      }
      return
    }
    if (message.type === 'round-finished') {
      if (!peerProfile || message.result.participantId !== peerProfile.id) return
      setState((previous) => {
        if (
          previous.results.some(
            (result) =>
              result.participantId === message.result.participantId &&
              result.roundId === message.result.roundId,
          )
        ) {
          return previous
        }
        const results = [...previous.results, message.result]
        const participants = previous.participants.map((participant) =>
          participant.id === message.result.participantId
            ? participantFromProfile(
                participant,
                participant.role,
                participant.connected,
                results,
              )
            : participant,
        )
        return { ...previous, results, participants }
      })
      return
    }
    if (message.type === 'standings') {
      if (current.role === 'master') return
      setState((previous) => ({
        ...previous,
        participants: message.participants,
        results: message.results,
        selectedSetup: message.selectedSetup,
      }))
    }
  }

  const attachChannel = (peerId: string, channel: RTCDataChannel) => {
    const sessionVersion = sessionVersionRef.current
    channelsRef.current.set(peerId, channel)
    channel.addEventListener('open', () => {
      const connectionTimer = connectionTimersRef.current.get(peerId)
      if (connectionTimer !== undefined) window.clearTimeout(connectionTimer)
      connectionTimersRef.current.delete(peerId)
      if (pendingPeerIdRef.current === peerId) pendingPeerIdRef.current = null
      const current = stateRef.current
      if (!current.lobbyId) return
      const peerProfile = peerProfilesRef.current.get(peerId)
      channel.send(
        encodePeerCompetitionMessage({
          type: 'hello',
          lobbyId: current.lobbyId,
          profile: current.profile,
        }),
      )
      setState((previous) => ({
        ...previous,
        connectionState: 'connected',
        offerCode: '',
        answerCode: '',
        error: '',
        participants: peerProfile
          ? mergeParticipants(
              previous.participants,
              participantFromProfile(
                peerProfile,
                previous.role === 'participant' ? 'master' : 'participant',
                true,
                previous.results,
              ),
            )
          : previous.participants,
      }))
    })
    channel.addEventListener('close', () => {
      if (sessionVersion !== sessionVersionRef.current) return
      channelsRef.current.delete(peerId)
      const peerProfile = peerProfilesRef.current.get(peerId)
      if (!peerProfile) return
      setState((previous) => ({
        ...previous,
        connectionState: [...channelsRef.current.values()].some(
          (candidate) => candidate.readyState === 'open',
        )
          ? 'connected'
          : previous.role === 'master'
            ? 'idle'
            : 'error',
        error:
          previous.role === 'participant'
            ? 'S’ha tancat la connexió directa. Torneu a crear la invitació.'
            : previous.error,
        participants: previous.participants.map((participant) =>
          participant.id === peerProfile.id
            ? { ...participant, connected: false }
            : participant,
        ),
      }))
    })
    channel.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return
      const decoded = decodePeerCompetitionMessage(event.data)
      if (decoded) handlePeerMessage(decoded, peerId)
    })
  }

  const createConnection = () => {
    const connection = new RTCPeerConnection({ iceServers: [] })
    return connection
  }

  const createOffer = async () => {
    if (!stateRef.current.supported) return
    const current = stateRef.current
    const continuingLobby = current.role === 'master' && current.lobbyId !== null
    const lobbyId = continuingLobby ? current.lobbyId : createId()
    const peerId = createId()
    pendingPeerIdRef.current = peerId
    const connection = createConnection()
    const channel = connection.createDataChannel('logic-garden')
    attachChannel(peerId, channel)
    connectionsRef.current.set(peerId, connection)
    setState((previous) => ({
      ...previous,
      role: 'master',
      lobbyId,
      connectionState: 'creating-offer',
      offerCode: '',
      answerCode: '',
      error: '',
      participants: continuingLobby
        ? previous.participants
        : [participantFromProfile(previous.profile, 'master', true, previous.results)],
    }))
    try {
      const offer = await connection.createOffer()
      await connection.setLocalDescription(offer)
      await waitForIceGathering(connection)
      const description = connection.localDescription?.toJSON()
      if (!description) throw new Error('offer')
      const envelope: SignalEnvelope = {
        v: 1,
        kind: 'offer',
        lobbyId,
        peerId,
        profile: stateRef.current.profile,
        description,
      }
      setState((previous) => ({
        ...previous,
        connectionState: 'waiting-answer',
        offerCode: encodeSignalEnvelope(envelope),
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        connectionState: 'error',
        error: 'No hem pogut crear el QR d’invitació.',
      }))
    }
  }

  const acceptOffer = async (code: string) => {
    const envelope = decodeSignalEnvelope(code)
    if (!envelope || envelope.kind !== 'offer') {
      setState((previous) => ({
        ...previous,
        error: 'Aquest codi no és una invitació vàlida.',
      }))
      return
    }
    const peerId = envelope.peerId
    pendingPeerIdRef.current = peerId
    peerProfilesRef.current.set(peerId, envelope.profile)
    const connection = createConnection()
    connection.addEventListener('datachannel', (event) => attachChannel(peerId, event.channel))
    connectionsRef.current.set(peerId, connection)
    setState((previous) => ({
      ...previous,
      role: 'participant',
      lobbyId: envelope.lobbyId,
      connectionState: 'creating-answer',
      offerCode: code,
      answerCode: '',
      error: '',
      participants: [
        participantFromProfile(envelope.profile, 'master', false, previous.results),
        participantFromProfile(previous.profile, 'participant', true, previous.results),
      ],
    }))
    try {
      await connection.setRemoteDescription(envelope.description)
      const answer = await connection.createAnswer()
      await connection.setLocalDescription(answer)
      await waitForIceGathering(connection)
      const description = connection.localDescription?.toJSON()
      if (!description) throw new Error('answer')
      setState((previous) => ({
        ...previous,
        connectionState: 'waiting-master',
        answerCode: encodeSignalEnvelope({
          v: 1,
          kind: 'answer',
          lobbyId: envelope.lobbyId,
          peerId,
          profile: previous.profile,
          description,
        }),
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        connectionState: 'error',
        error: 'No hem pogut crear el QR de resposta.',
      }))
    }
  }

  const acceptAnswer = async (code: string) => {
    const envelope = decodeSignalEnvelope(code)
    const connection = envelope ? connectionsRef.current.get(envelope.peerId) : undefined
    if (!envelope || envelope.kind !== 'answer' || !connection) {
      setState((previous) => ({ ...previous, error: 'Aquest codi no és una resposta vàlida.' }))
      return
    }
    peerProfilesRef.current.set(envelope.peerId, envelope.profile)
    try {
      await connection.setRemoteDescription(envelope.description)
      const timer = window.setTimeout(() => {
        const channel = channelsRef.current.get(envelope.peerId)
        if (channel?.readyState === 'open') return
        connection.close()
        connectionsRef.current.delete(envelope.peerId)
        channelsRef.current.delete(envelope.peerId)
        connectionTimersRef.current.delete(envelope.peerId)
        setState((previous) => ({
          ...previous,
          connectionState: [...channelsRef.current.values()].some(
            (candidate) => candidate.readyState === 'open',
          )
            ? 'connected'
            : 'error',
          error:
            'La connexió directa no ha respost. Comproveu que sou a la mateixa xarxa i torneu-ho a provar.',
        }))
      }, connectionTimeoutMs)
      connectionTimersRef.current.set(envelope.peerId, timer)
      setState((previous) => ({
        ...previous,
        connectionState: 'creating-answer',
        error: '',
        participants: mergeParticipants(
          previous.participants,
          participantFromProfile(envelope.profile, 'participant', false, previous.results),
        ),
      }))
    } catch {
      setState((previous) => ({
        ...previous,
        connectionState: 'error',
        error: 'No hem pogut completar la connexió amb aquesta resposta.',
      }))
    }
  }

  const startRound = (round: CompetitionRound) => {
    const current = stateRef.current
    if (current.role !== 'master' || !current.lobbyId) return
    const message: PeerCompetitionMessage = {
      type: 'round-started',
      lobbyId: current.lobbyId,
      round,
    }
    sendToPeers(message)
    setState((previous) => ({
      ...previous,
      activeRound: round,
      selectedSetup: {
        collection: round.collection,
        difficulty: round.metadata.difficulty,
        themeId: round.themeId,
        size:
          round.metadata.childMapSize ??
          round.metadata.gridSize ??
          round.metadata.buildingDepth ??
          0,
        ...(round.metadata.buildingPlacement
          ? { buildingPlacement: round.metadata.buildingPlacement }
          : {}),
      },
    }))
    onRoundReceivedRef.current(round)
  }

  const submitResult = (result: CompetitionRoundResult) => {
    const current = stateRef.current
    if (!current.lobbyId) return
    const message: PeerCompetitionMessage = {
      type: 'round-finished',
      lobbyId: current.lobbyId,
      result,
    }
    setState((previous) => {
      if (
        previous.results.some(
          (candidate) =>
            candidate.participantId === result.participantId &&
            candidate.roundId === result.roundId,
        )
      ) {
        return previous
      }
      const results = [...previous.results, result]
      return {
        ...previous,
        results,
        participants: previous.participants.map((participant) =>
          participant.id === result.participantId
            ? participantFromProfile(
                participant,
                participant.role,
                participant.connected,
                results,
              )
            : participant,
        ),
      }
    })
    sendToPeers(message)
  }

  const reset = () => {
    sessionVersionRef.current += 1
    for (const channel of channelsRef.current.values()) channel.close()
    for (const connection of connectionsRef.current.values()) connection.close()
    for (const timer of connectionTimersRef.current.values()) window.clearTimeout(timer)
    channelsRef.current.clear()
    peerProfilesRef.current.clear()
    connectionTimersRef.current.clear()
    connectionsRef.current.clear()
    pendingPeerIdRef.current = null
    setState((previous) => ({
      ...previous,
      role: null,
      lobbyId: null,
      connectionState: previous.supported ? 'idle' : 'unsupported',
      participants: [],
      results: [],
      offerCode: '',
      answerCode: '',
      activeRound: undefined,
      selectedSetup: undefined,
      error: '',
    }))
  }

  const cancelPairing = () => {
    const peerId = pendingPeerIdRef.current
    if (!peerId) return
    const channel = channelsRef.current.get(peerId)
    const connection = connectionsRef.current.get(peerId)
    channel?.close()
    connection?.close()
    channelsRef.current.delete(peerId)
    connectionsRef.current.delete(peerId)
    peerProfilesRef.current.delete(peerId)
    const timer = connectionTimersRef.current.get(peerId)
    if (timer !== undefined) window.clearTimeout(timer)
    connectionTimersRef.current.delete(peerId)
    pendingPeerIdRef.current = null
    const hasOpenChannel = [...channelsRef.current.values()].some(
      (candidate) => candidate.readyState === 'open',
    )
    if (!hasOpenChannel && stateRef.current.role === 'participant') {
      reset()
      return
    }
    setState((previous) => ({
      ...previous,
      connectionState: hasOpenChannel ? 'connected' : 'idle',
      offerCode: '',
      answerCode: '',
      error: '',
    }))
  }

  const disconnect = () => {
    const current = stateRef.current
    if (current.lobbyId) {
      sendToPeers({
        type: 'peer-left',
        lobbyId: current.lobbyId,
        profileId: current.profile.id,
      })
    }
    reset()
  }

  const updateSetup = (setup: CompetitionSetup) => {
    const current = stateRef.current
    if (current.role !== 'master' || !current.lobbyId) return
    setState((previous) => ({ ...previous, selectedSetup: setup }))
    sendToPeers({ type: 'setup-selected', lobbyId: current.lobbyId, setup })
  }

  return {
    state,
    createOffer,
    acceptOffer,
    acceptAnswer,
    startRound,
    submitResult,
    cancelPairing,
    disconnect,
    updateSetup,
    reset,
  }
}
