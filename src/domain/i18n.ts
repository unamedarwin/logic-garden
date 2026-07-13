import type { Audience, Locale, ThemeId } from './types'
import type { GameFeedback } from '../game/feedback'

export const supportedLocales: readonly Locale[] = ['ca', 'es', 'en']

export const localeLabels: Record<Locale, string> = {
  ca: 'Català',
  es: 'Castellano',
  en: 'English',
}

type UiKey =
  | 'play'
  | 'howItWorks'
  | 'settings'
  | 'newGame'
  | 'changeDifficulty'
  | 'goHome'
  | 'check'
  | 'hint'
  | 'undo'
  | 'redo'
  | 'restart'
  | 'clues'
  | 'characters'
  | 'progress'
  | 'moves'
  | 'share'
  | 'copied'
  | 'online'
  | 'offline'
  | 'updateReady'
  | 'update'
  | 'difficulty'
  | 'language'
  | 'close'
  | 'reducedMotion'
  | 'sound'
  | 'emptyPlace'
  | 'map'
  | 'logicGrid'
  | 'logicCube'
  | 'board'
  | 'gameViews'
  | 'hintsUsed'
  | 'install'
  | 'heroEyebrow'
  | 'heroTitle'
  | 'heroDescription'
  | 'howToPlayText'
  | 'adventuresCompleted'
  | 'adventure'
  | 'mapInstruction'
  | 'logicGridInstruction'
  | 'logicCubeInstruction'
  | 'profileEyebrow'
  | 'profileTitle'
  | 'profileDescription'
  | 'profileName'
  | 'profileNamePlaceholder'
  | 'audience'
  | 'avatar'
  | 'continue'
  | 'saveProfile'
  | 'editProfile'
  | 'returnToTray'
  | 'noCharacterClue'
  | 'timer'
  | 'completedGames'
  | 'shared'
  | 'oldShareUnavailable'
  | 'hintPickerTitle'
  | 'hintPickerDescription'
  | 'previousClue'
  | 'nextClue'
  | 'challengeSomeone'
  | 'returnChallenge'
  | 'offlineReady'
  | 'gamePreparationError'
  | 'preparing'
  | 'selectPersonFirst'
  | 'gameActions'
  | 'boardZoom'
  | 'fitBoard'
  | 'zoomInBoard'
  | 'zoomOutBoard'

const ui: Record<Locale, Record<UiKey, string>> = {
  ca: {
    play: 'Juga',
    howItWorks: 'Com funciona?',
    settings: 'Configuració',
    newGame: 'Nova partida',
    changeDifficulty: 'Canvia el nivell',
    goHome: "Torna a l'inici",
    check: 'Comprovar',
    hint: 'Pista',
    undo: 'Desfer',
    redo: 'Refer',
    restart: 'Reiniciar',
    clues: 'Pistes',
    characters: 'Amics',
    progress: 'Progrés',
    moves: 'Moviments',
    share: 'Compartir',
    copied: 'Enllaç copiat!',
    online: 'Amb connexió',
    offline: 'Sense connexió',
    updateReady: 'Hi ha una nova versió preparada.',
    update: 'Actualitzar',
    difficulty: 'Dificultat',
    language: 'Idioma',
    close: 'Tancar',
    reducedMotion: 'Redueix les animacions',
    sound: 'So suau',
    emptyPlace: 'Espai lliure',
    map: 'Mapa del puzzle',
    logicGrid: 'Graella de deducció',
    logicCube: 'Edifici de deducció 5×5×3',
    board: 'Tauler',
    gameViews: 'Vistes del joc',
    hintsUsed: 'pistes',
    install: 'Instal·la Logic Garden',
    heroEyebrow: 'Puzzles tranquils per a ments curioses',
    heroTitle: 'Les pistes fan créixer idees.',
    heroDescription:
      'Col·loca cada amic al seu racó i resol una aventura que només té una resposta.',
    howToPlayText: 'Tria un amic, toca un lloc del mapa i deixa que les pistes et guiïn.',
    adventuresCompleted: 'aventures completades',
    adventure: 'Aventura',
    mapInstruction: 'Tria un amic i després un lloc del mapa.',
    logicGridInstruction: 'Tria una persona i una casella lliure.',
    logicCubeInstruction: "Tria una persona i una llar lliure de l'edifici.",
    profileEyebrow: 'El teu racó de lògica',
    profileTitle: 'Abans de començar, crea el teu perfil.',
    profileDescription:
      'Tria una franja, un nom i un avatar. Tot queda només en aquest dispositiu.',
    profileName: 'Com et dius?',
    profileNamePlaceholder: 'Escriu un nom',
    audience: 'Per a qui és?',
    avatar: 'Avatar',
    continue: 'Comença a jugar',
    saveProfile: 'Desa el perfil',
    editProfile: 'Canvia el perfil',
    returnToTray: 'Torna a la safata',
    noCharacterClue: 'Mira les pistes dels altres personatges.',
    timer: 'Temps',
    completedGames: 'Partides resoltes',
    shared: 'Enllaç preparat per compartir.',
    oldShareUnavailable: 'Aquesta partida és d’una versió anterior i no es pot compartir.',
    hintPickerTitle: 'De qui necessites una pista?',
    hintPickerDescription: 'Tria una persona per rebre la pista.',
    previousClue: 'Pista anterior',
    nextClue: 'Pista següent',
    challengeSomeone: 'Repta algú',
    returnChallenge: 'Torna el repte',
    offlineReady: 'Logic Garden ja està preparat per jugar sense connexió.',
    gamePreparationError: 'No hem pogut preparar aquesta aventura. Prova una partida nova.',
    preparing: 'Preparant el jardí de lògica…',
    selectPersonFirst: 'Primer tria una persona de la llista o del mapa.',
    gameActions: 'Accions de joc',
    boardZoom: 'Mida del tauler',
    fitBoard: 'Encaixa',
    zoomInBoard: 'Amplia el tauler',
    zoomOutBoard: 'Redueix el tauler',
  },
  es: {
    play: 'Jugar',
    howItWorks: '¿Cómo funciona?',
    settings: 'Configuración',
    newGame: 'Nueva partida',
    changeDifficulty: 'Cambia el nivel',
    goHome: 'Vuelve al inicio',
    check: 'Comprobar',
    hint: 'Pista',
    undo: 'Deshacer',
    redo: 'Rehacer',
    restart: 'Reiniciar',
    clues: 'Pistas',
    characters: 'Amigos',
    progress: 'Progreso',
    moves: 'Movimientos',
    share: 'Compartir',
    copied: '¡Enlace copiado!',
    online: 'Con conexión',
    offline: 'Sin conexión',
    updateReady: 'Hay una nueva versión preparada.',
    update: 'Actualizar',
    difficulty: 'Dificultad',
    language: 'Idioma',
    close: 'Cerrar',
    reducedMotion: 'Reduce las animaciones',
    sound: 'Sonido suave',
    emptyPlace: 'Espacio libre',
    map: 'Mapa del puzzle',
    logicGrid: 'Cuadrícula de deducción',
    logicCube: 'Edificio de deducción 5×5×3',
    board: 'Tablero',
    gameViews: 'Vistas del juego',
    hintsUsed: 'pistas',
    install: 'Instala Logic Garden',
    heroEyebrow: 'Puzles tranquilos para mentes curiosas',
    heroTitle: 'Las pistas hacen crecer ideas.',
    heroDescription:
      'Coloca cada amigo en su rincón y resuelve una aventura con una sola respuesta.',
    howToPlayText: 'Elige un amigo, toca un lugar del mapa y deja que las pistas te guíen.',
    adventuresCompleted: 'aventuras completadas',
    adventure: 'Aventura',
    mapInstruction: 'Elige un amigo y después un lugar del mapa.',
    logicGridInstruction: 'Elige una persona y una casilla libre.',
    logicCubeInstruction: 'Elige una persona y un hogar libre del edificio.',
    profileEyebrow: 'Tu rincón de lógica',
    profileTitle: 'Antes de empezar, crea tu perfil.',
    profileDescription:
      'Elige una franja, un nombre y un avatar. Todo queda solo en este dispositivo.',
    profileName: '¿Cómo te llamas?',
    profileNamePlaceholder: 'Escribe un nombre',
    audience: '¿Para quién es?',
    avatar: 'Avatar',
    continue: 'Empezar a jugar',
    saveProfile: 'Guardar perfil',
    editProfile: 'Cambiar perfil',
    returnToTray: 'Volver a la bandeja',
    noCharacterClue: 'Mira las pistas de las otras personas.',
    timer: 'Tiempo',
    completedGames: 'Partidas resueltas',
    shared: 'Enlace preparado para compartir.',
    oldShareUnavailable: 'Esta partida es de una versión anterior y no se puede compartir.',
    hintPickerTitle: '¿De quién necesitas una pista?',
    hintPickerDescription: 'Elige una persona y la colocaremos en su espacio.',
    previousClue: 'Pista anterior',
    nextClue: 'Pista siguiente',
    challengeSomeone: 'Reta a alguien',
    returnChallenge: 'Devuelve el reto',
    offlineReady: 'Logic Garden ya está listo para jugar sin conexión.',
    gamePreparationError: 'No hemos podido preparar esta aventura. Prueba una partida nueva.',
    preparing: 'Preparando el jardín de lógica…',
    selectPersonFirst: 'Primero elige una persona de la lista o del mapa.',
    gameActions: 'Acciones de juego',
    boardZoom: 'Tamaño del tablero',
    fitBoard: 'Encajar',
    zoomInBoard: 'Ampliar el tablero',
    zoomOutBoard: 'Reducir el tablero',
  },
  en: {
    play: 'Play',
    howItWorks: 'How does it work?',
    settings: 'Settings',
    newGame: 'New game',
    changeDifficulty: 'Change level',
    goHome: 'Back to home',
    check: 'Check',
    hint: 'Hint',
    undo: 'Undo',
    redo: 'Redo',
    restart: 'Restart',
    clues: 'Clues',
    characters: 'Friends',
    progress: 'Progress',
    moves: 'Moves',
    share: 'Share',
    copied: 'Link copied!',
    online: 'Online',
    offline: 'Offline',
    updateReady: 'A new version is ready.',
    update: 'Update',
    difficulty: 'Difficulty',
    language: 'Language',
    close: 'Close',
    reducedMotion: 'Reduce motion',
    sound: 'Gentle sound',
    emptyPlace: 'Empty place',
    map: 'Puzzle map',
    logicGrid: 'Logic grid',
    logicCube: '5×5×3 deduction building',
    board: 'Board',
    gameViews: 'Game views',
    hintsUsed: 'hints',
    install: 'Install Logic Garden',
    heroEyebrow: 'Gentle puzzles for curious minds',
    heroTitle: 'Clues help ideas grow.',
    heroDescription:
      'Place every friend in their spot and solve an adventure with one true answer.',
    howToPlayText: 'Choose a friend, tap a map place, and let the clues guide you.',
    adventuresCompleted: 'adventures completed',
    adventure: 'Adventure',
    mapInstruction: 'Choose a friend, then choose a place on the map.',
    logicGridInstruction: 'Choose a person and an empty space.',
    logicCubeInstruction: 'Choose a person and an available home in the building.',
    profileEyebrow: 'Your logic corner',
    profileTitle: 'Create your profile before you start.',
    profileDescription:
      'Choose a group, a name, and an avatar. Everything stays on this device.',
    profileName: 'What is your name?',
    profileNamePlaceholder: 'Type a name',
    audience: 'Who is playing?',
    avatar: 'Avatar',
    continue: 'Start playing',
    saveProfile: 'Save profile',
    editProfile: 'Change profile',
    returnToTray: 'Return to tray',
    noCharacterClue: 'Check the clues for the other people.',
    timer: 'Time',
    completedGames: 'Completed games',
    shared: 'Link ready to share.',
    oldShareUnavailable: 'This game is from an older version and cannot be shared.',
    hintPickerTitle: 'Who needs a hint?',
    hintPickerDescription: 'Choose a person and we will place them in their space.',
    previousClue: 'Previous clue',
    nextClue: 'Next clue',
    challengeSomeone: 'Challenge someone',
    returnChallenge: 'Send it back',
    offlineReady: 'Logic Garden is ready for offline play.',
    gamePreparationError: 'We could not prepare this adventure. Try a new game.',
    preparing: 'Preparing the logic garden…',
    selectPersonFirst: 'Choose a person from the list or the map first.',
    gameActions: 'Game actions',
    boardZoom: 'Board size',
    fitBoard: 'Fit',
    zoomInBoard: 'Zoom in on the board',
    zoomOutBoard: 'Zoom out from the board',
  },
}

export const t = (locale: Locale, key: UiKey) => ui[locale][key]

const gameFeedbackTemplates: Record<
  Locale,
  {
    readonly assignmentIncomplete: string
    readonly assignmentIncorrect: string
    readonly assignmentCorrect: string
    readonly hintPersonRequired: string
    readonly hintLimitReached: string
    readonly hintPuzzlePreparing: string
    readonly hintReadyToCheck: string
    readonly hintHighlightedClue: string
    readonly hintCharacterDeducible: (name: string) => string
    readonly hintCharacterPosition: (name: string, position: string) => string
    readonly hintAlreadyCorrect: (name: string) => string
    readonly hintApplied: (name: string) => string
  }
> = {
  ca: {
    assignmentIncomplete: 'Encara hi ha algun amic sense lloc. Continua quan vulguis!',
    assignmentIncorrect: 'Gairebé! Revisa les pistes i prova una combinació diferent.',
    assignmentCorrect: 'Fantàstic! Has resolt el puzzle amb una gran deducció.',
    hintPersonRequired: 'Tria la persona que necessita una pista.',
    hintLimitReached: 'Ja tens prou pistes per trobar l’últim lloc.',
    hintPuzzlePreparing: 'Aquest puzzle s’està preparant. Torna-ho a provar en un moment.',
    hintReadyToCheck: 'Tot encaixa! Pots comprovar la teva resposta.',
    hintHighlightedClue: 'Aquesta pista et pot ajudar ara.',
    hintCharacterDeducible: (name) => `Pots deduir el lloc de ${name}.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Una petita ajuda: ${name} encaixa a ${position}.`
        : `Una petita ajuda: ja pots trobar el lloc de ${name}.`,
    hintAlreadyCorrect: (name) => `${name} ja és al lloc correcte.`,
    hintApplied: (name) => `Pista aplicada: ${name} ja és al seu espai.`,
  },
  es: {
    assignmentIncomplete: '¡Aún falta colocar a alguien! Continúa cuando quieras.',
    assignmentIncorrect: '¡Casi! Revisa las pistas y prueba una combinación diferente.',
    assignmentCorrect: '¡Fantástico! Has resuelto el puzle con una gran deducción.',
    hintPersonRequired: 'Elige a la persona que necesita una pista.',
    hintLimitReached: 'Ya tienes suficientes pistas para encontrar el último lugar.',
    hintPuzzlePreparing: 'Este puzle se está preparando. Inténtalo de nuevo en un momento.',
    hintReadyToCheck: '¡Todo encaja! Ya puedes comprobar tu respuesta.',
    hintHighlightedClue: 'Esta pista puede ayudarte ahora.',
    hintCharacterDeducible: (name) => `Puedes deducir el lugar de ${name}.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Una pequeña ayuda: ${name} encaja en ${position}.`
        : `Una pequeña ayuda: ya puedes encontrar el lugar de ${name}.`,
    hintAlreadyCorrect: (name) => `${name} ya está en el lugar correcto.`,
    hintApplied: (name) => `Pista aplicada: ${name} ya está en su espacio.`,
  },
  en: {
    assignmentIncomplete: 'Someone still needs a place. Keep going when you are ready!',
    assignmentIncorrect: 'Almost! Check the clues and try a different combination.',
    assignmentCorrect: 'Fantastic! You solved the puzzle with careful deduction.',
    hintPersonRequired: 'Choose the person who needs a hint.',
    hintLimitReached: 'You have enough hints to find the final place.',
    hintPuzzlePreparing: 'This puzzle is still getting ready. Try again in a moment.',
    hintReadyToCheck: 'Everything fits! You can check your answer now.',
    hintHighlightedClue: 'This clue can help you now.',
    hintCharacterDeducible: (name) => `You can work out where ${name} belongs.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `A small hint: ${name} belongs at ${position}.`
        : `A small hint: you can now find a place for ${name}.`,
    hintAlreadyCorrect: (name) => `${name} is already in the right place.`,
    hintApplied: (name) => `Hint applied: ${name} is now in the right space.`,
  },
}

export const gameFeedbackCopy = (locale: Locale, feedback: GameFeedback) => {
  const copy = gameFeedbackTemplates[locale]
  switch (feedback.type) {
    case 'assignment-incomplete':
      return copy.assignmentIncomplete
    case 'assignment-incorrect':
      return copy.assignmentIncorrect
    case 'assignment-correct':
      return copy.assignmentCorrect
    case 'hint-person-required':
      return copy.hintPersonRequired
    case 'hint-limit-reached':
      return copy.hintLimitReached
    case 'hint-puzzle-preparing':
      return copy.hintPuzzlePreparing
    case 'hint-ready-to-check':
      return copy.hintReadyToCheck
    case 'hint-highlighted-clue':
      return copy.hintHighlightedClue
    case 'hint-character-deducible':
      return copy.hintCharacterDeducible(feedback.characterName)
    case 'hint-character-position':
      return copy.hintCharacterPosition(feedback.characterName, feedback.positionLabel)
    case 'hint-already-correct':
      return copy.hintAlreadyCorrect(feedback.characterName)
    case 'hint-applied':
      return copy.hintApplied(feedback.characterName)
  }
}

export const challengeInviteCopy = (locale: Locale, benchmark?: string) => {
  const copy: Record<
    Locale,
    {
      title: string
      welcome: string
      message: string
      timedMessage: (time: string) => string
      play: string
    }
  > = {
    ca: {
      title: 'T’han enviat un misteri',
      welcome: 'Et donem la benvinguda a Logic Garden.',
      message: 'Una persona t’envia aquest misteri. Podràs resoldre’l?',
      timedMessage: (time) =>
        `Una persona t’envia aquest misteri. L’ha resolt en ${time}. Podràs millorar-ho?`,
      play: 'Accepta el repte',
    },
    es: {
      title: 'Te han enviado un misterio',
      welcome: 'Te damos la bienvenida a Logic Garden.',
      message: 'Una persona te envía este misterio. ¿Podrás resolverlo?',
      timedMessage: (time) =>
        `Una persona te envía este misterio. Lo ha resuelto en ${time}. ¿Podrás mejorarlo?`,
      play: 'Aceptar el reto',
    },
    en: {
      title: 'Someone sent you a mystery',
      welcome: 'Welcome to Logic Garden.',
      message: 'Someone sent you this mystery. Can you solve it?',
      timedMessage: (time) =>
        `Someone sent you this mystery. They solved it in ${time}. Can you beat it?`,
      play: 'Accept challenge',
    },
  }
  const selected = copy[locale]
  return {
    ...selected,
    message: benchmark ? selected.timedMessage(benchmark) : selected.message,
  }
}

export const challengeResultCopy = (
  locale: Locale,
  benchmark: string,
  current: string,
  improved: boolean,
) => {
  const copy: Record<Locale, { improved: string; completed: string; share: string }> = {
    ca: {
      improved: `Has superat la marca de ${benchmark} amb ${current}.`,
      completed: `Repte resolt en ${current}. La marca a superar era ${benchmark}.`,
      share: 'Torna’l a enviar amb la teva marca o fes una captura d’aquesta targeta.',
    },
    es: {
      improved: `Has superado la marca de ${benchmark} con ${current}.`,
      completed: `Reto resuelto en ${current}. La marca a superar era ${benchmark}.`,
      share: 'Devuélvelo con tu marca o haz una captura de esta tarjeta.',
    },
    en: {
      improved: `You beat the ${benchmark} mark with ${current}.`,
      completed: `Challenge solved in ${current}. The mark to beat was ${benchmark}.`,
      share: 'Send it back with your mark or take a screenshot of this card.',
    },
  }
  const selected = copy[locale]
  return { message: improved ? selected.improved : selected.completed, share: selected.share }
}

export const challengeShareCopy = (locale: Locale, title: string, time?: string) => {
  const copy: Record<Locale, (puzzleTitle: string, mark?: string) => string> = {
    ca: (puzzleTitle, mark) =>
      mark
        ? `Et repto a Logic Garden: ${puzzleTitle}. L’he resolt en ${mark}. Podràs millorar-ho?`
        : `Et repto a Logic Garden: ${puzzleTitle}. Podràs resoldre aquest misteri?`,
    es: (puzzleTitle, mark) =>
      mark
        ? `Te reto en Logic Garden: ${puzzleTitle}. Lo he resuelto en ${mark}. ¿Podrás mejorarlo?`
        : `Te reto en Logic Garden: ${puzzleTitle}. ¿Podrás resolver este misterio?`,
    en: (puzzleTitle, mark) =>
      mark
        ? `A Logic Garden challenge: ${puzzleTitle}. I solved it in ${mark}. Can you beat it?`
        : `A Logic Garden challenge: ${puzzleTitle}. Can you solve this mystery?`,
  }
  return copy[locale](title, time)
}

export const installPromptCopy = (locale: Locale) => {
  const copy: Record<Locale, { title: string; ios: string; android: string; dismiss: string }> =
    {
      ca: {
        title: 'Juga també sense connexió',
        ios: 'Toca Compartir i després «Afegeix a la pantalla d’inici».',
        android: 'Toca Instal·la. Si no apareix, obre el menú i tria «Instal·la l’aplicació».',
        dismiss: 'Ara no',
      },
      es: {
        title: 'Juega también sin conexión',
        ios: 'Toca Compartir y después «Añadir a pantalla de inicio».',
        android: 'Toca Instalar. Si no aparece, abre el menú y elige «Instalar aplicación».',
        dismiss: 'Ahora no',
      },
      en: {
        title: 'Play offline too',
        ios: 'Tap Share, then “Add to Home Screen”.',
        android: 'Tap Install. If it is unavailable, open the menu and choose “Install app”.',
        dismiss: 'Not now',
      },
    }
  return copy[locale]
}

export const boardActionCopy = (locale: Locale) => {
  const copy: Record<Locale, { moveToPosition: string; selectPosition: string }> = {
    ca: {
      moveToPosition: 'Mou el personatge seleccionat a',
      selectPosition: 'Selecciona aquest lloc',
    },
    es: {
      moveToPosition: 'Mueve el personaje seleccionado a',
      selectPosition: 'Selecciona este lugar',
    },
    en: {
      moveToPosition: 'Move the selected character to',
      selectPosition: 'Select this place',
    },
  }
  return {
    moveToPosition: (positionLabel: string) =>
      `${copy[locale].moveToPosition}: ${positionLabel}`,
    selectPosition: (positionLabel: string) =>
      `${copy[locale].selectPosition}: ${positionLabel}`,
  }
}

const audienceCopy: Record<Locale, Record<Audience, { label: string; description: string }>> = {
  ca: {
    children: { label: 'Infants', description: 'Colors, animals i descobertes' },
    teens: { label: 'Adolescents', description: 'Música, esports i creació' },
    adults: { label: 'Adults', description: 'Espais, cultura i vida quotidiana' },
  },
  es: {
    children: { label: 'Infantil', description: 'Colores, animales y descubrimientos' },
    teens: { label: 'Adolescentes', description: 'Música, deportes y creación' },
    adults: { label: 'Adultos', description: 'Espacios, cultura y vida cotidiana' },
  },
  en: {
    children: { label: 'Children', description: 'Colors, animals, and discoveries' },
    teens: { label: 'Teens', description: 'Music, sports, and making' },
    adults: { label: 'Adults', description: 'Places, culture, and everyday life' },
  },
}

export const audienceLabel = (locale: Locale, audience: Audience) =>
  audienceCopy[locale][audience].label

export const audienceDescription = (locale: Locale, audience: Audience) =>
  audienceCopy[locale][audience].description

export const audienceHeroCopy = (locale: Locale, audience: Audience) => {
  const copy: Record<
    Locale,
    Record<Audience, { eyebrow: string; title: string; description: string }>
  > = {
    ca: {
      children: {
        eyebrow: 'Puzzles tranquils per a ments curioses',
        title: 'Les pistes fan créixer idees.',
        description:
          'Col·loca cada amic al seu racó i resol una aventura amb una sola resposta.',
      },
      teens: {
        eyebrow: 'Ritme, espais i estratègia',
        title: 'Fes que cada peça encaixi.',
        description: 'Resol una graella de música, esports o creació al teu ritme.',
      },
      adults: {
        eyebrow: 'Deducció per desconnectar',
        title: 'Ordena l’espai. Aclareix la idea.',
        description: 'Gaudeix de graelles tranquil·les amb temes del dia a dia.',
      },
    },
    es: {
      children: {
        eyebrow: 'Puzles tranquilos para mentes curiosas',
        title: 'Las pistas hacen crecer ideas.',
        description:
          'Coloca cada amigo en su rincón y resuelve una aventura con una sola respuesta.',
      },
      teens: {
        eyebrow: 'Ritmo, espacios y estrategia',
        title: 'Haz que cada pieza encaje.',
        description: 'Resuelve una cuadrícula de música, deportes o creación a tu ritmo.',
      },
      adults: {
        eyebrow: 'Deducción para desconectar',
        title: 'Ordena el espacio. Aclara la idea.',
        description: 'Disfruta cuadrículas tranquilas con temas cotidianos.',
      },
    },
    en: {
      children: {
        eyebrow: 'Gentle puzzles for curious minds',
        title: 'Clues help ideas grow.',
        description:
          'Place every friend in their spot and solve an adventure with one true answer.',
      },
      teens: {
        eyebrow: 'Rhythm, spaces, and strategy',
        title: 'Make every piece fit.',
        description: 'Solve a music, sports, or maker logic grid at your own pace.',
      },
      adults: {
        eyebrow: 'Deduction to unwind',
        title: 'Order the space. Clear the idea.',
        description: 'Enjoy calm logic grids with everyday themes.',
      },
    },
  }
  return copy[locale][audience]
}

const titles: Record<Locale, Record<ThemeId, string>> = {
  ca: {
    'forest-party': 'La festa del bosc',
    'treasure-island': 'L’illa de les sorpreses',
    'kind-magic-school': 'L’escola de màgia amable',
    'space-trip': 'Viatge per l’espai',
    'fun-farm': 'La granja divertida',
    'sea-garden': 'El jardí marí',
    'dino-park': 'El parc de dinosaures simpàtics',
    'friendly-monster-town': 'El poble de monstres amistosos',
    'color-fair': 'La fira de colors',
    'mountain-trip': 'Excursió a la muntanya',
    'music-studio': 'L’estudi de música',
    'sports-festival': 'El festival d’esports',
    'creative-lab': 'El laboratori creatiu',
    'book-club': 'El club de lectures',
    'city-garden': 'El jardí de barri',
    'weekend-market': 'El mercat de dissabte',
  },
  es: {
    'forest-party': 'La fiesta del bosque',
    'treasure-island': 'La isla de las sorpresas',
    'kind-magic-school': 'La escuela de magia amable',
    'space-trip': 'Viaje por el espacio',
    'fun-farm': 'La granja divertida',
    'sea-garden': 'El jardín marino',
    'dino-park': 'El parque de dinosaurios simpáticos',
    'friendly-monster-town': 'El pueblo de monstruos amistosos',
    'color-fair': 'La feria de colores',
    'mountain-trip': 'Excursión a la montaña',
    'music-studio': 'El estudio de música',
    'sports-festival': 'El festival de deportes',
    'creative-lab': 'El laboratorio creativo',
    'book-club': 'El club de lectura',
    'city-garden': 'El jardín del barrio',
    'weekend-market': 'El mercado del sábado',
  },
  en: {
    'forest-party': 'The forest party',
    'treasure-island': 'The surprise island',
    'kind-magic-school': 'The kind magic school',
    'space-trip': 'Space trip',
    'fun-farm': 'The fun farm',
    'sea-garden': 'The sea garden',
    'dino-park': 'The friendly dinosaur park',
    'friendly-monster-town': 'The friendly monster town',
    'color-fair': 'The color fair',
    'mountain-trip': 'Mountain trip',
    'music-studio': 'The music studio',
    'sports-festival': 'The sports festival',
    'creative-lab': 'The creative lab',
    'book-club': 'The book club',
    'city-garden': 'The neighborhood garden',
    'weekend-market': 'The Saturday market',
  },
}

export const themeCopy = (locale: Locale, themeId: ThemeId) => {
  const title = titles[locale][themeId]
  const messages: Record<Locale, { introduction: string; objective: string; victory: string }> =
    {
      ca: {
        introduction: `A ${title}, cada amic té un lloc per descobrir.`,
        objective: 'Llegeix les pistes i troba el lloc de cada amic.',
        victory: 'Molt bé! Tots els amics han trobat el seu lloc.',
      },
      es: {
        introduction: `En ${title}, cada amigo tiene un lugar por descubrir.`,
        objective: 'Lee las pistas y encuentra el lugar de cada amigo.',
        victory: '¡Muy bien! Todos los amigos han encontrado su lugar.',
      },
      en: {
        introduction: `In ${title}, every friend has a place to discover.`,
        objective: 'Read the clues and find a place for every friend.',
        victory: 'Well done! Every friend has found a place.',
      },
    }
  return { title, ...messages[locale] }
}
