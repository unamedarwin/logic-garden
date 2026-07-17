import { useEffect, useRef, useState } from 'react'
import {
  decodePeerCompetitionMessage,
  encodePeerCompetitionMessage,
  type CompetitionParticipant,
  type CompetitionProfile,
  type CompetitionRound,
  type CompetitionRoundResult,
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
  readonly offerCode: string
  readonly answerCode: string
  readonly error: string
}

const iceTimeoutMs = 8000
const connectionTimeoutMs = 30_000

const temporaryProfiles = [
  { name: 'Roure', avatar: '🌳' },
  { name: 'Lluna', avatar: '🌙' },
  { name: 'Corall', avatar: '🪸' },
  { name: 'Brúixola', avatar: '🧭' },
  { name: 'Estel', avatar: '⭐' },
  { name: 'Menta', avatar: '🌿' },
  { name: 'Cometa', avatar: '☄️' },
  { name: 'Onada', avatar: '🌊' },
] as const

const createId = () =>
  globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 16) ??
  `peer${Date.now().toString(36)}`

const defaultProfile = (): CompetitionProfile => {
  const id = createId()
  const index = [...id].reduce((total, character) => total + character.charCodeAt(0), 0)
  const preset = temporaryProfiles[index % temporaryProfiles.length] ?? temporaryProfiles[0]
  return {
    id,
    name: `${preset.name} ${id.slice(0, 2).toUpperCase()}`,
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

  const broadcastStandings = () => {
    const current = stateRef.current
    if (!current.lobbyId) return
    const message: PeerCompetitionMessage = {
      type: 'standings',
      lobbyId: current.lobbyId,
      participants: current.participants,
      results: current.results,
    }
    for (const channel of channelsRef.current.values()) {
      if (channel.readyState === 'open') channel.send(encodePeerCompetitionMessage(message))
    }
  }

  const sendToPeers = (message: PeerCompetitionMessage) => {
    for (const channel of channelsRef.current.values()) {
      if (channel.readyState === 'open') channel.send(encodePeerCompetitionMessage(message))
    }
  }

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
      const nextParticipants = mergeParticipants(current.participants, nextParticipant)
      setState((previous) => ({
        ...previous,
        participants: mergeParticipants(previous.participants, nextParticipant),
      }))
      if (current.role === 'master') {
        const standings: PeerCompetitionMessage = {
          type: 'standings',
          lobbyId: message.lobbyId,
          participants: nextParticipants,
          results: current.results,
        }
        const encoded = encodePeerCompetitionMessage(standings)
        for (const peerChannel of channelsRef.current.values()) {
          if (peerChannel.readyState === 'open') peerChannel.send(encoded)
        }
      }
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
      if (current.role === 'master') window.setTimeout(broadcastStandings, 0)
      return
    }
    if (message.type === 'standings') {
      if (current.role === 'master') return
      setState((previous) => ({
        ...previous,
        participants: message.participants,
        results: message.results,
      }))
    }
  }

  const attachChannel = (peerId: string, channel: RTCDataChannel) => {
    channelsRef.current.set(peerId, channel)
    channel.addEventListener('open', () => {
      const connectionTimer = connectionTimersRef.current.get(peerId)
      if (connectionTimer !== undefined) window.clearTimeout(connectionTimer)
      connectionTimersRef.current.delete(peerId)
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
        participantFromProfile(envelope.profile, 'master', true, previous.results),
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
    setState((previous) => ({ ...previous, activeRound: round }))
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
    if (current.role === 'master') window.setTimeout(broadcastStandings, 0)
  }

  const reset = () => {
    for (const channel of channelsRef.current.values()) channel.close()
    for (const connection of connectionsRef.current.values()) connection.close()
    for (const timer of connectionTimersRef.current.values()) window.clearTimeout(timer)
    channelsRef.current.clear()
    peerProfilesRef.current.clear()
    connectionTimersRef.current.clear()
    connectionsRef.current.clear()
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
      error: '',
    }))
  }

  return {
    state,
    createOffer,
    acceptOffer,
    acceptAnswer,
    startRound,
    submitResult,
    reset,
  }
}
