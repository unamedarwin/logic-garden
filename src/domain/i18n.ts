import type { Locale, ThemeId } from './types'

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
  | 'hintsUsed'
  | 'install'
  | 'heroEyebrow'
  | 'heroTitle'
  | 'heroDescription'
  | 'howToPlayText'
  | 'adventuresCompleted'
  | 'adventure'
  | 'mapInstruction'

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
  },
}

export const t = (locale: Locale, key: UiKey) => ui[locale][key]

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
