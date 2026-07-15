import { SeededRandom } from '../generator/seededRandom'
import type { Locale, ThemeId } from './types'

// cspell:disable -- reviewed story copy intentionally contains all supported locales.

export const illustratedThemeIds = [
  'forest-party',
  'treasure-island',
  'kind-magic-school',
  'space-trip',
  'fun-farm',
  'sea-garden',
  'dino-park',
  'friendly-monster-town',
  'color-fair',
  'mountain-trip',
] as const satisfies readonly ThemeId[]

export type IllustratedThemeId = (typeof illustratedThemeIds)[number]
export type IllustratedMysteryKind =
  | 'scrambled-clues'
  | 'missing-detail'
  | 'mysterious-note'
  | 'scattered-signs'
  | 'conflicting-memories'
  | 'hidden-trail'
export type IllustratedStoryBeat = 'discovery' | 'connection' | 'reveal'
export type IllustratedThreadRole = 'witness' | 'connector' | 'finder' | 'skeptic'
export type IllustratedProgressStage = 'opening' | 'gathering' | 'connecting' | 'proposal'
export type IllustratedThreadArc =
  'remember' | 'notice' | 'help' | 'question' | 'connect' | 'prepare'
type StoryObjectiveId = 'locate-friends' | 'fit-places' | 'follow-clues' | 'recover-story'
type StoryVictoryId = 'case-solved' | 'everything-fits' | 'story-restored' | 'last-clue'
export type IllustratedPremiseId = 'trail' | 'surprise' | 'event'

export interface IllustratedStoryCopy {
  readonly title: string
  readonly subject: string
  readonly introduction: string
  readonly objective: string
  readonly victory: string
  readonly mysteryKind: IllustratedMysteryKind
  readonly premiseId: IllustratedPremiseId
  readonly storySignature: string
}

export interface IllustratedProgressCopy {
  readonly label: string
  readonly text: string
}

interface MysteryTemplate {
  readonly kind: IllustratedMysteryKind
  readonly introduction: string
}

interface ThemeStoryPremise {
  readonly subject: string
  readonly success: string
}

interface ThemeStoryMotif {
  readonly record: string
  readonly success: string
}

type NonEmpty<Value> = readonly [Value, ...Value[]]

interface StoryLocaleKit {
  readonly groupName: string
  readonly mysteries: NonEmpty<MysteryTemplate>
  readonly objectives: Readonly<Record<StoryObjectiveId, string>>
  readonly victories: Readonly<Record<StoryVictoryId, string>>
  readonly prompts: Readonly<Record<IllustratedThreadRole, NonEmpty<string>>>
  readonly beats: Readonly<Record<IllustratedStoryBeat, NonEmpty<string>>>
}

export const isIllustratedTheme = (themeId: ThemeId): themeId is IllustratedThemeId =>
  illustratedThemeIds.some((candidate) => candidate === themeId)

const themePremiseIds = [
  'trail',
  'surprise',
  'event',
] as const satisfies readonly IllustratedPremiseId[]

const illustratedThreadArcIds = [
  'remember',
  'notice',
  'help',
  'question',
  'connect',
  'prepare',
] as const satisfies readonly IllustratedThreadArc[]

const storyVictoriesForObjective: Readonly<Record<StoryObjectiveId, NonEmpty<StoryVictoryId>>> =
  {
    'locate-friends': ['case-solved', 'last-clue'],
    'fit-places': ['everything-fits', 'case-solved'],
    'follow-clues': ['last-clue', 'story-restored'],
    'recover-story': ['story-restored', 'everything-fits'],
  }

const storyObjectivesForMystery: Readonly<
  Record<IllustratedMysteryKind, NonEmpty<StoryObjectiveId>>
> = {
  'scrambled-clues': ['fit-places', 'recover-story', 'locate-friends'],
  'missing-detail': ['follow-clues', 'recover-story', 'locate-friends'],
  'mysterious-note': ['follow-clues', 'locate-friends', 'fit-places'],
  'scattered-signs': ['follow-clues', 'locate-friends', 'recover-story'],
  'conflicting-memories': ['fit-places', 'recover-story', 'locate-friends'],
  'hidden-trail': ['follow-clues', 'locate-friends', 'recover-story'],
}

const renderTemplate = (template: string, values: Readonly<Record<string, string>>) =>
  Object.entries(values).reduce(
    (rendered, [key, value]) => rendered.replaceAll(`{${key}}`, value),
    template,
  )

const selectStable = <Value>(source: string, values: NonEmpty<Value>) =>
  new SeededRandom(source).pick(values)

const storyKits: Readonly<Record<Locale, StoryLocaleKit>> = {
  ca: {
    groupName: 'El grup',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'A «{title}», s’han barrejat unes pistes: «{subject}». {hero} pregunta què recorda cada amic.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'A «{title}», falta un detall per completar «{subject}». {hero} busca qui el recorda.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'A «{title}», una nota diu que «{subject}» amaga una sorpresa. {hero} reuneix les pistes.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'A «{title}», hi ha senyals escampats: «{subject}». {hero} refà el recorregut.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'A «{title}», els records sobre «{subject}» no coincideixen. {hero} vol descobrir quina història encaixa.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'A «{title}», «{subject}» deixa una pista a cada lloc. {hero} segueix el rastre fins al final.',
      },
    ],
    objectives: {
      'locate-friends': 'Ordena els records i descobreix on era cada amic.',
      'fit-places': 'Situa tothom fins que totes les versions encaixin.',
      'follow-clues': 'Segueix les pistes i situa tothom per reconstruir la història.',
      'recover-story': 'Escolta els records i descobreix on era tothom.',
    },
    victories: {
      'case-solved': 'Cas resolt! {success}.',
      'everything-fits': 'Tot encaixa! {success}.',
      'story-restored': 'Has reconstruït la història. {success}.',
      'last-clue': 'L’última pista encaixa. {success}.',
    },
    prompts: {
      witness: [
        '{name} recorda una escena',
        '{name} explica què va veure',
        'El record de {name}',
        '{name} recupera un record',
      ],
      connector: [
        '{name} uneix dues versions',
        '{name} recorda com estaven els altres',
        '{name} fa encaixar dos records',
        '{name} troba una connexió',
      ],
      finder: [
        '{name} ha trobat un detall',
        '{name} assenyala un lloc clau',
        '{name} recorda un detall del mapa',
        '{name} descobreix una pista nova',
      ],
      skeptic: [
        '{name} descarta una idea',
        '{name} recorda què no va passar',
        '{name} elimina una possibilitat',
        '{name} descarta una altra possibilitat',
      ],
    },
    beats: {
      discovery: [
        'Detall del misteri',
        'Una nova troballa',
        'Apareix un detall',
        'Torna un record',
      ],
      connection: [
        'Dues versions encaixen',
        'Els records es connecten',
        'Apareix una relació',
        'Dues peces comencen a encaixar',
      ],
      reveal: [
        'Detall important',
        'Una peça important',
        'Un gir possible',
        'Una connexió clau',
      ],
    },
  },
  es: {
    groupName: 'El grupo',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'En «{title}», las pistas de «{subject}» se han mezclado. {hero} pregunta qué recuerda cada amigo.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'En «{title}», falta el último detalle de «{subject}». {hero} busca quién lo recuerda.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'En «{title}», una nota dice que «{subject}» esconde una sorpresa. {hero} reúne las pistas.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'En «{title}», las señales de «{subject}» aparecen en lugares distintos. {hero} reconstruye el recorrido.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'En «{title}», los recuerdos sobre «{subject}» no coinciden. {hero} quiere descubrir qué historia encaja.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'En «{title}», «{subject}» deja una pista en cada lugar. {hero} sigue el rastro hasta el final.',
      },
    ],
    objectives: {
      'locate-friends': 'Ordena los recuerdos y descubre dónde estaba cada amigo.',
      'fit-places': 'Coloca a cada persona hasta que todas las versiones encajen.',
      'follow-clues': 'Sigue las pistas y coloca a cada persona para reconstruir la historia.',
      'recover-story': 'Escucha los recuerdos y descubre dónde estaba cada persona.',
    },
    victories: {
      'case-solved': '¡Caso resuelto! {success}.',
      'everything-fits': '¡Todo encaja! {success}.',
      'story-restored': 'Has reconstruido la historia. {success}.',
      'last-clue': 'La última pista encaja. {success}.',
    },
    prompts: {
      witness: [
        '{name} recuerda una escena',
        '{name} cuenta qué vio',
        'El recuerdo de {name}',
        '{name} recupera un recuerdo',
      ],
      connector: [
        '{name} une dos relatos',
        '{name} recuerda quién estaba cerca',
        '{name} hace encajar dos recuerdos',
        '{name} encuentra una conexión',
      ],
      finder: [
        '{name} ha encontrado un detalle',
        '{name} señala un lugar clave',
        '{name} recuerda el lugar exacto',
        '{name} descubre una pista nueva',
      ],
      skeptic: [
        '{name} descarta una idea',
        '{name} recuerda qué no ocurrió',
        '{name} elimina una posibilidad',
        '{name} descarta otra posibilidad',
      ],
    },
    beats: {
      discovery: [
        'Detalle del misterio',
        'Un nuevo hallazgo',
        'Aparece un detalle',
        'Vuelve un recuerdo',
      ],
      connection: [
        'Dos versiones encajan',
        'Los recuerdos se conectan',
        'Aparece una relación',
        'Dos piezas empiezan a encajar',
      ],
      reveal: [
        'Detalle importante',
        'Una pieza importante',
        'Un giro posible',
        'Una conexión clave',
      ],
    },
  },
  en: {
    groupName: 'The group',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'In “{title},” the clues for “{subject}” are mixed up. {hero} asks what each friend remembers.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'In “{title},” the last detail of “{subject}” is missing. {hero} looks for who remembers it.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'In “{title},” a note says “{subject}” hides a surprise. {hero} gathers the clues.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'In “{title},” the signs for “{subject}” appear in different places. {hero} rebuilds the route.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'In “{title},” the memories about “{subject}” do not agree. {hero} wants to find which story fits.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'In “{title},” “{subject}” leaves a clue in each place. {hero} follows the trail to the end.',
      },
    ],
    objectives: {
      'locate-friends': 'Order the memories and discover where each friend was.',
      'fit-places': 'Place everyone until all the versions fit.',
      'follow-clues': 'Follow the clues and place everyone to rebuild the story.',
      'recover-story': 'Listen to the memories and discover where everyone was.',
    },
    victories: {
      'case-solved': 'Case solved! {success}.',
      'everything-fits': 'Everything fits! {success}.',
      'story-restored': 'You rebuilt the story. {success}.',
      'last-clue': 'The last clue fits. {success}.',
    },
    prompts: {
      witness: [
        '{name} remembers a scene',
        '{name} shares what they saw',
        'A memory from {name}',
        '{name} recovers a memory',
      ],
      connector: [
        '{name} connects two memories',
        '{name} remembers who was nearby',
        '{name} fits two memories together',
        '{name} finds a connection',
      ],
      finder: [
        '{name} found a detail',
        '{name} points to a key place',
        '{name} remembers the exact place',
        '{name} uncovers a new clue',
      ],
      skeptic: [
        '{name} rules out an idea',
        '{name} remembers what did not happen',
        '{name} removes one possibility',
        '{name} rules out another possibility',
      ],
    },
    beats: {
      discovery: ['Mystery detail', 'A new find', 'A new detail appears', 'A memory returns'],
      connection: [
        'Two stories fit',
        'The memories connect',
        'A link appears',
        'Two pieces begin to fit',
      ],
      reveal: ['Important detail', 'An important piece', 'A possible turn', 'A key connection'],
    },
  },
  eu: {
    groupName: 'Taldea',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          '«{title}» abenturan, «{subject}» gaiaren pistak nahasi dira. {hero} lagunak oroitzapenak bildu ditu.',
      },
      {
        kind: 'missing-detail',
        introduction:
          '«{title}» abenturan, «{subject}» gaiaren azken xehetasuna falta da. {hero} nork gogoratzen duen bilatzen ari da.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          '«{title}» abenturan, ohar batek dio «{subject}» gaiak sorpresa bat duela. {hero} pistak biltzen ari da.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          '«{title}» abenturan, «{subject}» gaiaren seinaleak leku desberdinetan agertu dira. {hero} ibilbidea berreraikitzen ari da.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          '«{title}» abenturan, «{subject}» gaiari buruzko oroitzapenak ez datoz bat. {hero} istorio zuzena bilatzen ari da.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          '«{title}» abenturan, «{subject}» gaiak pista bat utzi du leku bakoitzean. {hero} arrastoari jarraitzen ari da.',
      },
    ],
    objectives: {
      'locate-friends': 'Ordenatu oroitzapenak eta aurkitu lagun bakoitzaren lekua.',
      'fit-places': 'Jarri lagun bakoitza bertsio guztiak bat etorri arte.',
      'follow-clues': 'Jarraitu pistei eta kokatu lagun bakoitza istorioa berreraikitzeko.',
      'recover-story': 'Entzun oroitzapenak eta aurkitu lagun bakoitzaren lekua.',
    },
    victories: {
      'case-solved': 'Kasua argitu da! {success}.',
      'everything-fits': 'Dena bat dator! {success}.',
      'story-restored': 'Istorioa berreraiki duzu. {success}.',
      'last-clue': 'Azken pista bat dator. {success}.',
    },
    prompts: {
      witness: [
        '{name} lagunak eszena bat gogoratzen du',
        '{name} lagunak ikusitakoa kontatzen du',
        '{name} lagunaren oroitzapena',
        '{name} lagunak oroitzapen bat berreskuratu du',
      ],
      connector: [
        '{name} lagunak bi bertsio lotzen ditu',
        '{name} lagunak ingurukoak gogoratzen ditu',
        '{name} lagunak bi oroitzapen lotzen ditu',
        '{name} lagunak lotura bat aurkitu du',
      ],
      finder: [
        '{name} lagunak xehetasun bat aurkitu du',
        '{name} lagunak leku gakoa seinalatzen du',
        '{name} lagunak leku zehatza gogoratzen du',
        '{name} lagunak pista berri bat aurkitu du',
      ],
      skeptic: [
        '{name} lagunak ideia bat baztertzen du',
        '{name} lagunak gertatu ez zena gogoratzen du',
        '{name} lagunak aukera bat kentzen du',
        '{name} lagunak beste aukera bat baztertu du',
      ],
    },
    beats: {
      discovery: [
        'Misterioaren xehetasuna',
        'Aurkikuntza berria',
        'Xehetasun bat agertu da',
        'Oroitzapen bat itzuli da',
      ],
      connection: [
        'Bi bertsio bat datoz',
        'Oroitzapenak lotu dira',
        'Lotura bat agertu da',
        'Bi zatiak bat datoz',
      ],
      reveal: [
        'Xehetasun garrantzitsua',
        'Zati garrantzitsua',
        'Bira posiblea',
        'Lotura garrantzitsua',
      ],
    },
  },
  gl: {
    groupName: 'O grupo',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'En «{title}», as pistas de «{subject}» mesturáronse. {hero} pregunta o que lembra cada amigo.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'En «{title}», falta o último detalle de «{subject}». {hero} busca quen o lembra.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'En «{title}», unha nota di que «{subject}» agocha unha sorpresa. {hero} reúne as pistas.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'En «{title}», os sinais de «{subject}» aparecen en lugares distintos. {hero} reconstrúe o percorrido.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'En «{title}», as lembranzas sobre «{subject}» non coinciden. {hero} quere descubrir que historia encaixa.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'En «{title}», «{subject}» deixa unha pista en cada lugar. {hero} segue o rastro ata o final.',
      },
    ],
    objectives: {
      'locate-friends': 'Ordena as lembranzas e descubre onde estaba cada amigo.',
      'fit-places': 'Coloca cada persoa ata que todas as versións encaixen.',
      'follow-clues': 'Segue as pistas e coloca cada persoa para reconstruír a historia.',
      'recover-story': 'Escoita as lembranzas e descubre onde estaba cada persoa.',
    },
    victories: {
      'case-solved': 'Caso resolto! {success}.',
      'everything-fits': 'Todo encaixa! {success}.',
      'story-restored': 'Reconstruíches a historia. {success}.',
      'last-clue': 'A última pista encaixa. {success}.',
    },
    prompts: {
      witness: [
        '{name} lembra unha escena',
        '{name} conta o que viu',
        'A lembranza de {name}',
        '{name} recupera unha lembranza',
      ],
      connector: [
        '{name} une dous relatos',
        '{name} lembra quen estaba preto',
        '{name} fai encaixar dúas lembranzas',
        '{name} atopa unha conexión',
      ],
      finder: [
        '{name} atopou un detalle',
        '{name} sinala un lugar clave',
        '{name} lembra o lugar exacto',
        '{name} descobre unha pista nova',
      ],
      skeptic: [
        '{name} descarta unha idea',
        '{name} lembra o que non ocorreu',
        '{name} elimina unha posibilidade',
        '{name} descarta outra posibilidade',
      ],
    },
    beats: {
      discovery: [
        'Detalle do misterio',
        'Un novo achado',
        'Aparece un detalle',
        'Volve unha lembranza',
      ],
      connection: [
        'Dúas versións encaixan',
        'As lembranzas conéctanse',
        'Aparece unha relación',
        'Dúas pezas empezan a encaixar',
      ],
      reveal: [
        'Detalle importante',
        'Unha peza importante',
        'Un xiro posible',
        'Unha conexión clave',
      ],
    },
  },
  fr: {
    groupName: 'Le groupe',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'Dans « {title} », les indices de « {subject} » sont mélangés. {hero} interroge chaque ami.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'Dans « {title} », le dernier détail de « {subject} » manque. {hero} cherche qui s’en souvient.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'Dans « {title} », une note dit que « {subject} » cache une surprise. {hero} rassemble les indices.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'Dans « {title} », les signes de « {subject} » apparaissent à différents endroits. {hero} reconstitue le parcours.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'Dans « {title} », les souvenirs de « {subject} » ne concordent pas. {hero} cherche l’histoire qui convient.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'Dans « {title} », « {subject} » laisse un indice à chaque endroit. {hero} suit la piste jusqu’au bout.',
      },
    ],
    objectives: {
      'locate-friends': 'Classe les souvenirs et découvre où était chaque ami.',
      'fit-places': 'Place chaque personne jusqu’à ce que toutes les versions concordent.',
      'follow-clues': 'Suis les indices et place chaque personne pour reconstituer l’histoire.',
      'recover-story': 'Écoute les souvenirs et découvre où était chaque personne.',
    },
    victories: {
      'case-solved': 'Affaire résolue ! {success}.',
      'everything-fits': 'Tout concorde ! {success}.',
      'story-restored': 'Tu as reconstitué l’histoire. {success}.',
      'last-clue': 'Le dernier indice concorde. {success}.',
    },
    prompts: {
      witness: [
        '{name} se rappelle une scène',
        '{name} raconte ce qui s’est passé',
        'Le souvenir de {name}',
        '{name} retrouve un souvenir',
      ],
      connector: [
        '{name} relie deux récits',
        '{name} se rappelle qui était proche',
        '{name} assemble deux souvenirs',
        '{name} trouve un lien',
      ],
      finder: [
        '{name} a trouvé un détail',
        '{name} indique un lieu clé',
        '{name} se rappelle le lieu exact',
        '{name} découvre une nouvelle piste',
      ],
      skeptic: [
        '{name} écarte une idée',
        '{name} se rappelle ce qui n’est pas arrivé',
        '{name} élimine une possibilité',
        '{name} écarte une autre possibilité',
      ],
    },
    beats: {
      discovery: [
        'Détail du mystère',
        'Une nouvelle découverte',
        'Un détail apparaît',
        'Un souvenir revient',
      ],
      connection: [
        'Deux versions concordent',
        'Les souvenirs se relient',
        'Un lien apparaît',
        'Deux pièces commencent à concorder',
      ],
      reveal: [
        'Détail important',
        'Une pièce importante',
        'Un tournant possible',
        'Un lien essentiel',
      ],
    },
  },
  de: {
    groupName: 'Die Gruppe',
    mysteries: [
      {
        kind: 'scrambled-clues',
        introduction:
          'Bei „{title}“ sind die Hinweise zu „{subject}“ durcheinander. {hero} fragt nach den Erinnerungen.',
      },
      {
        kind: 'missing-detail',
        introduction:
          'Bei „{title}“ fehlt das letzte Detail von „{subject}“. {hero} sucht die passende Erinnerung.',
      },
      {
        kind: 'mysterious-note',
        introduction:
          'Bei „{title}“ sagt eine Notiz, dass „{subject}“ eine Überraschung verbirgt. {hero} sammelt die Hinweise.',
      },
      {
        kind: 'scattered-signs',
        introduction:
          'Bei „{title}“ erscheinen die Zeichen zu „{subject}“ an verschiedenen Orten. {hero} stellt den Weg wieder her.',
      },
      {
        kind: 'conflicting-memories',
        introduction:
          'Bei „{title}“ passen die Erinnerungen an „{subject}“ nicht zusammen. {hero} sucht die richtige Geschichte.',
      },
      {
        kind: 'hidden-trail',
        introduction:
          'Bei „{title}“ hinterlässt „{subject}“ an jedem Ort einen Hinweis. {hero} folgt der Spur bis zum Ende.',
      },
    ],
    objectives: {
      'locate-friends': 'Ordne die Erinnerungen und finde den Ort jeder Person.',
      'fit-places': 'Platziere alle, bis die Berichte zusammenpassen.',
      'follow-clues': 'Folge den Hinweisen und platziere alle, um die Geschichte zu ergänzen.',
      'recover-story': 'Vergleiche die Erinnerungen und finde den Platz jeder Person.',
    },
    victories: {
      'case-solved': 'Fall gelöst! {success}.',
      'everything-fits': 'Alles passt! {success}.',
      'story-restored': 'Du hast die Geschichte wiederhergestellt. {success}.',
      'last-clue': 'Der letzte Hinweis passt. {success}.',
    },
    prompts: {
      witness: [
        '{name} erinnert sich an eine Szene',
        '{name} erzählt, was passiert ist',
        'Die Erinnerung von {name}',
        '{name} findet eine Erinnerung wieder',
      ],
      connector: [
        '{name} verbindet zwei Berichte',
        '{name} erinnert sich an die Nähe',
        '{name} fügt zwei Erinnerungen zusammen',
        '{name} findet eine Verbindung',
      ],
      finder: [
        '{name} hat ein Detail gefunden',
        '{name} zeigt auf einen wichtigen Ort',
        '{name} erinnert sich an den genauen Ort',
        '{name} entdeckt einen neuen Hinweis',
      ],
      skeptic: [
        '{name} schließt eine Idee aus',
        '{name} erinnert sich, was nicht geschah',
        '{name} streicht eine Möglichkeit',
        '{name} schließt eine weitere Möglichkeit aus',
      ],
    },
    beats: {
      discovery: [
        'Rätseldetail',
        'Ein neuer Fund',
        'Ein Detail erscheint',
        'Eine Erinnerung kehrt zurück',
      ],
      connection: [
        'Zwei Berichte passen',
        'Die Erinnerungen verbinden sich',
        'Eine Verbindung erscheint',
        'Zwei Teile beginnen zu passen',
      ],
      reveal: [
        'Wichtiges Detail',
        'Ein wichtiges Teil',
        'Eine mögliche Wendung',
        'Eine wichtige Verbindung',
      ],
    },
  },
}

const themeMotifs: Readonly<
  Record<Locale, Readonly<Record<IllustratedThemeId, ThemeStoryMotif>>>
> = {
  ca: {
    'forest-party': {
      record: 'El pla de la festa',
      success: 'La festa del bosc ja pot començar',
    },
    'treasure-island': {
      record: 'El diari de l’illa',
      success: 'L’expedició ja sap on trobar-se',
    },
    'kind-magic-school': {
      record: 'El quadern de màgia amable',
      success: 'La classe màgica torna a brillar',
    },
    'space-trip': {
      record: 'El registre de la missió',
      success: 'La tripulació ja té la ruta',
    },
    'fun-farm': {
      record: 'El calendari de la granja',
      success: 'La jornada a la granja està preparada',
    },
    'sea-garden': {
      record: 'El guió de la dansa marina',
      success: 'La dansa de bombolles ja pot començar',
    },
    'dino-park': {
      record: 'El quadern de camp',
      success: 'L’excursió dels dinosaures està preparada',
    },
    'friendly-monster-town': {
      record: 'El plànol de la plaça',
      success: 'La plaça ja està preparada',
    },
    'color-fair': {
      record: 'El programa de la fira',
      success: 'La fira de colors ja pot obrir',
    },
    'mountain-trip': {
      record: 'El quadern de ruta',
      success: 'L’excursió ja té punt de trobada',
    },
  },
  es: {
    'forest-party': {
      record: 'El plan de la fiesta',
      success: 'La fiesta del bosque ya puede empezar',
    },
    'treasure-island': {
      record: 'El diario de la isla',
      success: 'La expedición ya sabe dónde reunirse',
    },
    'kind-magic-school': {
      record: 'El cuaderno de magia amable',
      success: 'La clase mágica vuelve a brillar',
    },
    'space-trip': {
      record: 'El registro de la misión',
      success: 'La tripulación ya tiene la ruta',
    },
    'fun-farm': {
      record: 'El calendario de la granja',
      success: 'La jornada en la granja está preparada',
    },
    'sea-garden': {
      record: 'El guion de la danza marina',
      success: 'La danza de burbujas ya puede empezar',
    },
    'dino-park': {
      record: 'El cuaderno de campo',
      success: 'La excursión de los dinosaurios está preparada',
    },
    'friendly-monster-town': {
      record: 'El plano de la plaza',
      success: 'La plaza ya está preparada',
    },
    'color-fair': {
      record: 'El programa de la feria',
      success: 'La feria de colores ya puede abrir',
    },
    'mountain-trip': {
      record: 'El cuaderno de ruta',
      success: 'La excursión ya tiene punto de encuentro',
    },
  },
  en: {
    'forest-party': { record: 'The party plan', success: 'The forest party can begin' },
    'treasure-island': {
      record: 'The island journal',
      success: 'The expedition knows where to meet',
    },
    'kind-magic-school': {
      record: 'The kind magic notebook',
      success: 'The magic class shines again',
    },
    'space-trip': { record: 'The mission log', success: 'The crew has its route' },
    'fun-farm': { record: 'The farm calendar', success: 'The farm day is ready' },
    'sea-garden': { record: 'The sea dance script', success: 'The bubble dance can begin' },
    'dino-park': { record: 'The field notebook', success: 'The dinosaur trip is ready' },
    'friendly-monster-town': { record: 'The square plan', success: 'The town square is ready' },
    'color-fair': { record: 'The fair program', success: 'The color fair can open' },
    'mountain-trip': { record: 'The route notebook', success: 'The trip has a meeting point' },
  },
  eu: {
    'forest-party': { record: 'Festaren plana', success: 'Basoko festa has daiteke' },
    'treasure-island': {
      record: 'Uharteko egunkaria',
      success: 'Espedizioak badaki non elkartu',
    },
    'kind-magic-school': {
      record: 'Magia atseginaren koadernoa',
      success: 'Magia-gela berriro distiratsu dago',
    },
    'space-trip': { record: 'Misioaren erregistroa', success: 'Tripulazioak badu ibilbidea' },
    'fun-farm': { record: 'Baserriko egutegia', success: 'Baserriko eguna prest dago' },
    'sea-garden': { record: 'Itsas dantzaren gidoia', success: 'Burbuilen dantza has daiteke' },
    'dino-park': { record: 'Landa-koadernoa', success: 'Dinosauroen txangoa prest dago' },
    'friendly-monster-town': { record: 'Plazaren planoa', success: 'Herriko plaza prest dago' },
    'color-fair': { record: 'Azokaren egitaraua', success: 'Koloreen azoka ireki daiteke' },
    'mountain-trip': { record: 'Ibilbide-koadernoa', success: 'Txangoak badu elkargunea' },
  },
  gl: {
    'forest-party': { record: 'O plan da festa', success: 'A festa do bosque xa pode comezar' },
    'treasure-island': {
      record: 'O diario da illa',
      success: 'A expedición xa sabe onde reunirse',
    },
    'kind-magic-school': {
      record: 'O caderno de maxia amable',
      success: 'A clase máxica volve brillar',
    },
    'space-trip': { record: 'O rexistro da misión', success: 'A tripulación xa ten a ruta' },
    'fun-farm': {
      record: 'O calendario da granxa',
      success: 'A xornada na granxa está preparada',
    },
    'sea-garden': {
      record: 'O guión da danza mariña',
      success: 'A danza de burbullas xa pode comezar',
    },
    'dino-park': {
      record: 'O caderno de campo',
      success: 'A excursión dos dinosauros está preparada',
    },
    'friendly-monster-town': {
      record: 'O plano da praza',
      success: 'A praza xa está preparada',
    },
    'color-fair': { record: 'O programa da feira', success: 'A feira das cores xa pode abrir' },
    'mountain-trip': {
      record: 'O caderno de ruta',
      success: 'A excursión xa ten punto de encontro',
    },
  },
  fr: {
    'forest-party': {
      record: 'Le plan de la fête',
      success: 'La fête de la forêt peut commencer',
    },
    'treasure-island': {
      record: 'Le journal de l’île',
      success: 'L’expédition sait où se retrouver',
    },
    'kind-magic-school': {
      record: 'Le carnet de magie bienveillante',
      success: 'La classe de magie brille à nouveau',
    },
    'space-trip': { record: 'Le journal de mission', success: 'L’équipage connaît sa route' },
    'fun-farm': {
      record: 'Le calendrier de la ferme',
      success: 'La journée à la ferme est prête',
    },
    'sea-garden': {
      record: 'Le scénario de la danse marine',
      success: 'La danse des bulles peut commencer',
    },
    'dino-park': {
      record: 'Le carnet de terrain',
      success: 'L’excursion des dinosaures est prête',
    },
    'friendly-monster-town': {
      record: 'Le plan de la place',
      success: 'La place du village est prête',
    },
    'color-fair': {
      record: 'Le programme de la foire',
      success: 'La foire aux couleurs peut ouvrir',
    },
    'mountain-trip': {
      record: 'Le carnet de route',
      success: 'L’excursion a son point de rencontre',
    },
  },
  de: {
    'forest-party': { record: 'Der Festplan', success: 'Das Waldfest kann beginnen' },
    'treasure-island': {
      record: 'Das Inseltagebuch',
      success: 'Die Expedition kennt ihren Treffpunkt',
    },
    'kind-magic-school': {
      record: 'Das Heft der freundlichen Magie',
      success: 'Der Zauberunterricht glänzt wieder',
    },
    'space-trip': { record: 'Das Missionslogbuch', success: 'Die Crew kennt ihre Route' },
    'fun-farm': {
      record: 'Der Hofkalender',
      success: 'Der Tag auf dem Bauernhof ist vorbereitet',
    },
    'sea-garden': {
      record: 'Das Drehbuch des Meerestanzes',
      success: 'Der Blasentanz kann beginnen',
    },
    'dino-park': { record: 'Das Feldheft', success: 'Der Dinosaurierausflug ist vorbereitet' },
    'friendly-monster-town': {
      record: 'Der Platzplan',
      success: 'Der Dorfplatz ist vorbereitet',
    },
    'color-fair': { record: 'Das Festprogramm', success: 'Das Farbenfest kann öffnen' },
    'mountain-trip': { record: 'Das Routenheft', success: 'Der Ausflug hat einen Treffpunkt' },
  },
}

type IllustratedThreadArcCopy = Readonly<Record<IllustratedThreadArc, string>>

const illustratedThreadArcCopy: Readonly<Record<Locale, IllustratedThreadArcCopy>> = {
  ca: {
    remember: '{name} recorda una escena de «{subject}».',
    notice: '{name} ha trobat un senyal de «{subject}».',
    help: '{name} ajuda a fer encaixar les pistes.',
    question: '{name} es fa una pregunta: què va passar?',
    connect: '{name} uneix dues pistes separades.',
    prepare: '{name} prepara el detall següent de «{subject}».',
  },
  es: {
    remember: '{name} recuerda una escena de «{subject}».',
    notice: '{name} ha encontrado una señal de «{subject}».',
    help: '{name} ayuda a encajar las pistas.',
    question: '{name} se hace una pregunta: ¿qué pasó?',
    connect: '{name} une dos pistas separadas.',
    prepare: '{name} prepara el siguiente detalle de «{subject}».',
  },
  en: {
    remember: '{name} remembers a scene from “{subject}.”',
    notice: '{name} found a sign from “{subject}.”',
    help: '{name} helps the clues fit.',
    question: '{name} asks: what happened?',
    connect: '{name} joins two clues.',
    prepare: '{name} prepares the next detail of “{subject}”.',
  },
  eu: {
    remember: '{name}k «{subject}» gaiaren eszena bat gogoratzen du.',
    notice: '{name}k «{subject}» gaiaren seinale bat aurkitu du.',
    help: '{name}k pistak bat egiten laguntzen du.',
    question: '{name}k galdera bat du: zer gertatu da?',
    connect: '{name}k bi pista lotzen ditu.',
    prepare: '{name}k «{subject}» gaiaren hurrengo xehetasuna prestatzen du.',
  },
  gl: {
    remember: '{name} lembra unha escena de «{subject}».',
    notice: '{name} atopou un sinal de «{subject}».',
    help: '{name} axuda a encaixar as pistas.',
    question: '{name} faise unha pregunta: que pasou?',
    connect: '{name} une dúas pistas separadas.',
    prepare: '{name} prepara o seguinte detalle de «{subject}».',
  },
  fr: {
    remember: '{name} se souvient d’une scène de « {subject} ».',
    notice: '{name} a trouvé un signe de « {subject} ».',
    help: '{name} aide à faire tenir les indices.',
    question: '{name} se demande : que s’est-il passé ?',
    connect: '{name} relie deux indices séparés.',
    prepare: '{name} prépare le prochain détail de « {subject} ».',
  },
  de: {
    remember: '{name} erinnert sich an eine Szene aus „{subject}“.',
    notice: '{name} hat ein Zeichen für „{subject}“ entdeckt.',
    help: '{name} hilft, die Hinweise zu verbinden.',
    question: '{name} fragt sich: Was ist passiert?',
    connect: '{name} verbindet zwei getrennte Hinweise.',
    prepare: '{name} bereitet das nächste Detail für „{subject}“ vor.',
  },
}

const illustratedProgressCopy: Readonly<
  Record<Locale, Readonly<Record<IllustratedProgressStage, IllustratedProgressCopy>>>
> = {
  ca: {
    opening: {
      label: 'S’obre el misteri',
      text: 'Escolta el primer record sobre «{subject}».',
    },
    gathering: {
      label: 'Les pistes apareixen',
      text: 'Ja tens algunes pistes. Busca què es repeteix.',
    },
    connecting: {
      label: 'La història pren forma',
      text: 'Ara busca quines pistes es connecten.',
    },
    proposal: {
      label: 'Proposta preparada',
      text: 'Tothom té un lloc. Comprova si la història encaixa.',
    },
  },
  es: {
    opening: {
      label: 'Empieza el misterio',
      text: 'Escucha el primer recuerdo sobre «{subject}».',
    },
    gathering: {
      label: 'Aparecen las pistas',
      text: 'Las hipótesis llenan el mapa. Mira qué se repite.',
    },
    connecting: {
      label: 'La historia toma forma',
      text: 'Ahora busca qué pistas se conectan.',
    },
    proposal: {
      label: 'Propuesta preparada',
      text: 'Todos tienen un lugar. Comprueba si la historia encaja.',
    },
  },
  en: {
    opening: {
      label: 'The mystery begins',
      text: 'Listen for the first memory about “{subject}.”',
    },
    gathering: {
      label: 'Clues appear',
      text: 'Ideas fill the map. Look for what repeats.',
    },
    connecting: {
      label: 'The story takes shape',
      text: 'Now find which clues connect.',
    },
    proposal: {
      label: 'Proposal ready',
      text: 'Everyone has a place. Check whether the story fits.',
    },
  },
  eu: {
    opening: {
      label: 'Misterioa hasi da',
      text: 'Entzun «{subject}» gaiari buruzko lehen oroitzapena.',
    },
    gathering: {
      label: 'Pistak agertzen ari dira',
      text: 'Hipotesiek mapa betetzen dute. Bilatu errepikatzen dena.',
    },
    connecting: {
      label: 'Istorioa forma hartzen ari da',
      text: 'Bilatu orain lotzen diren pistak.',
    },
    proposal: {
      label: 'Proposamena prest dago',
      text: 'Denek dute leku bat. Egiaztatu istorioa bat datorren.',
    },
  },
  gl: {
    opening: {
      label: 'Comeza o misterio',
      text: 'Escoita a primeira lembranza sobre «{subject}».',
    },
    gathering: {
      label: 'Aparecen as pistas',
      text: 'As hipóteses enchen o mapa. Mira que se repite.',
    },
    connecting: {
      label: 'A historia toma forma',
      text: 'Agora busca que pistas se conectan.',
    },
    proposal: {
      label: 'Proposta preparada',
      text: 'Todos teñen un lugar. Comproba se a historia encaixa.',
    },
  },
  fr: {
    opening: {
      label: 'Le mystère commence',
      text: 'Écoute le premier souvenir de « {subject} ».',
    },
    gathering: {
      label: 'Les indices apparaissent',
      text: 'Les hypothèses remplissent la carte. Cherche ce qui se répète.',
    },
    connecting: {
      label: 'L’histoire prend forme',
      text: 'Cherche maintenant les indices qui se relient.',
    },
    proposal: {
      label: 'Proposition prête',
      text: 'Chacun a une place. Vérifie si l’histoire concorde.',
    },
  },
  de: {
    opening: {
      label: 'Das Rätsel beginnt',
      text: 'Höre die erste Erinnerung an „{subject}“.',
    },
    gathering: {
      label: 'Hinweise erscheinen',
      text: 'Vermutungen füllen die Karte. Suche nach Wiederholungen.',
    },
    connecting: {
      label: 'Die Geschichte nimmt Form an',
      text: 'Suche jetzt nach verbundenen Hinweisen.',
    },
    proposal: {
      label: 'Vorschlag bereit',
      text: 'Alle haben einen Platz. Prüfe, ob die Geschichte passt.',
    },
  },
}

const themePremiseSubjects: Readonly<
  Record<
    Locale,
    Readonly<
      Record<
        IllustratedThemeId,
        Readonly<Record<Exclude<IllustratedPremiseId, 'event'>, string>>
      >
    >
  >
> = {
  ca: {
    'forest-party': { trail: 'El rastre de les garlandes', surprise: 'El pícnic sorpresa' },
    'treasure-island': { trail: 'Els senyals del far', surprise: 'Els regals de l’illa' },
    'kind-magic-school': { trail: 'El rastre d’estrelles', surprise: 'La floració secreta' },
    'space-trip': { trail: 'La ruta de les estrelles', surprise: 'La benvinguda al cometa' },
    'fun-farm': { trail: 'El repartiment de llavors', surprise: 'L’esmorzar sorpresa' },
    'sea-garden': { trail: 'El rastre de perles', surprise: 'El jardí de corall secret' },
    'dino-park': { trail: 'El rastre de petjades', surprise: 'El pícnic del parc' },
    'friendly-monster-town': { trail: 'El camí dels fanalets', surprise: 'El mural sorpresa' },
    'color-fair': { trail: 'El rastre d’entrades', surprise: 'La parada sorpresa' },
    'mountain-trip': { trail: 'Els senyals del sender', surprise: 'El pícnic del mirador' },
  },
  es: {
    'forest-party': { trail: 'El rastro de las guirnaldas', surprise: 'El pícnic sorpresa' },
    'treasure-island': { trail: 'Las señales del faro', surprise: 'Los regalos de la isla' },
    'kind-magic-school': { trail: 'El rastro de estrellas', surprise: 'La floración secreta' },
    'space-trip': { trail: 'La ruta de las estrellas', surprise: 'La bienvenida al cometa' },
    'fun-farm': { trail: 'El reparto de semillas', surprise: 'El desayuno sorpresa' },
    'sea-garden': { trail: 'El rastro de perlas', surprise: 'El jardín de coral secreto' },
    'dino-park': { trail: 'El rastro de huellas', surprise: 'El pícnic del parque' },
    'friendly-monster-town': {
      trail: 'El camino de los farolillos',
      surprise: 'El mural sorpresa',
    },
    'color-fair': { trail: 'El rastro de entradas', surprise: 'El puesto sorpresa' },
    'mountain-trip': { trail: 'Las señales del sendero', surprise: 'El pícnic del mirador' },
  },
  en: {
    'forest-party': { trail: 'The garland trail', surprise: 'The surprise picnic' },
    'treasure-island': { trail: 'The lighthouse signs', surprise: 'The island gifts' },
    'kind-magic-school': { trail: 'The star trail', surprise: 'The secret bloom' },
    'space-trip': { trail: 'The star route', surprise: 'The comet welcome' },
    'fun-farm': { trail: 'The seed delivery', surprise: 'The surprise breakfast' },
    'sea-garden': { trail: 'The pearl trail', surprise: 'The secret coral garden' },
    'dino-park': { trail: 'The footprint trail', surprise: 'The park picnic' },
    'friendly-monster-town': { trail: 'The lantern path', surprise: 'The surprise mural' },
    'color-fair': { trail: 'The ticket trail', surprise: 'The surprise stall' },
    'mountain-trip': { trail: 'The path signs', surprise: 'The viewpoint picnic' },
  },
  eu: {
    'forest-party': { trail: 'Girlanden arrastoa', surprise: 'Ustekabeko piknika' },
    'treasure-island': { trail: 'Itsasargiaren seinaleak', surprise: 'Uharteko opariak' },
    'kind-magic-school': { trail: 'Izarren arrastoa', surprise: 'Loraketa sekretua' },
    'space-trip': { trail: 'Izarren ibilbidea', surprise: 'Kometaren ongietorria' },
    'fun-farm': { trail: 'Hazien banaketa', surprise: 'Ustekabeko gosaria' },
    'sea-garden': { trail: 'Perlen arrastoa', surprise: 'Koralezko lorategi sekretua' },
    'dino-park': { trail: 'Oin-arrastoen bidea', surprise: 'Parkeko piknika' },
    'friendly-monster-town': {
      trail: 'Farolatxoen bidea',
      surprise: 'Ustekabeko horma-irudia',
    },
    'color-fair': { trail: 'Sarreren arrastoa', surprise: 'Ustekabeko postua' },
    'mountain-trip': { trail: 'Bidexkaren seinaleak', surprise: 'Begiratokiko piknika' },
  },
  gl: {
    'forest-party': { trail: 'O rastro das grilandas', surprise: 'O pícnic sorpresa' },
    'treasure-island': { trail: 'Os sinais do faro', surprise: 'Os agasallos da illa' },
    'kind-magic-school': { trail: 'O rastro de estrelas', surprise: 'A floración secreta' },
    'space-trip': { trail: 'A ruta das estrelas', surprise: 'A benvida ao cometa' },
    'fun-farm': { trail: 'O reparto de sementes', surprise: 'O almorzo sorpresa' },
    'sea-garden': { trail: 'O rastro de perlas', surprise: 'O xardín de coral secreto' },
    'dino-park': { trail: 'O rastro de pegadas', surprise: 'O pícnic do parque' },
    'friendly-monster-town': { trail: 'O camiño dos faroliños', surprise: 'O mural sorpresa' },
    'color-fair': { trail: 'O rastro de entradas', surprise: 'O posto sorpresa' },
    'mountain-trip': { trail: 'Os sinais do carreiro', surprise: 'O pícnic do miradoiro' },
  },
  fr: {
    'forest-party': { trail: 'La piste des guirlandes', surprise: 'Le pique-nique surprise' },
    'treasure-island': { trail: 'Les signes du phare', surprise: 'Les cadeaux de l’île' },
    'kind-magic-school': { trail: 'La piste des étoiles', surprise: 'La floraison secrète' },
    'space-trip': { trail: 'La route des étoiles', surprise: 'L’accueil de la comète' },
    'fun-farm': {
      trail: 'La distribution des graines',
      surprise: 'Le petit-déjeuner surprise',
    },
    'sea-garden': { trail: 'La piste des perles', surprise: 'Le jardin de corail secret' },
    'dino-park': { trail: 'La piste des empreintes', surprise: 'Le pique-nique du parc' },
    'friendly-monster-town': {
      trail: 'Le chemin des lanternes',
      surprise: 'La fresque surprise',
    },
    'color-fair': { trail: 'La piste des billets', surprise: 'Le stand surprise' },
    'mountain-trip': {
      trail: 'Les signes du sentier',
      surprise: 'Le pique-nique du belvédère',
    },
  },
  de: {
    'forest-party': { trail: 'Die Girlandenspur', surprise: 'Das Überraschungspicknick' },
    'treasure-island': { trail: 'Die Leuchtturmzeichen', surprise: 'Die Inselgeschenke' },
    'kind-magic-school': { trail: 'Die Sternenspur', surprise: 'Die geheime Blüte' },
    'space-trip': { trail: 'Die Sternenroute', surprise: 'Der Kometenempfang' },
    'fun-farm': { trail: 'Die Saatgutverteilung', surprise: 'Das Überraschungsfrühstück' },
    'sea-garden': { trail: 'Die Perlenspur', surprise: 'Der geheime Korallengarten' },
    'dino-park': { trail: 'Die Fußspur', surprise: 'Das Picknick im Park' },
    'friendly-monster-town': { trail: 'Der Laternenweg', surprise: 'Das Überraschungsbild' },
    'color-fair': { trail: 'Die Eintrittskartenspur', surprise: 'Der Überraschungsstand' },
    'mountain-trip': { trail: 'Die Wegzeichen', surprise: 'Das Picknick am Aussichtspunkt' },
  },
}

const premiseSuccesses: Readonly<
  Record<Locale, Readonly<Record<Exclude<IllustratedPremiseId, 'event'>, string>>>
> = {
  ca: { trail: 'El rastre ja és complet', surprise: 'La sorpresa està preparada' },
  es: { trail: 'El rastro ya está completo', surprise: 'La sorpresa está preparada' },
  en: { trail: 'The trail is complete', surprise: 'The surprise is ready' },
  eu: { trail: 'Arrastoa osatuta dago', surprise: 'Ustekabea prest dago' },
  gl: { trail: 'O rastro está completo', surprise: 'A sorpresa está preparada' },
  fr: { trail: 'La piste est complète', surprise: 'La surprise est prête' },
  de: { trail: 'Die Spur ist vollständig', surprise: 'Die Überraschung ist bereit' },
}

const themePremise = (
  locale: Locale,
  themeId: IllustratedThemeId,
  premiseId: IllustratedPremiseId,
): ThemeStoryPremise => {
  const event = themeMotifs[locale][themeId]
  if (premiseId === 'event') return { subject: event.record, success: event.success }
  return {
    subject: themePremiseSubjects[locale][themeId][premiseId],
    success: premiseSuccesses[locale][premiseId],
  }
}

export const buildIllustratedStoryCopy = (
  locale: Locale,
  themeId: IllustratedThemeId,
  storySeed: string,
  title: string,
  protagonist?: string,
): IllustratedStoryCopy => {
  const kit = storyKits[locale]
  const storySource = `${storySeed}:${themeId}`
  const premiseId = selectStable(`${storySource}:premise`, themePremiseIds)
  const premise = themePremise(locale, themeId, premiseId)
  const mystery = selectStable(`${storySource}:mystery`, kit.mysteries)
  const objectiveId = selectStable(
    `${storySource}:objective`,
    storyObjectivesForMystery[mystery.kind],
  )
  const victoryId = selectStable(
    `${storySource}:resolution`,
    storyVictoriesForObjective[objectiveId],
  )
  const objective = kit.objectives[objectiveId]
  const victory = kit.victories[victoryId]
  const values = {
    title,
    hero: protagonist ?? kit.groupName,
    subject: premise.subject,
    success: premise.success,
  }
  return {
    title,
    subject: premise.subject,
    introduction: renderTemplate(mystery.introduction, values),
    objective: renderTemplate(objective, values),
    victory: renderTemplate(victory, values),
    mysteryKind: mystery.kind,
    premiseId,
    storySignature: `${themeId}:${premiseId}:${mystery.kind}:${objectiveId}:${victoryId}`,
  }
}

export const illustratedCharacterStoryChapter = (
  locale: Locale,
  themeId: IllustratedThemeId,
  storySeed: string,
  characterKey: string,
  name: string,
  subject: string,
) => {
  const arcId = selectStable(
    `${storySeed}:${themeId}:${characterKey}:thread-arc`,
    illustratedThreadArcIds,
  )
  return {
    arcId,
    text: renderTemplate(illustratedThreadArcCopy[locale][arcId], { name, subject }),
  }
}

export const illustratedStoryProgressCopy = (
  locale: Locale,
  subject: string,
  stage: IllustratedProgressStage,
): IllustratedProgressCopy => {
  const copy = illustratedProgressCopy[locale][stage]
  return {
    label: renderTemplate(copy.label, { subject }),
    text: renderTemplate(copy.text, { subject }),
  }
}

export const illustratedCharacterStoryPrompt = (
  locale: Locale,
  themeId: IllustratedThemeId,
  name: string,
  storySeed: string,
  role: IllustratedThreadRole,
) => {
  const prompts = storyKits[locale].prompts[role]
  const random = new SeededRandom(`${storySeed}:${themeId}:${name}:${role}:thread`)
  return renderTemplate(random.pick(prompts), { name })
}

export const illustratedStoryBeatLead = (
  locale: Locale,
  themeId: IllustratedThemeId,
  storySeed: string,
  beat: IllustratedStoryBeat,
  fragmentIndex: number,
) => {
  const leads = storyKits[locale].beats[beat]
  const random = new SeededRandom(`${storySeed}:${themeId}:${beat}:${fragmentIndex}:fragment`)
  return random.pick(leads)
}
