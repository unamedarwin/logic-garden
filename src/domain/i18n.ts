import type { Locale, PuzzleCollection, ThemeId } from './types'
import type { CheckFeedback, GameFeedback } from '../game/feedback'

// cspell:disable -- eu/gl/fr/de are reviewed through locale parity tests and independent agents.

export const supportedLocales: readonly Locale[] = ['ca', 'es', 'en', 'eu', 'gl', 'fr', 'de']

export const localeLabels: Record<Locale, string> = {
  ca: 'Català',
  es: 'Castellano',
  en: 'English',
  eu: 'Euskara',
  gl: 'Galego',
  fr: 'Français',
  de: 'Deutsch',
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
  | 'puzzleCollection'
  | 'elevator'
  | 'floorUp'
  | 'floorDown'
  | 'showCheckProgress'
  | 'continuePlaying'

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
    logicCube: 'Edifici de deducció en 3D',
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
    logicCubeInstruction: "Tria una persona i un espai lliure de l'edifici.",
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
    puzzleCollection: 'Tria un tipus de puzzle',
    elevator: "Ascensor de l'edifici",
    floorUp: 'Puja un pis',
    floorDown: 'Baixa un pis',
    showCheckProgress: 'Mostra quantes persones estan ben ubicades',
    continuePlaying: 'Continua jugant',
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
    logicCube: 'Edificio de deducción en 3D',
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
    logicCubeInstruction: 'Elige una persona y un espacio libre del edificio.',
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
    puzzleCollection: 'Elige un tipo de puzle',
    elevator: 'Ascensor del edificio',
    floorUp: 'Sube una planta',
    floorDown: 'Baja una planta',
    showCheckProgress: 'Muestra cuántas personas están bien colocadas',
    continuePlaying: 'Seguir jugando',
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
    logicCube: '3D deduction building',
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
    logicCubeInstruction: 'Choose a person and an available space in the building.',
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
    puzzleCollection: 'Choose a puzzle type',
    elevator: 'Building elevator',
    floorUp: 'Go up one floor',
    floorDown: 'Go down one floor',
    showCheckProgress: 'Show how many people are in the right place',
    continuePlaying: 'Keep playing',
  },
  eu: {
    play: 'Jokatu',
    howItWorks: 'Nola funtzionatzen du?',
    settings: 'Ezarpenak',
    newGame: 'Partida berria',
    changeDifficulty: 'Maila aldatu',
    goHome: 'Itzuli hasierara',
    check: 'Egiaztatu',
    hint: 'Pista',
    undo: 'Desegin',
    redo: 'Berregin',
    restart: 'Berriz hasi',
    clues: 'Pistak',
    characters: 'Lagunak',
    progress: 'Aurrerapena',
    moves: 'Mugimenduak',
    share: 'Partekatu',
    copied: 'Esteka kopiatu da!',
    online: 'Konektatuta',
    offline: 'Konexiorik gabe',
    updateReady: 'Bertsio berria prest dago.',
    update: 'Eguneratu',
    difficulty: 'Zailtasuna',
    language: 'Hizkuntza',
    close: 'Itxi',
    reducedMotion: 'Animazioak murriztu',
    sound: 'Soinu leuna',
    emptyPlace: 'Leku hutsa',
    map: 'Puzzlearen mapa',
    logicGrid: 'Dedukzio-sareta',
    logicCube: '3D dedukzio-eraikina',
    board: 'Taula',
    gameViews: 'Jokoaren ikuspegiak',
    hintsUsed: 'pista',
    install: 'Instalatu Logic Garden',
    heroEyebrow: 'Buru jakin-nahientzako puzzle lasaiak',
    heroTitle: 'Pistek ideiak hazten laguntzen dute.',
    heroDescription:
      'Jarri lagun bakoitza bere txokoan eta ebatzi erantzun bakarreko abentura bat.',
    howToPlayText: 'Aukeratu lagun bat, ukitu mapako leku bat eta jarraitu pistei.',
    adventuresCompleted: 'amaitutako abenturak',
    adventure: 'Abentura',
    mapInstruction: 'Aukeratu lagun bat eta gero mapako leku bat.',
    logicGridInstruction: 'Aukeratu pertsona bat eta lauki huts bat.',
    logicCubeInstruction: 'Aukeratu pertsona bat eta eraikineko leku libre bat.',
    returnToTray: 'Itzuli erretilura',
    noCharacterClue: 'Begiratu beste pertsonen pistei.',
    timer: 'Denbora',
    completedGames: 'Ebatzitako partidak',
    shared: 'Esteka partekatzeko prest dago.',
    oldShareUnavailable: 'Partida hau aurreko bertsio batekoa da eta ezin da partekatu.',
    hintPickerTitle: 'Nork behar du pista bat?',
    hintPickerDescription: 'Aukeratu pertsona bat, eta dagokion lekuan jarriko dugu.',
    previousClue: 'Aurreko pista',
    nextClue: 'Hurrengo pista',
    challengeSomeone: 'Egin erronka norbaiti',
    returnChallenge: 'Bidali erronka bueltan',
    offlineReady: 'Logic Garden prest dago konexiorik gabe jokatzeko.',
    gamePreparationError: 'Ezin izan dugu abentura hau prestatu. Probatu partida berri bat.',
    preparing: 'Logika-lorategia prestatzen…',
    selectPersonFirst: 'Lehenik, aukeratu pertsona bat zerrendan edo mapan.',
    gameActions: 'Jokoaren ekintzak',
    boardZoom: 'Taularen tamaina',
    fitBoard: 'Doitu',
    zoomInBoard: 'Handitu taula',
    zoomOutBoard: 'Txikitu taula',
    puzzleCollection: 'Aukeratu puzzle mota',
    elevator: 'Eraikineko igogailua',
    floorUp: 'Igo solairu bat',
    floorDown: 'Jaitsi solairu bat',
    showCheckProgress: 'Erakutsi zenbat pertsona dauden leku egokian',
    continuePlaying: 'Jarraitu jokatzen',
  },
  gl: {
    play: 'Xogar',
    howItWorks: 'Como funciona?',
    settings: 'Axustes',
    newGame: 'Nova partida',
    changeDifficulty: 'Cambiar o nivel',
    goHome: 'Volver ao inicio',
    check: 'Comprobar',
    hint: 'Pista',
    undo: 'Desfacer',
    redo: 'Refacer',
    restart: 'Comezar de novo',
    clues: 'Pistas',
    characters: 'Amigos',
    progress: 'Progreso',
    moves: 'Movementos',
    share: 'Compartir',
    copied: 'Ligazón copiada!',
    online: 'Con conexión',
    offline: 'Sen conexión',
    updateReady: 'Hai unha nova versión preparada.',
    update: 'Actualizar',
    difficulty: 'Dificultade',
    language: 'Idioma',
    close: 'Pechar',
    reducedMotion: 'Reducir as animacións',
    sound: 'Son suave',
    emptyPlace: 'Espazo libre',
    map: 'Mapa do quebracabezas',
    logicGrid: 'Grade de dedución',
    logicCube: 'Edificio de dedución en 3D',
    board: 'Taboleiro',
    gameViews: 'Vistas do xogo',
    hintsUsed: 'pistas',
    install: 'Instalar Logic Garden',
    heroEyebrow: 'Quebracabezas tranquilos para mentes curiosas',
    heroTitle: 'As pistas fan medrar as ideas.',
    heroDescription:
      'Coloca cada amigo no seu recuncho e resolve unha aventura cunha única resposta.',
    howToPlayText: 'Escolle un amigo, toca un lugar do mapa e deixa que as pistas te guíen.',
    adventuresCompleted: 'aventuras completadas',
    adventure: 'Aventura',
    mapInstruction: 'Escolle un amigo e despois un lugar do mapa.',
    logicGridInstruction: 'Escolle unha persoa e unha cela libre.',
    logicCubeInstruction: 'Escolle unha persoa e un espazo libre do edificio.',
    returnToTray: 'Volver á bandexa',
    noCharacterClue: 'Consulta as pistas das outras persoas.',
    timer: 'Tempo',
    completedGames: 'Partidas resoltas',
    shared: 'Ligazón preparada para compartir.',
    oldShareUnavailable: 'Esta partida é dunha versión anterior e non se pode compartir.',
    hintPickerTitle: 'De quen necesitas unha pista?',
    hintPickerDescription: 'Escolle unha persoa e colocarémola no seu espazo.',
    previousClue: 'Pista anterior',
    nextClue: 'Pista seguinte',
    challengeSomeone: 'Retar a alguén',
    returnChallenge: 'Devolver o reto',
    offlineReady: 'Logic Garden xa está preparado para xogar sen conexión.',
    gamePreparationError: 'Non puidemos preparar esta aventura. Proba unha partida nova.',
    preparing: 'Preparando o xardín da lóxica…',
    selectPersonFirst: 'Primeiro escolle unha persoa da lista ou do mapa.',
    gameActions: 'Accións do xogo',
    boardZoom: 'Tamaño do taboleiro',
    fitBoard: 'Axustar',
    zoomInBoard: 'Achegar o taboleiro',
    zoomOutBoard: 'Afastar o taboleiro',
    puzzleCollection: 'Escolle un tipo de quebracabezas',
    elevator: 'Ascensor do edificio',
    floorUp: 'Subir un andar',
    floorDown: 'Baixar un andar',
    showCheckProgress: 'Mostrar cantas persoas están ben colocadas',
    continuePlaying: 'Seguir xogando',
  },
  fr: {
    play: 'Jouer',
    howItWorks: 'Comment ça marche ?',
    settings: 'Paramètres',
    newGame: 'Nouvelle partie',
    changeDifficulty: 'Changer de niveau',
    goHome: 'Retour à l’accueil',
    check: 'Vérifier',
    hint: 'Indice',
    undo: 'Annuler',
    redo: 'Rétablir',
    restart: 'Recommencer',
    clues: 'Indices',
    characters: 'Amis',
    progress: 'Progression',
    moves: 'Déplacements',
    share: 'Partager',
    copied: 'Lien copié !',
    online: 'En ligne',
    offline: 'Hors connexion',
    updateReady: 'Une nouvelle version est prête.',
    update: 'Mettre à jour',
    difficulty: 'Difficulté',
    language: 'Langue',
    close: 'Fermer',
    reducedMotion: 'Réduire les animations',
    sound: 'Son doux',
    emptyPlace: 'Emplacement libre',
    map: 'Carte du puzzle',
    logicGrid: 'Grille de déduction',
    logicCube: 'Immeuble de déduction en 3D',
    board: 'Plateau',
    gameViews: 'Vues du jeu',
    hintsUsed: 'indices',
    install: 'Installer Logic Garden',
    heroEyebrow: 'Des puzzles paisibles pour les esprits curieux',
    heroTitle: 'Les indices font germer les idées.',
    heroDescription:
      'Place chaque ami à sa place et résous une aventure qui n’a qu’une seule solution.',
    howToPlayText:
      'Choisis un ami, touche un endroit de la carte et laisse les indices te guider.',
    adventuresCompleted: 'aventures terminées',
    adventure: 'Aventure',
    mapInstruction: 'Choisis un ami, puis un endroit sur la carte.',
    logicGridInstruction: 'Choisis une personne et une case libre.',
    logicCubeInstruction: 'Choisis une personne et un espace libre dans l’immeuble.',
    returnToTray: 'Retour dans la réserve',
    noCharacterClue: 'Consulte les indices des autres personnes.',
    timer: 'Temps',
    completedGames: 'Puzzles résolus',
    shared: 'Lien prêt à être partagé.',
    oldShareUnavailable:
      'Cette partie vient d’une ancienne version et ne peut pas être partagée.',
    hintPickerTitle: 'Qui a besoin d’un indice ?',
    hintPickerDescription: 'Choisis une personne pour recevoir l’indice.',
    previousClue: 'Indice précédent',
    nextClue: 'Indice suivant',
    challengeSomeone: 'Défier quelqu’un',
    returnChallenge: 'Renvoyer le défi',
    offlineReady: 'Logic Garden est prêt pour jouer hors connexion.',
    gamePreparationError:
      'Nous n’avons pas pu préparer cette aventure. Essaie une nouvelle partie.',
    preparing: 'Préparation du jardin logique…',
    selectPersonFirst: 'Choisis d’abord une personne dans la liste ou sur la carte.',
    gameActions: 'Actions du jeu',
    boardZoom: 'Taille du plateau',
    fitBoard: 'Ajuster',
    zoomInBoard: 'Agrandir le plateau',
    zoomOutBoard: 'Réduire le plateau',
    puzzleCollection: 'Choisis un type de puzzle',
    elevator: 'Ascenseur de l’immeuble',
    floorUp: 'Monter d’un étage',
    floorDown: 'Descendre d’un étage',
    showCheckProgress: 'Afficher combien de personnes sont bien placées',
    continuePlaying: 'Continuer à jouer',
  },
  de: {
    play: 'Spielen',
    howItWorks: 'Wie funktioniert es?',
    settings: 'Einstellungen',
    newGame: 'Neues Spiel',
    changeDifficulty: 'Schwierigkeitsgrad ändern',
    goHome: 'Zur Startseite',
    check: 'Prüfen',
    hint: 'Hinweis',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    restart: 'Neu starten',
    clues: 'Hinweise',
    characters: 'Freunde',
    progress: 'Fortschritt',
    moves: 'Züge',
    share: 'Teilen',
    copied: 'Link kopiert!',
    online: 'Online',
    offline: 'Offline',
    updateReady: 'Eine neue Version ist bereit.',
    update: 'Aktualisieren',
    difficulty: 'Schwierigkeit',
    language: 'Sprache',
    close: 'Schließen',
    reducedMotion: 'Animationen reduzieren',
    sound: 'Sanfter Ton',
    emptyPlace: 'Freier Platz',
    map: 'Rätselkarte',
    logicGrid: 'Logikgitter',
    logicCube: '3D-Logikgebäude',
    board: 'Spielfeld',
    gameViews: 'Spielansichten',
    hintsUsed: 'Hinweise',
    install: 'Logic Garden installieren',
    heroEyebrow: 'Ruhige Rätsel für neugierige Köpfe',
    heroTitle: 'Hinweise lassen Ideen wachsen.',
    heroDescription:
      'Setze jeden Freund an seinen Platz und löse ein Abenteuer mit nur einer richtigen Lösung.',
    howToPlayText: 'Wähle einen Freund, tippe auf einen Ort und folge den Hinweisen.',
    adventuresCompleted: 'abgeschlossene Abenteuer',
    adventure: 'Abenteuer',
    mapInstruction: 'Wähle einen Freund und dann einen Ort auf der Karte.',
    logicGridInstruction: 'Wähle eine Person und ein freies Feld.',
    logicCubeInstruction: 'Wähle eine Person und einen freien Platz im Gebäude.',
    returnToTray: 'Zurück zur Ablage',
    noCharacterClue: 'Sieh dir die Hinweise der anderen Personen an.',
    timer: 'Zeit',
    completedGames: 'Gelöste Rätsel',
    shared: 'Der Link kann jetzt geteilt werden.',
    oldShareUnavailable:
      'Dieses Spiel stammt aus einer älteren Version und kann nicht geteilt werden.',
    hintPickerTitle: 'Wer braucht einen Hinweis?',
    hintPickerDescription: 'Wähle eine Person aus, die einen Hinweis erhalten soll.',
    previousClue: 'Vorheriger Hinweis',
    nextClue: 'Nächster Hinweis',
    challengeSomeone: 'Jemanden herausfordern',
    returnChallenge: 'Herausforderung zurückschicken',
    offlineReady: 'Logic Garden ist jetzt auch offline spielbereit.',
    gamePreparationError:
      'Wir konnten dieses Abenteuer nicht vorbereiten. Probiere ein neues Spiel.',
    preparing: 'Der Logikgarten wird vorbereitet…',
    selectPersonFirst: 'Wähle zuerst eine Person aus der Liste oder von der Karte.',
    gameActions: 'Spielaktionen',
    boardZoom: 'Spielfeldgröße',
    fitBoard: 'Einpassen',
    zoomInBoard: 'Spielfeld vergrößern',
    zoomOutBoard: 'Spielfeld verkleinern',
    puzzleCollection: 'Wähle eine Rätselart',
    elevator: 'Gebäudeaufzug',
    floorUp: 'Ein Stockwerk nach oben',
    floorDown: 'Ein Stockwerk nach unten',
    showCheckProgress: 'Anzeigen, wie viele Personen richtig platziert sind',
    continuePlaying: 'Weiterspielen',
  },
}

export const t = (locale: Locale, key: UiKey) => ui[locale][key]

const gameFeedbackTemplates: Record<
  Locale,
  {
    readonly assignmentIncomplete: string
    readonly assignmentIncorrect: string
    readonly assignmentCorrect: string
    readonly placementConflictsCleared: (name: string, count: number) => string
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
    placementConflictsCleared: (name, count) =>
      `Hem fet lloc per a ${name}: ${count === 1 ? 'una persona torna' : `${count} persones tornen`} a l’espera. Pots desfer el canvi.`,
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
    placementConflictsCleared: (name, count) =>
      `Hemos hecho sitio para ${name}: ${count === 1 ? 'una persona vuelve' : `${count} personas vuelven`} a la espera. Puedes deshacer el cambio.`,
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
    placementConflictsCleared: (name, count) =>
      `We made room for ${name}: ${count === 1 ? 'one person returns' : `${count} people return`} to the waiting area. You can undo this change.`,
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
  eu: {
    assignmentIncomplete: 'Oraindik lagunen batek ez du lekurik. Jarraitu nahi duzunean!',
    assignmentIncorrect: 'Ia-ia! Begiratu pistak eta probatu beste konbinazio bat.',
    assignmentCorrect: 'Bikain! Dedukzio ona erabilita ebatzi duzu puzzlea.',
    placementConflictsCleared: (name, count) =>
      `${name} jartzeko lekua egin dugu: ${
        count === 1
          ? 'pertsona bat itxaronlekura itzuli da'
          : `${count} pertsona itxaronlekura itzuli dira`
      }. Aldaketa desegin dezakezu.`,
    hintPersonRequired: 'Aukeratu pista behar duen pertsona.',
    hintLimitReached: 'Azken lekua aurkitzeko adina pista dituzu.',
    hintPuzzlePreparing: 'Puzzle hau prestatzen ari da. Saiatu berriro une bat barru.',
    hintReadyToCheck: 'Dena bat dator! Erantzuna egiazta dezakezu.',
    hintHighlightedClue: 'Pista honek orain lagun diezazuke.',
    hintCharacterDeducible: (name) => `${name} non jarri ondoriozta dezakezu.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Laguntza txiki bat: ${name} hemen doa: ${position}.`
        : `Laguntza txiki bat: orain aurki dezakezu ${name} jartzeko lekua.`,
    hintAlreadyCorrect: (name) => `${name} leku egokian dago jada.`,
    hintApplied: (name) => `Pista erabili da: ${name} leku egokian dago orain.`,
  },
  gl: {
    assignmentIncomplete: 'Aínda falta colocar a alguén. Continúa cando queiras!',
    assignmentIncorrect: 'Case! Revisa as pistas e proba unha combinación diferente.',
    assignmentCorrect: 'Fantástico! Resolviches o quebracabezas cunha gran dedución.',
    placementConflictsCleared: (name, count) =>
      `Fixemos sitio para ${name}: ${
        count === 1 ? 'unha persoa volve' : `${count} persoas volven`
      } á zona de espera. Podes desfacer o cambio.`,
    hintPersonRequired: 'Escolle a persoa que necesita unha pista.',
    hintLimitReached: 'Xa tes pistas suficientes para atopar o último lugar.',
    hintPuzzlePreparing: 'Este quebracabezas estase preparando. Téntao de novo nun momento.',
    hintReadyToCheck: 'Todo encaixa! Xa podes comprobar a túa resposta.',
    hintHighlightedClue: 'Esta pista pode axudarche agora.',
    hintCharacterDeducible: (name) => `Podes deducir o lugar de ${name}.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Unha pequena axuda: ${name} encaixa en ${position}.`
        : `Unha pequena axuda: xa podes atopar o lugar de ${name}.`,
    hintAlreadyCorrect: (name) => `${name} xa está no lugar correcto.`,
    hintApplied: (name) => `Pista aplicada: ${name} xa está no seu espazo.`,
  },
  fr: {
    assignmentIncomplete: 'Il reste un ami à placer. Continue quand tu veux !',
    assignmentIncorrect: 'Tu y es presque ! Relis les indices et essaie une autre combinaison.',
    assignmentCorrect: 'Fantastique ! Tu as résolu le puzzle grâce à une belle déduction.',
    placementConflictsCleared: (name, count) =>
      `Nous avons fait de la place pour ${name} : ${
        count === 1 ? 'une personne retourne' : `${count} personnes retournent`
      } dans la réserve. Tu peux annuler ce changement.`,
    hintPersonRequired: 'Choisis la personne qui a besoin d’un indice.',
    hintLimitReached: 'Tu as assez d’indices pour trouver la dernière place.',
    hintPuzzlePreparing: 'Ce puzzle est encore en préparation. Réessaie dans un instant.',
    hintReadyToCheck: 'Tout correspond ! Tu peux vérifier ta réponse.',
    hintHighlightedClue: 'Cet indice peut t’aider maintenant.',
    hintCharacterDeducible: (name) => `Tu peux déduire la place de ${name}.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Un petit coup de pouce : ${name} va à ${position}.`
        : `Un petit coup de pouce : tu peux maintenant trouver la place de ${name}.`,
    hintAlreadyCorrect: (name) => `${name} est déjà à la bonne place.`,
    hintApplied: (name) => `Indice appliqué : ${name} est maintenant au bon endroit.`,
  },
  de: {
    assignmentIncomplete: 'Jemand braucht noch einen Platz. Mach weiter, wenn du bereit bist!',
    assignmentIncorrect:
      'Fast geschafft! Lies die Hinweise und probiere eine andere Anordnung.',
    assignmentCorrect: 'Fantastisch! Du hast das Rätsel mit guter Logik gelöst.',
    placementConflictsCleared: (name, count) =>
      `Wir haben Platz für ${name} gemacht: ${
        count === 1 ? 'Eine Person kehrt' : `${count} Personen kehren`
      } in den Wartebereich zurück. Du kannst die Änderung rückgängig machen.`,
    hintPersonRequired: 'Wähle die Person aus, die einen Hinweis braucht.',
    hintLimitReached: 'Du hast genug Hinweise, um den letzten Platz zu finden.',
    hintPuzzlePreparing: 'Dieses Rätsel wird noch vorbereitet. Versuche es gleich noch einmal.',
    hintReadyToCheck: 'Alles passt! Du kannst deine Antwort jetzt prüfen.',
    hintHighlightedClue: 'Dieser Hinweis kann dir jetzt helfen.',
    hintCharacterDeducible: (name) => `Du kannst den Platz von ${name} herausfinden.`,
    hintCharacterPosition: (name, position) =>
      position
        ? `Ein kleiner Tipp: ${name} gehört hierhin: ${position}.`
        : `Ein kleiner Tipp: Du kannst jetzt den Platz von ${name} finden.`,
    hintAlreadyCorrect: (name) => `${name} ist schon am richtigen Platz.`,
    hintApplied: (name) => `Hinweis angewendet: ${name} ist jetzt am richtigen Platz.`,
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
    case 'placement-conflicts-cleared':
      return copy.placementConflictsCleared(feedback.characterName, feedback.clearedCount)
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

export const checkResultCopy = (
  locale: Locale,
  feedback: CheckFeedback,
  showProgress: boolean,
) => {
  const copy = {
    ca: {
      almostTitle: 'Gairebé!',
      correctTitle: 'Tot encaixa!',
      incomplete: 'Continua completant el mapa i torna-ho a comprovar.',
      incorrect: 'Revisa les pistes i prova una combinació diferent.',
      correct: 'Has trobat el lloc de tothom.',
      score: (correct: number, total: number) => `${correct}/${total} ben ubicats`,
    },
    es: {
      almostTitle: '¡Casi!',
      correctTitle: '¡Todo encaja!',
      incomplete: 'Sigue completando el mapa y vuelve a comprobarlo.',
      incorrect: 'Revisa las pistas y prueba una combinación diferente.',
      correct: 'Has encontrado el lugar de todos.',
      score: (correct: number, total: number) => `${correct}/${total} bien colocados`,
    },
    en: {
      almostTitle: 'Almost!',
      correctTitle: 'Everything fits!',
      incomplete: 'Keep filling the map, then check again.',
      incorrect: 'Review the clues and try a different combination.',
      correct: 'You found a place for everyone.',
      score: (correct: number, total: number) => `${correct}/${total} in the right place`,
    },
    eu: {
      almostTitle: 'Ia-ia!',
      correctTitle: 'Dena bat dator!',
      incomplete: 'Jarraitu mapa osatzen eta egiaztatu berriro.',
      incorrect: 'Begiratu pistak eta probatu beste konbinazio bat.',
      correct: 'Guztientzako lekua aurkitu duzu.',
      score: (correct: number, total: number) => `${correct}/${total} leku egokian`,
    },
    gl: {
      almostTitle: 'Case!',
      correctTitle: 'Todo encaixa!',
      incomplete: 'Continúa completando o mapa e volve comprobalo.',
      incorrect: 'Revisa as pistas e proba unha combinación diferente.',
      correct: 'Atopaches o lugar de todos.',
      score: (correct: number, total: number) => `${correct}/${total} ben colocados`,
    },
    fr: {
      almostTitle: 'Tu y es presque !',
      correctTitle: 'Tout correspond !',
      incomplete: 'Continue à compléter le plateau, puis vérifie à nouveau.',
      incorrect: 'Relis les indices et essaie une autre combinaison.',
      correct: 'Tu as trouvé une place pour tout le monde.',
      score: (correct: number, total: number) => `${correct}/${total} bien placés`,
    },
    de: {
      almostTitle: 'Fast geschafft!',
      correctTitle: 'Alles passt!',
      incomplete: 'Vervollständige das Spielfeld und prüfe dann erneut.',
      incorrect: 'Lies die Hinweise und probiere eine andere Anordnung.',
      correct: 'Du hast für alle einen Platz gefunden.',
      score: (correct: number, total: number) => `${correct}/${total} richtig platziert`,
    },
  }[locale]
  const correct = feedback.type === 'assignment-correct'
  const message =
    feedback.type === 'assignment-incomplete'
      ? copy.incomplete
      : feedback.type === 'assignment-incorrect'
        ? copy.incorrect
        : copy.correct
  return {
    title: correct ? copy.correctTitle : copy.almostTitle,
    message,
    score: showProgress ? copy.score(feedback.correctCount, feedback.totalCount) : undefined,
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
    eu: {
      title: 'Misterio bat bidali dizute',
      welcome: 'Ongi etorri Logic Gardenera.',
      message: 'Norbaitek misterio hau bidali dizu. Ebatziko al duzu?',
      timedMessage: (time) =>
        `Norbaitek misterio hau bidali dizu eta ${time} behar izan du ebazteko. Marka hobetuko al duzu?`,
      play: 'Onartu erronka',
    },
    gl: {
      title: 'Enviáronche un misterio',
      welcome: 'Dámosche a benvida a Logic Garden.',
      message: 'Alguén che envía este misterio. Poderás resolvelo?',
      timedMessage: (time) =>
        `Alguén che envía este misterio. Resolveuno en ${time}. Poderás mellorar esa marca?`,
      play: 'Aceptar o reto',
    },
    fr: {
      title: 'On t’a envoyé un mystère',
      welcome: 'Bienvenue dans Logic Garden.',
      message: 'Quelqu’un t’envoie ce mystère. Sauras-tu le résoudre ?',
      timedMessage: (time) =>
        `Quelqu’un t’envoie ce mystère et l’a résolu en ${time}. Sauras-tu faire mieux ?`,
      play: 'Accepter le défi',
    },
    de: {
      title: 'Jemand hat dir ein Rätsel geschickt',
      welcome: 'Willkommen bei Logic Garden.',
      message: 'Jemand hat dir dieses Rätsel geschickt. Kannst du es lösen?',
      timedMessage: (time) =>
        `Jemand hat dir dieses Rätsel geschickt und es in ${time} gelöst. Bist du schneller?`,
      play: 'Herausforderung annehmen',
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
    eu: {
      improved: `Aurreko marka ${benchmark} zen; zuk ${current} behar izan duzu.`,
      completed: `Erronka ${current} denboran ebatzi duzu. Gainditu beharreko marka ${benchmark} zen.`,
      share: 'Bidali berriro zure markarekin edo atera txartel honen pantaila-argazkia.',
    },
    gl: {
      improved: `Superaches a marca de ${benchmark} cun tempo de ${current}.`,
      completed: `Reto resolto en ${current}. A marca que había que superar era ${benchmark}.`,
      share: 'Devólveo coa túa marca ou fai unha captura desta tarxeta.',
    },
    fr: {
      improved: `Tu as battu le chrono de ${benchmark} en terminant en ${current}.`,
      completed: `Défi résolu en ${current}. Le temps à battre était de ${benchmark}.`,
      share: 'Renvoie-le avec ton temps ou prends une capture de cette carte.',
    },
    de: {
      improved: `Du hast die Zeit von ${benchmark} unterboten und ${current} erreicht.`,
      completed: `Herausforderung in ${current} gelöst. Die Zeit, die es zu schlagen galt, war ${benchmark}.`,
      share: 'Schicke sie mit deiner Zeit zurück oder mache ein Bildschirmfoto dieser Karte.',
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
    eu: (puzzleTitle, mark) =>
      mark
        ? `Logic Gardeneko erronka: «${puzzleTitle}». ${mark} denboran ebatzi dut. Hobetu al dezakezu?`
        : `Logic Gardeneko erronka: «${puzzleTitle}». Ebatziko al duzu misterio hau?`,
    gl: (puzzleTitle, mark) =>
      mark
        ? `Un reto de Logic Garden: «${puzzleTitle}». Resolvino en ${mark}. Poderás mellorar a marca?`
        : `Un reto de Logic Garden: «${puzzleTitle}». Poderás resolver este misterio?`,
    fr: (puzzleTitle, mark) =>
      mark
        ? `Un défi Logic Garden : « ${puzzleTitle} ». Je l’ai résolu en ${mark}. Sauras-tu faire mieux ?`
        : `Un défi Logic Garden : « ${puzzleTitle} ». Sauras-tu résoudre ce mystère ?`,
    de: (puzzleTitle, mark) =>
      mark
        ? `Eine Logic-Garden-Herausforderung: „${puzzleTitle}“. Ich habe sie in ${mark} gelöst. Bist du schneller?`
        : `Eine Logic-Garden-Herausforderung: „${puzzleTitle}“. Kannst du dieses Rätsel lösen?`,
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
      eu: {
        title: 'Jokatu konexiorik gabe ere',
        ios: 'Ukitu Partekatu eta gero «Gehitu hasierako pantailara».',
        android:
          'Ukitu Instalatu. Ez bada agertzen, ireki menua eta aukeratu «Instalatu aplikazioa».',
        dismiss: 'Orain ez',
      },
      gl: {
        title: 'Xoga tamén sen conexión',
        ios: 'Toca Compartir e despois «Engadir á pantalla de inicio».',
        android: 'Toca Instalar. Se non aparece, abre o menú e escolle «Instalar aplicación».',
        dismiss: 'Agora non',
      },
      fr: {
        title: 'Joue aussi hors connexion',
        ios: 'Touche Partager, puis « Sur l’écran d’accueil ».',
        android:
          'Touche Installer. Si ce choix n’apparaît pas, ouvre le menu et choisis « Installer l’application ».',
        dismiss: 'Pas maintenant',
      },
      de: {
        title: 'Auch offline spielen',
        ios: 'Tippe auf Teilen und dann auf „Zum Home-Bildschirm“.',
        android:
          'Tippe auf Installieren. Falls die Option fehlt, öffne das Menü und wähle „App installieren“.',
        dismiss: 'Nicht jetzt',
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
    eu: {
      moveToPosition: 'Eraman hautatutako pertsona hona',
      selectPosition: 'Aukeratu leku hau',
    },
    gl: {
      moveToPosition: 'Move o personaxe seleccionado a',
      selectPosition: 'Escolle este lugar',
    },
    fr: {
      moveToPosition: 'Déplacer le personnage sélectionné',
      selectPosition: 'Choisir cet emplacement',
    },
    de: {
      moveToPosition: 'Ausgewählte Figur verschieben',
      selectPosition: 'Diesen Platz auswählen',
    },
  }
  return {
    moveToPosition: (positionLabel: string) =>
      `${copy[locale].moveToPosition}: ${positionLabel}`,
    selectPosition: (positionLabel: string) =>
      `${copy[locale].selectPosition}: ${positionLabel}`,
  }
}

const collectionCopy: Record<
  Locale,
  Record<
    PuzzleCollection,
    { label: string; description: string; detail: string; eyebrow: string; title: string }
  >
> = {
  ca: {
    children: {
      label: 'Infantil',
      description: 'Mapes amables per començar',
      detail: '2×2, 2×3 i 2×4',
      eyebrow: 'Aventures dibuixades',
      title: 'Descobreix on va cada amic.',
    },
    'two-dimensional': {
      label: 'Puzzles 2D',
      description: 'Espais, objectes i deducció',
      detail: 'Graelles 6×6, 9×9 i 16×16',
      eyebrow: 'Escenaris per explorar',
      title: 'Llegeix l’espai. Fes encaixar la història.',
    },
    'three-dimensional': {
      label: 'Puzzles 3D',
      description: 'Botigues, veïns i edificis de diferents alçades',
      detail: 'Edifici de 3 a 10 plantes',
      eyebrow: 'Deducció en alçada',
      title: 'Resol tot un edifici, pis a pis.',
    },
  },
  es: {
    children: {
      label: 'Infantil',
      description: 'Mapas amables para empezar',
      detail: '2×2, 2×3 y 2×4',
      eyebrow: 'Aventuras ilustradas',
      title: 'Descubre dónde va cada amigo.',
    },
    'two-dimensional': {
      label: 'Puzles 2D',
      description: 'Espacios, objetos y deducción',
      detail: 'Cuadrículas 6×6, 9×9 y 16×16',
      eyebrow: 'Escenarios por explorar',
      title: 'Lee el espacio. Haz encajar la historia.',
    },
    'three-dimensional': {
      label: 'Puzles 3D',
      description: 'Tiendas, vecinos y edificios de distintas alturas',
      detail: 'Edificio de 3 a 10 plantas',
      eyebrow: 'Deducción en altura',
      title: 'Resuelve todo un edificio, planta a planta.',
    },
  },
  en: {
    children: {
      label: 'Children',
      description: 'Friendly maps for getting started',
      detail: '2×2, 2×3, and 2×4',
      eyebrow: 'Illustrated adventures',
      title: 'Discover where every friend belongs.',
    },
    'two-dimensional': {
      label: '2D puzzles',
      description: 'Places, objects, and deduction',
      detail: '6×6, 9×9, and 16×16 grids',
      eyebrow: 'Scenes to explore',
      title: 'Read the space. Make the story fit.',
    },
    'three-dimensional': {
      label: '3D puzzles',
      description: 'Shops, neighbors, and buildings of different heights',
      detail: '3–10-floor building',
      eyebrow: 'Deduction with height',
      title: 'Solve a whole building, floor by floor.',
    },
  },
  eu: {
    children: {
      label: 'Haurrak',
      description: 'Hasteko mapa atseginak',
      detail: '2×2, 2×3 eta 2×4',
      eyebrow: 'Marraztutako abenturak',
      title: 'Aurkitu lagun bakoitzaren lekua.',
    },
    'two-dimensional': {
      label: '2D puzzleak',
      description: 'Espazioak, objektuak eta dedukzioa',
      detail: '6×6, 9×9 eta 16×16 saretak',
      eyebrow: 'Arakatzeko agertokiak',
      title: 'Aztertu espazioa. Osatu istorioa.',
    },
    'three-dimensional': {
      label: '3D puzzleak',
      description: 'Dendak, bizilagunak eta altuera desberdineko eraikinak',
      detail: '3-10 solairuko eraikina',
      eyebrow: 'Altuerako dedukzioa',
      title: 'Ebatzi eraikin osoa, solairuz solairu.',
    },
  },
  gl: {
    children: {
      label: 'Infantil',
      description: 'Mapas amables para comezar',
      detail: '2×2, 2×3 e 2×4',
      eyebrow: 'Aventuras ilustradas',
      title: 'Descubre onde vai cada amigo.',
    },
    'two-dimensional': {
      label: 'Quebracabezas 2D',
      description: 'Espazos, obxectos e dedución',
      detail: 'Grades 6×6, 9×9 e 16×16',
      eyebrow: 'Escenarios por explorar',
      title: 'Observa o espazo. Fai encaixar a historia.',
    },
    'three-dimensional': {
      label: 'Quebracabezas 3D',
      description: 'Tendas, veciños e edificios de distintas alturas',
      detail: 'Edificio de 3 a 10 plantas',
      eyebrow: 'Dedución en altura',
      title: 'Resolve un edificio enteiro, andar por andar.',
    },
  },
  fr: {
    children: {
      label: 'Enfants',
      description: 'Des cartes accueillantes pour commencer',
      detail: '2×2, 2×3 et 2×4',
      eyebrow: 'Aventures illustrées',
      title: 'Découvre la place de chaque ami.',
    },
    'two-dimensional': {
      label: 'Puzzles 2D',
      description: 'Espaces, objets et déduction',
      detail: 'Grilles 6×6, 9×9 et 16×16',
      eyebrow: 'Scènes à explorer',
      title: 'Observe les lieux. Fais concorder l’histoire.',
    },
    'three-dimensional': {
      label: 'Puzzles 3D',
      description: 'Boutiques, voisins et immeubles de différentes hauteurs',
      detail: 'Immeuble de 3 à 10 niveaux',
      eyebrow: 'Déduction en hauteur',
      title: 'Résous tout un immeuble, étage par étage.',
    },
  },
  de: {
    children: {
      label: 'Kinder',
      description: 'Freundliche Karten für den Einstieg',
      detail: '2×2, 2×3 und 2×4',
      eyebrow: 'Illustrierte Abenteuer',
      title: 'Finde heraus, wo jeder Freund hingehört.',
    },
    'two-dimensional': {
      label: '2D-Rätsel',
      description: 'Räume, Objekte und Logik',
      detail: 'Raster mit 6×6, 9×9 und 16×16 Feldern',
      eyebrow: 'Szenen zum Erkunden',
      title: 'Erkunde die Räume. Füge die Geschichte zusammen.',
    },
    'three-dimensional': {
      label: '3D-Rätsel',
      description: 'Geschäfte, Nachbarn und Gebäude unterschiedlicher Höhe',
      detail: 'Gebäude mit 3 bis 10 Etagen',
      eyebrow: 'Logik über mehrere Stockwerke',
      title: 'Löse ein ganzes Gebäude, Stockwerk für Stockwerk.',
    },
  },
}

export const puzzleCollectionCopy = (locale: Locale, collection: PuzzleCollection) =>
  collectionCopy[locale][collection]

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
  eu: {
    'forest-party': 'Basoko festa',
    'treasure-island': 'Ezustekoen uhartea',
    'kind-magic-school': 'Magia atseginaren eskola',
    'space-trip': 'Espazioko bidaia',
    'fun-farm': 'Baserri dibertigarria',
    'sea-garden': 'Itsas lorategia',
    'dino-park': 'Dinosauro atseginen parkea',
    'friendly-monster-town': 'Munstro atseginen herria',
    'color-fair': 'Koloreen azoka',
    'mountain-trip': 'Mendiko txangoa',
    'music-studio': 'Musika-estudioa',
    'sports-festival': 'Kirol-jaialdia',
    'creative-lab': 'Sormen-laborategia',
    'book-club': 'Irakurketa-kluba',
    'city-garden': 'Auzoko lorategia',
    'weekend-market': 'Larunbateko merkatua',
  },
  gl: {
    'forest-party': 'A festa do bosque',
    'treasure-island': 'A illa das sorpresas',
    'kind-magic-school': 'A escola de maxia amable',
    'space-trip': 'Viaxe polo espazo',
    'fun-farm': 'A granxa divertida',
    'sea-garden': 'O xardín mariño',
    'dino-park': 'O parque dos dinosauros simpáticos',
    'friendly-monster-town': 'A vila dos monstros amigables',
    'color-fair': 'A feira das cores',
    'mountain-trip': 'Excursión á montaña',
    'music-studio': 'O estudio de música',
    'sports-festival': 'O festival dos deportes',
    'creative-lab': 'O laboratorio creativo',
    'book-club': 'O club de lectura',
    'city-garden': 'O xardín do barrio',
    'weekend-market': 'O mercado do sábado',
  },
  fr: {
    'forest-party': 'La fête de la forêt',
    'treasure-island': 'L’île aux surprises',
    'kind-magic-school': 'L’école de magie bienveillante',
    'space-trip': 'Voyage dans l’espace',
    'fun-farm': 'La ferme joyeuse',
    'sea-garden': 'Le jardin marin',
    'dino-park': 'Le parc des gentils dinosaures',
    'friendly-monster-town': 'Le village des monstres sympathiques',
    'color-fair': 'La foire aux couleurs',
    'mountain-trip': 'Excursion à la montagne',
    'music-studio': 'Le studio de musique',
    'sports-festival': 'La fête du sport',
    'creative-lab': 'Le laboratoire créatif',
    'book-club': 'Le club de lecture',
    'city-garden': 'Le jardin du quartier',
    'weekend-market': 'Le marché du samedi',
  },
  de: {
    'forest-party': 'Das Waldfest',
    'treasure-island': 'Die Insel der Überraschungen',
    'kind-magic-school': 'Die freundliche Zauberschule',
    'space-trip': 'Reise ins Weltall',
    'fun-farm': 'Der lustige Bauernhof',
    'sea-garden': 'Der Meeresgarten',
    'dino-park': 'Der Park der freundlichen Dinosaurier',
    'friendly-monster-town': 'Die Stadt der freundlichen Monster',
    'color-fair': 'Das Farbenfest',
    'mountain-trip': 'Ausflug in die Berge',
    'music-studio': 'Das Musikstudio',
    'sports-festival': 'Das Sportfest',
    'creative-lab': 'Das Kreativlabor',
    'book-club': 'Der Leseclub',
    'city-garden': 'Der Nachbarschaftsgarten',
    'weekend-market': 'Der Samstagsmarkt',
  },
}

export const themeCopy = (locale: Locale, themeId: ThemeId) => {
  const title = titles[locale][themeId]
  const messages: Record<Locale, { introduction: string; objective: string; victory: string }> =
    {
      ca: {
        introduction: `A l’aventura «${title}», cada amic té un lloc per descobrir.`,
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
      eu: {
        introduction: `«${title}» abenturan, lagun bakoitzak aurkitzeko leku bat du.`,
        objective: 'Irakurri pistak eta aurkitu lagun bakoitzaren lekua.',
        victory: 'Oso ondo! Lagun guztiek aurkitu dute beren lekua.',
      },
      gl: {
        introduction: `Na aventura «${title}», cada amigo ten un lugar por descubrir.`,
        objective: 'Le as pistas e atopa o lugar de cada amigo.',
        victory: 'Moi ben! Todos os amigos atoparon o seu lugar.',
      },
      fr: {
        introduction: `Dans l’aventure « ${title} », chaque ami a une place à découvrir.`,
        objective: 'Lis les indices et trouve la place de chaque ami.',
        victory: 'Bravo ! Tous les amis ont trouvé leur place.',
      },
      de: {
        introduction: `Im Abenteuer „${title}“ hat jeder Freund einen Platz, den du entdecken kannst.`,
        objective: 'Lies die Hinweise und finde den Platz jedes Freundes.',
        victory: 'Gut gemacht! Alle Freunde haben ihren Platz gefunden.',
      },
    }
  return { title, ...messages[locale] }
}
