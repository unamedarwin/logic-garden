import type { ThemeId } from './types'

export interface ThemeCharacter {
  readonly name: string
  readonly emoji: string
  readonly description: string
}

export interface ThemeItem {
  readonly label: string
  readonly emoji: string
}

export interface Theme {
  readonly id: ThemeId
  readonly title: string
  readonly introductions: readonly string[]
  readonly objectives: readonly string[]
  readonly places: readonly string[]
  readonly characters: readonly ThemeCharacter[]
  readonly items: readonly ThemeItem[]
  readonly victories: readonly string[]
}

const sharedNames = [
  ['Aina', '🦊', 'una guineu curiosa'],
  ['Biel', '🐻', 'un os amable'],
  ['Cora', '🐰', 'una conilla riallera'],
  ['Duna', '🦉', 'una òliba observadora'],
  ['Èric', '🐸', 'una granota saltadora'],
  ['Fina', '🐼', 'una panda creativa'],
  ['Gala', '🦋', 'una papallona brillant'],
  ['Hugo', '🐢', 'una tortuga tranquil·la'],
] as const

const makeCharacters = (emojiOverrides: readonly string[]): readonly ThemeCharacter[] =>
  sharedNames.map(([name, emoji, description], index) => ({
    name,
    emoji: emojiOverrides[index] ?? emoji,
    description,
  }))

export const themes: readonly Theme[] = [
  {
    id: 'forest-party',
    title: 'La festa del bosc',
    introductions: ['Al bosc ja està tot preparat per a una festa plena de colors.'],
    objectives: ['Ajuda cada amic a trobar el seu racó de la festa.'],
    places: [
      'La clariana',
      'L’arbre gran',
      'El pont de fusta',
      'El jardí de flors',
      'La cabana',
      'El rierol',
      'La roca rodona',
      'La praderia',
    ],
    characters: makeCharacters(['🦊', '🐻', '🐰', '🦉', '🐸', '🐼', '🦋', '🐢']),
    items: [
      ['galeta', '🍪'],
      ['flor', '🌼'],
      ['globus', '🎈'],
      ['barret', '🎩'],
      ['poma', '🍎'],
      ['llibre', '📘'],
      ['estrella', '⭐'],
      ['fulla', '🍃'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['Quina festa més ben organitzada!'],
  },
  {
    id: 'treasure-island',
    title: 'L’illa de les sorpreses',
    introductions: ['Una illa assolellada guarda petits regals per compartir.'],
    objectives: ['Descobreix on espera cada explorador amable.'],
    places: [
      'La platja suau',
      'La palmera',
      'La cova de petxines',
      'El far',
      'El moll',
      'La duna daurada',
      'La llacuna',
      'El mirador',
    ],
    characters: makeCharacters(['🦜', '🐬', '🦀', '🐢', '🐠', '🦭', '🐙', '🐳']),
    items: [
      ['petxina', '🐚'],
      ['mapa', '🗺️'],
      ['pinya', '🍍'],
      ['banderí', '🚩'],
      ['sol', '☀️'],
      ['cubell', '🪣'],
      ['corall', '🪸'],
      ['barqueta', '⛵'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['Totes les sorpreses han trobat el seu lloc!'],
  },
  {
    id: 'kind-magic-school',
    title: 'L’escola de màgia amable',
    introductions: ['A l’escola, la màgia serveix per fer créixer flors i somriures.'],
    objectives: ['Ordena els aprenents als seus espais preferits.'],
    places: [
      'La biblioteca',
      'L’aula d’estrelles',
      'El pati',
      'La torre',
      'El taller',
      'L’hivernacle',
      'La sala de música',
      'El passadís arc de Sant Martí',
    ],
    characters: makeCharacters(['🧙', '🧚', '🧝', '🦄', '🐱', '🦉', '🐇', '🐲']),
    items: [
      ['vareta de flors', '🌷'],
      ['poció de bombolles', '🫧'],
      ['llibre de contes', '📕'],
      ['estrella', '🌟'],
      ['capa', '🧣'],
      ['clau daurada', '🗝️'],
      ['ploma', '🪶'],
      ['cristall', '🔮'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La màgia amable ho ha deixat tot a punt!'],
  },
  {
    id: 'space-trip',
    title: 'Viatge per l’espai',
    introductions: ['La tripulació visita planetes plens de formes i melodies.'],
    objectives: ['Troba l’estació perfecta per a cada viatger.'],
    places: [
      'El planeta blau',
      'L’estació musical',
      'La lluna petita',
      'El jardí estel·lar',
      'El coet',
      'L’observatori',
      'El núvol còsmic',
      'L’anella brillant',
    ],
    characters: makeCharacters(['👩‍🚀', '🤖', '👾', '🛸', '🐙', '🦊', '🐻', '🐰']),
    items: [
      ['coet petit', '🚀'],
      ['planeta', '🪐'],
      ['estrella', '⭐'],
      ['satèl·lit', '🛰️'],
      ['flor lunar', '🌙'],
      ['robotet', '🤖'],
      ['cometa', '☄️'],
      ['auriculars', '🎧'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La tripulació ja pot continuar la seva aventura!'],
  },
  {
    id: 'fun-farm',
    title: 'La granja divertida',
    introductions: ['A la granja hi ha un munt de feines agradables per repartir.'],
    objectives: ['Acompanya cada animal al seu racó.'],
    places: [
      'L’hort',
      'El paller',
      'L’estable',
      'El pomer',
      'La bassa',
      'El molí',
      'La tanca blava',
      'La caseta',
    ],
    characters: makeCharacters(['🐮', '🐷', '🐔', '🐑', '🐴', '🦆', '🐐', '🐇']),
    items: [
      ['pastanaga', '🥕'],
      ['blat', '🌾'],
      ['llet', '🥛'],
      ['poma', '🍏'],
      ['regadora', '🪴'],
      ['cistell', '🧺'],
      ['flor', '🌻'],
      ['campaneta', '🔔'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La granja està plena d’alegria!'],
  },
  {
    id: 'sea-garden',
    title: 'El jardí marí',
    introductions: ['Sota el mar, els amics preparen una dansa de bombolles.'],
    objectives: ['Col·loca cada amic marí al seu espai de colors.'],
    places: [
      'El corall rosa',
      'La cova blava',
      'L’alguer',
      'La petxina gran',
      'La roca cantant',
      'El jardí de perles',
      'La bombolla gegant',
      'El sorral',
    ],
    characters: makeCharacters(['🐠', '🐙', '🦀', '🐬', '🐳', '🦭', '🐡', '🦑']),
    items: [
      ['perla', '🫧'],
      ['petxina', '🐚'],
      ['corall', '🪸'],
      ['alga', '🌿'],
      ['estrella marina', '⭐'],
      ['peixet', '🐟'],
      ['bombolla', '🫧'],
      ['corona', '👑'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La dansa marina ja pot començar!'],
  },
  {
    id: 'dino-park',
    title: 'El parc de dinosaures simpàtics',
    introductions: ['Els dinosaures del parc preparen una excursió tranquil·la.'],
    objectives: ['Ajuda cada dinosaure a trobar la seva parada.'],
    places: [
      'El niu de fulles',
      'El llac',
      'La roca alta',
      'El bosc de falgueres',
      'La vall',
      'El pont',
      'La font',
      'El turó',
    ],
    characters: makeCharacters(['🦕', '🦖', '🐢', '🦜', '🐘', '🦒', '🐊', '🦛']),
    items: [
      ['fulla', '🍃'],
      ['petjada', '👣'],
      ['poma', '🍎'],
      ['motxilla', '🎒'],
      ['flor', '🌺'],
      ['prismàtics', '🔭'],
      ['pedreta', '🪨'],
      ['sol', '☀️'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['El parc està llest per a l’excursió!'],
  },
  {
    id: 'friendly-monster-town',
    title: 'El poble de monstres amistosos',
    introductions: ['Al poble, tothom ajuda a decorar la plaça.'],
    objectives: ['Troba la casella de cada veí amistós.'],
    places: [
      'La plaça',
      'La fleca',
      'El taller',
      'La font',
      'El cinema',
      'La biblioteca',
      'El jardí',
      'La caseta groga',
    ],
    characters: makeCharacters(['👾', '🤖', '👽', '🧌', '🦄', '🐲', '🧸', '🐱']),
    items: [
      ['banderí', '🎏'],
      ['pastís', '🍰'],
      ['flor', '🌸'],
      ['pintura', '🎨'],
      ['música', '🎵'],
      ['llibre', '📚'],
      ['globus', '🎈'],
      ['galeta', '🍪'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La plaça ha quedat preciosa!'],
  },
  {
    id: 'color-fair',
    title: 'La fira de colors',
    introductions: ['La fira té jocs suaus, música i moltes banderoles.'],
    objectives: ['Reparteix els amics per les parades de la fira.'],
    places: [
      'La roda de colors',
      'La parada groga',
      'El teatre',
      'El jardí de globus',
      'La carpa',
      'El carrusel',
      'El racó de contes',
      'La fonteta',
    ],
    characters: makeCharacters(['🦋', '🐝', '🦊', '🐰', '🐼', '🐸', '🐻', '🦉']),
    items: [
      ['globus', '🎈'],
      ['entrada', '🎟️'],
      ['pinzell', '🖌️'],
      ['flor', '🌼'],
      ['cor', '💛'],
      ['cinta', '🎀'],
      ['conte', '📗'],
      ['estrella', '✨'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['La fira és un arc de Sant Martí d’alegria!'],
  },
  {
    id: 'mountain-trip',
    title: 'Excursió a la muntanya',
    introductions: ['Un grup d’amics surt a observar núvols, flors i panoràmiques.'],
    objectives: ['Ajuda cada excursionista a trobar la seva parada.'],
    places: [
      'El refugi',
      'El mirador',
      'El prat',
      'La cascada suau',
      'El bosc',
      'El pontet',
      'La cova de colors',
      'El cim',
    ],
    characters: makeCharacters(['🦌', '🐿️', '🦉', '🦊', '🐻', '🐐', '🦋', '🐇']),
    items: [
      ['motxilla', '🎒'],
      ['cantimplora', '💧'],
      ['flor', '🌷'],
      ['fulla', '🍂'],
      ['prismàtics', '🔭'],
      ['mapa', '🗺️'],
      ['barret', '🧢'],
      ['poma', '🍏'],
    ].map(([label, emoji]) => ({ label, emoji })),
    victories: ['Quina excursió tan ben pensada!'],
  },
] as readonly Theme[]

export const getTheme = (id: ThemeId) => {
  const theme = themes.find((candidate) => candidate.id === id)
  if (!theme) throw new Error(`Tema desconegut: ${id}`)
  return theme
}
