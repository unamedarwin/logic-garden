import type { Audience, Locale, ThemeId } from './types'

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
    logicGridInstruction: 'Tria una persona i un espai lliure de fila i columna.',
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
    logicGridInstruction: 'Elige una persona y un espacio libre de fila y columna.',
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
    logicGridInstruction: 'Choose a person and a space free in its row and column.',
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
  },
}

export const t = (locale: Locale, key: UiKey) => ui[locale][key]

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
