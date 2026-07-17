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

const profileKey = 'logic-garden:competition-profile:v1'
const iceTimeoutMs = 1800

const avatars = ['🙂', '😄', '🧭', '🌿', '⭐', '🎧', '🏀', '📚'] as const

const createId = () =>
  globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 16) ??
  `peer${Date.now().toString(36)}`

const defaultProfile = (): CompetitionProfile => ({
  id: createId(),
  name: 'Jugador',
  avatar: avatars[Math.floor(Math.random() * avatars.length)] ?? '🙂',
})

const loadProfile = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(profileKey) ?? '') as unknown
    if (!parsed || typeof parsed !== 'object') return defaultProfile()
    const candidate = parsed as Record<string, unknown>
    if (
      typeof candidate.id === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.avatar === 'string'
    ) {
      return {
        id: candidate.id,
        name: candidate.name.slice(0, 40) || 'Jugador',
        avatar: candidate.avatar.slice(0, 16) || '🙂',
      }
    }
    return defaultProfile()
  } catch {
    return defaultProfile()
  }
}

const saveProfile = (profile: CompetitionProfile) => {
  localStorage.setItem(profileKey, JSON.stringify(profile))
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
    const profile = loadProfile()
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

  const handlePeerMessage = (message: PeerCompetitionMessage, channel: RTCDataChannel) => {
    const current = stateRef.current
    if (current.lobbyId && message.lobbyId !== current.lobbyId) return
    if (message.type === 'hello') {
      const nextParticipant = participantFromProfile(
        message.profile,
        'participant',
        true,
        current.results,
      )
      const nextParticipants = mergeParticipants(current.participants, nextParticipant)
      setState((previous) => ({
        ...previous,
        participants: mergeParticipants(previous.participants, nextParticipant),
      }))
      channel.send(
        encodePeerCompetitionMessage({
          type: 'standings',
          lobbyId: message.lobbyId,
          participants: nextParticipants,
          results: stateRef.current.results,
        }),
      )
      return
    }
    if (message.type === 'round-started') {
      setState((previous) => ({
        ...previous,
        activeRound: message.round,
        connectionState: 'connected',
      }))
      onRoundReceivedRef.current(message.round)
      return
    }
    if (message.type === 'round-finished') {
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
      window.setTimeout(broadcastStandings, 0)
      return
    }
    if (message.type === 'standings') {
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
      const current = stateRef.current
      if (!current.lobbyId) return
      channel.send(
        encodePeerCompetitionMessage({
          type: 'hello',
          lobbyId: current.lobbyId,
          profile: current.profile,
        }),
      )
      setState((previous) => ({ ...previous, connectionState: 'connected', error: '' }))
    })
    channel.addEventListener('close', () => {
      channelsRef.current.delete(peerId)
    })
    channel.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') return
      const decoded = decodePeerCompetitionMessage(event.data)
      if (decoded) handlePeerMessage(decoded, channel)
    })
  }

  const createConnection = () => {
    const connection = new RTCPeerConnection({ iceServers: [] })
    return connection
  }

  const setProfile = (profile: CompetitionProfile) => {
    const cleanProfile = {
      id: stateRef.current.profile.id,
      name: profile.name.trim().slice(0, 40) || 'Jugador',
      avatar: profile.avatar.trim().slice(0, 16) || '🙂',
    }
    saveProfile(cleanProfile)
    setState((previous) => ({
      ...previous,
      profile: cleanProfile,
      participants:
        previous.role === 'master'
          ? mergeParticipants(
              previous.participants,
              participantFromProfile(cleanProfile, 'master', true, previous.results),
            )
          : previous.participants,
    }))
  }

  const createOffer = async () => {
    if (!stateRef.current.supported) return
    const lobbyId = createId()
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
      participants: [
        participantFromProfile(previous.profile, 'master', true, previous.results),
      ],
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
    try {
      await connection.setRemoteDescription(envelope.description)
      setState((previous) => ({
        ...previous,
        connectionState: 'connected',
        error: '',
        participants: mergeParticipants(
          previous.participants,
          participantFromProfile(envelope.profile, 'participant', true, previous.results),
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
    window.setTimeout(broadcastStandings, 0)
  }

  const reset = () => {
    for (const channel of channelsRef.current.values()) channel.close()
    for (const connection of connectionsRef.current.values()) connection.close()
    channelsRef.current.clear()
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
    setProfile,
    createOffer,
    acceptOffer,
    acceptAnswer,
    startRound,
    submitResult,
    reset,
  }
}
