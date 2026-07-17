import type {
  CharacterId,
  Clue,
  ItemId,
  Locale,
  PlaceId,
  Position,
  PositionId,
  Puzzle,
} from './types'
import { localizeThemeLabel } from './themeVocabulary'
import { buildingUnitLabel } from './buildingPlan'
import { activeLocales } from './locales'

// cspell:disable -- eu/gl/fr/de are reviewed through rendered-clue tests and independent agents.

type Templates = Record<Clue['type'], readonly string[]>

const mapTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': [
      '{a} ha arribat a l’espai «{p}» amb un gran somriure.',
      'A l’espai «{p}», {a} participa amb molta il·lusió.',
    ],
    'character-not-at-position': [
      '{a} vol explorar un altre racó; no és a l’espai «{p}».',
      '{a} continua l’aventura en un altre lloc, lluny de l’espai «{p}».',
    ],
    'character-in-place': [
      '{a} ajuda el grup a l’espai «{p}».',
      'A l’espai «{p}», {a} està a punt per a l’aventura.',
    ],
    'character-not-in-place': [
      '{a} continua l’aventura en un altre lloc, lluny de l’espai «{p}».',
      '{a} ajuda el grup fora de l’espai «{p}».',
    ],
    'in-corner': ['{a} ha triat una cantonada tranquil·la per participar.'],
    'not-in-corner': ['{a} participa lluny de les cantonades.'],
    'character-next-to-obstacle': ['A l’espai «{p}», {a} participa al costat de «{o}».'],
    adjacent: [
      '{a} i {b} han triat llocs veïns per compartir l’aventura.',
      '{a} té {b} ben a prop, en un lloc veí.',
    ],
    'not-adjacent': [
      '{a} i {b} exploren llocs que no són veïns.',
      '{a} i {b} participen des de llocs separats.',
    ],
    'same-row': [
      '{a} i {b} avancen per la mateixa fila del mapa.',
      '{a} comparteix la fila de l’aventura amb {b}.',
    ],
    'different-row': [
      '{a} i {b} ajuden el grup des de files diferents.',
      '{a} i {b} recorren files diferents del mapa.',
    ],
    'same-column': [
      '{a} i {b} segueixen la mateixa columna del mapa.',
      '{a} comparteix columna amb {b} durant l’aventura.',
    ],
    'different-column': [
      '{a} i {b} exploren columnes diferents del mapa.',
      '{a} i {b} ajuden des de columnes diferents.',
    ],
    'left-of': [
      '{a} ha trobat una pista al lloc de l’esquerra de {b}.',
      '{a} saluda {b} des del lloc que queda a l’esquerra.',
    ],
    'right-of': [
      '{a} ha trobat una pista al lloc de la dreta de {b}.',
      '{a} saluda {b} des del lloc que queda a la dreta.',
    ],
    above: [
      '{a} ha trobat una pista al lloc de sobre de {b}.',
      '{a} saluda {b} des del lloc just a sobre seu.',
    ],
    below: [
      '{a} ha trobat una pista al lloc de sota de {b}.',
      '{a} saluda {b} des del lloc just a sota seu.',
    ],
    distance: [
      '{a} camina {n} passos pel mapa per trobar {b}.',
      '{a} recorre {n} passos del mapa per trobar {b}.',
    ],
    between: [
      '{a} ha trobat el punt de trobada entre {b} i {c}.',
      '{a} espera al lloc que queda entre {b} i {c}.',
    ],
    'has-item': ['{a} ha triat {i} per a l’aventura.', '{a} porta {i} per compartir.'],
    'does-not-have-item': [
      '{a} porta una altra cosa, no {i}.',
      '{i} acompanya una altra persona, no {a}.',
    ],
    'item-in-place': ['{i} espera a l’espai «{p}», a punt per començar.'],
    'item-not-in-place': ['{i} acompanya algú lluny de l’espai «{p}».'],
    'same-floor': ['{a} i {b} col·laboren a la mateixa zona.'],
    'different-floor': ['{a} i {b} ajuden el grup des de zones diferents.'],
  },
  es: {
    'character-at-position': [
      '{a} ha llegado a {p} con una gran sonrisa.',
      'En {p}, {a} participa con mucha ilusión.',
    ],
    'character-not-at-position': [
      '{a} quiere explorar otro rincón; no está en {p}.',
      '{a} continúa la aventura en otro lugar, no en {p}.',
    ],
    'character-in-place': [
      '{a} ayuda al grupo en {p}.',
      'En {p}, {a} está listo para la aventura.',
    ],
    'character-not-in-place': [
      '{a} sigue la aventura en otro lugar, no en {p}.',
      '{a} ayuda al grupo fuera de {p}.',
    ],
    'in-corner': ['{a} ha elegido un rincón tranquilo para participar.'],
    'not-in-corner': ['{a} participa lejos de los rincones.'],
    'character-next-to-obstacle': ['En {p}, {a} participa junto a {o}.'],
    adjacent: [
      '{a} y {b} han elegido lugares vecinos para compartir la aventura.',
      '{a} tiene a {b} muy cerca, en un lugar vecino.',
    ],
    'not-adjacent': [
      '{a} y {b} exploran lugares que no son vecinos.',
      '{a} y {b} participan desde lugares separados.',
    ],
    'same-row': [
      '{a} y {b} avanzan por la misma fila del mapa.',
      '{a} comparte la fila de la aventura con {b}.',
    ],
    'different-row': [
      '{a} y {b} ayudan al grupo desde filas distintas.',
      '{a} y {b} recorren filas distintas del mapa.',
    ],
    'same-column': [
      '{a} y {b} siguen la misma columna del mapa.',
      '{a} comparte columna con {b} durante la aventura.',
    ],
    'different-column': [
      '{a} y {b} exploran columnas distintas del mapa.',
      '{a} y {b} ayudan desde columnas distintas.',
    ],
    'left-of': [
      '{a} ha encontrado una pista en el lugar a la izquierda de {b}.',
      '{a} saluda a {b} desde el lugar que queda a la izquierda.',
    ],
    'right-of': [
      '{a} ha encontrado una pista en el lugar a la derecha de {b}.',
      '{a} saluda a {b} desde el lugar que queda a la derecha.',
    ],
    above: [
      '{a} ha encontrado una pista en el lugar encima de {b}.',
      '{a} saluda a {b} desde el lugar que queda arriba.',
    ],
    below: [
      '{a} ha encontrado una pista en el lugar debajo de {b}.',
      '{a} saluda a {b} desde el lugar que queda abajo.',
    ],
    distance: [
      '{a} camina {n} pasos por el mapa para encontrar a {b}.',
      '{a} recorre {n} pasos del mapa para encontrar a {b}.',
    ],
    between: [
      '{a} ha encontrado el punto de encuentro entre {b} y {c}.',
      '{a} espera en el lugar que queda entre {b} y {c}.',
    ],
    'has-item': ['{a} ha elegido {i} para la aventura.', '{a} lleva {i} para compartir.'],
    'does-not-have-item': [
      '{a} lleva otra cosa, no {i}.',
      '{i} acompaña a otro amigo, no a {a}.',
    ],
    'item-in-place': ['{i} espera en {p}, a punto de empezar.'],
    'item-not-in-place': ['{i} acompaña a alguien en otro lugar, no en {p}.'],
    'same-floor': ['{a} y {b} colaboran en la misma zona.'],
    'different-floor': ['{a} y {b} ayudan al grupo desde zonas distintas.'],
  },
  en: {
    'character-at-position': [
      '{a} arrived at {p} with a big smile.',
      'At {p}, {a} joins in with great excitement.',
    ],
    'character-not-at-position': [
      '{a} wants to explore another spot, not {p}.',
      '{a} continues the adventure somewhere else, not at {p}.',
    ],
    'character-in-place': [
      '{a} helps the group at {p}.',
      'At {p}, {a} is ready for the adventure.',
    ],
    'character-not-in-place': [
      '{a} continues the adventure somewhere else, not {p}.',
      '{a} helps the group away from {p}.',
    ],
    'in-corner': ['{a} chose a quiet corner to join in.'],
    'not-in-corner': ['{a} joins in away from the corners.'],
    'character-next-to-obstacle': ['At {p}, {a} joins in next to {o}.'],
    adjacent: [
      '{a} and {b} chose neighboring places to share the adventure.',
      '{a} has {b} nearby, in a neighboring place.',
    ],
    'not-adjacent': [
      '{a} and {b} explore places that are not neighbors.',
      '{a} and {b} join in from separate places.',
    ],
    'same-row': [
      '{a} and {b} travel along the same row of the map.',
      '{a} shares an adventure row with {b}.',
    ],
    'different-row': [
      '{a} and {b} help the group from different rows.',
      '{a} and {b} explore different rows of the map.',
    ],
    'same-column': [
      '{a} and {b} follow the same column of the map.',
      '{a} shares a column with {b} during the adventure.',
    ],
    'different-column': [
      '{a} and {b} explore different columns of the map.',
      '{a} and {b} help from different columns.',
    ],
    'left-of': [
      '{a} found a clue in the place to the left of {b}.',
      '{a} waves to {b} from the place on the left.',
    ],
    'right-of': [
      '{a} found a clue in the place to the right of {b}.',
      '{a} waves to {b} from the place on the right.',
    ],
    above: [
      '{a} found a clue in the place above {b}.',
      '{a} waves to {b} from the place above.',
    ],
    below: [
      '{a} found a clue in the place below {b}.',
      '{a} waves to {b} from the place below.',
    ],
    distance: [
      '{a} walks {n} map steps to find {b}.',
      '{a} travels {n} map steps to find {b}.',
    ],
    between: [
      '{a} found the meeting point between {b} and {c}.',
      '{a} waits in the place between {b} and {c}.',
    ],
    'has-item': ['{a} chose {i} for the adventure.', '{a} brings {i} to share.'],
    'does-not-have-item': [
      '{a} brings something else, not {i}.',
      '{i} joins another friend, not {a}.',
    ],
    'item-in-place': ['{i} waits at {p}, ready to begin.'],
    'item-not-in-place': ['{i} joins someone somewhere else, not {p}.'],
    'same-floor': ['{a} and {b} work together in the same zone.'],
    'different-floor': ['{a} and {b} help the group from different zones.'],
  },
  eu: {
    'character-at-position': [
      'Hona hemen {a} «{p}» gunean, irribarre handi batekin.',
      '«{p}» gunean, {a} prest dago abenturarako.',
    ],
    'character-not-at-position': [
      '{a} beste txoko bat esploratzen ari da, ez «{p}» gunea.',
      '{a} beste leku batean dago; ez «{p}» gunean.',
    ],
    'character-in-place': [
      '{a} taldeari laguntzen ari da «{p}» gunean.',
      '«{p}» gunean, {a} prest dago abenturarako.',
    ],
    'character-not-in-place': [
      '{a} beste leku batean ari da abenturan, ez «{p}» gunean.',
      '{a} «{p}» gunetik kanpo dago, laguntzeko gogoz.',
    ],
    'in-corner': ['{a} txoko lasai batean dago, parte hartzeko prest.'],
    'not-in-corner': ['{a} izkinetatik urrun dago, laguntzeko gogoz.'],
    'character-next-to-obstacle': [
      '«{p}» gunean, {a} «{o}» erreferentziaren ondoan dago, laguntzeko gogoz.',
    ],
    adjacent: [
      '{a} eta {b} elkarren ondoko lekuetan daude, abentura partekatzeko.',
      '{a} eta {b} gertu daude, auzoko bi lekuetan.',
    ],
    'not-adjacent': [
      '{a} eta {b} auzokoak ez diren lekuetan daude.',
      '{a} eta {b} leku bereizietatik ari dira taldearekin.',
    ],
    'same-row': [
      '{a} eta {b} mapako zerrenda berean daude, elkarrekin aurrera egiteko.',
      'Abenturako zerrenda bera partekatzen dute bi lagunek: {a} eta {b}.',
    ],
    'different-row': [
      '{a} eta {b} mapako zerrenda desberdinetan daude, taldeari laguntzen.',
      'Bi lagunak zerrenda desberdinetan ari dira: {a} eta {b}.',
    ],
    'same-column': [
      '{a} eta {b} mapako zutabe berean daude, elkarri laguntzeko.',
      'Abenturako zutabe bera partekatzen dute bi lagunek: {a} eta {b}.',
    ],
    'different-column': [
      '{a} eta {b} mapako zutabe desberdinetan daude.',
      'Bi lagunak zutabe desberdinetatik ari dira laguntzen: {a} eta {b}.',
    ],
    'left-of': [
      'Ezkerretik eskuinera, {a} dago lehenengo eta {b} gero; biak elkarlanean ari dira.',
      '{a} {b} baino ezkerrerago dago.',
    ],
    'right-of': [
      'Ezkerretik eskuinera, {b} dago lehenengo eta {a} gero; biak elkarlanean ari dira.',
      '{a} {b} baino eskuinerago dago.',
    ],
    above: [
      'Goitik behera, {a} dago lehenengo eta {b} gero; elkar agurtzeko prest daude.',
      '{a} {b} baino gorago dago.',
    ],
    below: [
      'Goitik behera, {b} dago lehenengo eta {a} gero; elkar agurtzeko prest daude.',
      '{a} {b} baino beherago dago.',
    ],
    distance: [
      '{a} eta {b} elkarrengandik {n} mapa-urratsera daude.',
      'Bi lagunen artean {n} urratseko tartea dago mapan: {a} eta {b}.',
    ],
    between: [
      'Hiru lagunen ordenan, {a} erdian dago; alboetan {b} eta {c} daude.',
      '{a} bi lagunen erdian dago: {b} eta {c}.',
    ],
    'has-item': [
      '{a} honako honekin dabil abenturan: {i}.',
      '{a} prest dago partekatzeko. Berekin duen objektua: {i}.',
    ],
    'does-not-have-item': [
      '{a} beste zerbaitekin dabil, ez {i}.',
      'Beste lagun baten objektua: {i}; ez {a} lagunarena.',
    ],
    'item-in-place': ['«{p}» gunean abenturarako prestatutako objektua: {i}.'],
    'item-not-in-place': ['«{p}» gunerako beste zerbait aukeratu dute, ez {i}.'],
    'same-floor': ['{a} eta {b} gune berean ari dira elkarlanean.'],
    'different-floor': ['{a} eta {b} gune desberdinetatik ari dira taldeari laguntzen.'],
  },
  gl: {
    'character-at-position': [
      '{a} chegou ao espazo «{p}» cun gran sorriso.',
      'No espazo «{p}», {a} participa con moita ilusión.',
    ],
    'character-not-at-position': [
      '{a} quere explorar outro recuncho; non está no espazo «{p}».',
      '{a} continúa a aventura noutro lugar, lonxe do espazo «{p}».',
    ],
    'character-in-place': [
      '{a} axuda o grupo no espazo «{p}».',
      'No espazo «{p}», {a} está a punto para a aventura.',
    ],
    'character-not-in-place': [
      '{a} continúa a aventura noutro lugar, lonxe do espazo «{p}».',
      '{a} axuda o grupo fóra do espazo «{p}».',
    ],
    'in-corner': ['{a} escolleu un recuncho tranquilo para participar.'],
    'not-in-corner': ['{a} participa lonxe dos recunchos.'],
    'character-next-to-obstacle': [
      'No espazo «{p}», {a} participa a carón da referencia «{o}».',
    ],
    adjacent: [
      '{a} e {b} escolleron lugares veciños para compartir a aventura.',
      '{a} ten a {b} moi preto, nun lugar veciño.',
    ],
    'not-adjacent': [
      '{a} e {b} exploran lugares que non son veciños.',
      '{a} e {b} participan desde lugares separados.',
    ],
    'same-row': [
      '{a} e {b} avanzan pola mesma fila do mapa.',
      '{a} comparte a fila da aventura con {b}.',
    ],
    'different-row': [
      '{a} e {b} axudan o grupo desde filas diferentes.',
      '{a} e {b} percorren filas diferentes do mapa.',
    ],
    'same-column': [
      '{a} e {b} seguen a mesma columna do mapa.',
      '{a} comparte columna con {b} durante a aventura.',
    ],
    'different-column': [
      '{a} e {b} exploran columnas diferentes do mapa.',
      '{a} e {b} axudan desde columnas diferentes.',
    ],
    'left-of': [
      '{a} atopou unha pista no lugar á esquerda de {b}.',
      '{a} saúda a {b} desde o lugar que queda á esquerda.',
    ],
    'right-of': [
      '{a} atopou unha pista no lugar á dereita de {b}.',
      '{a} saúda a {b} desde o lugar que queda á dereita.',
    ],
    above: [
      '{a} atopou unha pista no lugar por riba de {b}.',
      '{a} saúda a {b} desde o lugar que queda arriba.',
    ],
    below: [
      '{a} atopou unha pista no lugar por baixo de {b}.',
      '{a} saúda a {b} desde o lugar que queda abaixo.',
    ],
    distance: [
      '{a} camiña {n} pasos polo mapa para atopar a {b}.',
      '{a} percorre {n} pasos do mapa para atopar a {b}.',
    ],
    between: [
      '{a} atopou o punto de encontro entre {b} e {c}.',
      '{a} espera no lugar que queda entre {b} e {c}.',
    ],
    'has-item': ['{a} escolleu {i} para a aventura.', '{a} leva {i} para compartir.'],
    'does-not-have-item': [
      '{a} leva outra cousa, non {i}.',
      'Outra persoa, non {a}, leva este obxecto: {i}.',
    ],
    'item-in-place': ['No espazo «{p}» teñen este obxecto a punto: {i}.'],
    'item-not-in-place': ['No espazo «{p}» teñen outro obxecto, non {i}.'],
    'same-floor': ['{a} e {b} colaboran na mesma zona.'],
    'different-floor': ['{a} e {b} axudan o grupo desde zonas diferentes.'],
  },
  fr: {
    'character-at-position': [
      '{a} arrive dans l’espace « {p} » avec un grand sourire.',
      'Dans l’espace « {p} », {a} participe avec enthousiasme.',
    ],
    'character-not-at-position': [
      '{a} explore un autre lieu, ailleurs que dans l’espace « {p} ».',
      '{a} poursuit l’aventure ailleurs que dans l’espace « {p} ».',
    ],
    'character-in-place': [
      '{a} aide le groupe dans l’espace « {p} ».',
      'Dans l’espace « {p} », {a} est prêt pour l’aventure.',
    ],
    'character-not-in-place': [
      '{a} poursuit l’aventure ailleurs que dans l’espace « {p} ».',
      '{a} aide le groupe hors de l’espace « {p} ».',
    ],
    'in-corner': ['{a} choisit un coin tranquille pour participer.'],
    'not-in-corner': ['{a} participe loin des coins.'],
    'character-next-to-obstacle': [
      'Dans l’espace « {p} », {a} participe près du repère « {o} ».',
    ],
    adjacent: [
      '{a} et {b} choisissent des places voisines pour partager l’aventure.',
      '{a} reste tout près de {b}, à une place voisine.',
    ],
    'not-adjacent': [
      '{a} et {b} explorent des places qui ne sont pas voisines.',
      '{a} et {b} participent depuis des places séparées.',
    ],
    'same-row': [
      '{a} et {b} avancent sur la même ligne de la carte.',
      '{a} partage une ligne de l’aventure avec {b}.',
    ],
    'different-row': [
      '{a} et {b} aident le groupe depuis des lignes différentes.',
      '{a} et {b} parcourent des lignes différentes de la carte.',
    ],
    'same-column': [
      '{a} et {b} suivent la même colonne de la carte.',
      '{a} partage une colonne avec {b} pendant l’aventure.',
    ],
    'different-column': [
      '{a} et {b} explorent des colonnes différentes de la carte.',
      '{a} et {b} apportent leur aide depuis des colonnes différentes.',
    ],
    'left-of': [
      '{a} a trouvé un indice à la place située à gauche de {b}.',
      '{a} salue {b} depuis la place qui se trouve à gauche.',
    ],
    'right-of': [
      '{a} a trouvé un indice à la place située à droite de {b}.',
      '{a} salue {b} depuis la place qui se trouve à droite.',
    ],
    above: [
      '{a} a trouvé un indice à la place située au-dessus de {b}.',
      '{a} salue {b} depuis la place qui se trouve au-dessus.',
    ],
    below: [
      '{a} a trouvé un indice à la place située en dessous de {b}.',
      '{a} salue {b} depuis la place qui se trouve en dessous.',
    ],
    distance: [
      '{a} parcourt {n} pas sur la carte pour retrouver {b}.',
      '{a} avance de {n} pas sur la carte pour rejoindre {b}.',
    ],
    between: [
      '{a} a trouvé le point de rencontre entre {b} et {c}.',
      '{a} attend à la place située entre {b} et {c}.',
    ],
    'has-item': [
      '{a} choisit cet objet pour l’aventure : {i}.',
      '{a} apporte cet objet pour un moment de partage : {i}.',
    ],
    'does-not-have-item': [
      '{a} apporte autre chose, pas cet objet : {i}.',
      'Une autre personne que {a} apporte cet objet : {i}.',
    ],
    'item-in-place': ['Dans l’espace « {p} », cet objet est prêt pour le départ : {i}.'],
    'item-not-in-place': [
      'Une autre personne apporte cet objet ailleurs que dans l’espace « {p} » : {i}.',
    ],
    'same-floor': ['{a} et {b} coopèrent dans la même zone.'],
    'different-floor': ['{a} et {b} aident le groupe depuis des zones différentes.'],
  },
  de: {
    'character-at-position': [
      '{a} ist mit einem großen Lächeln am Ort „{p}“ angekommen.',
      'Am Ort „{p}“ macht {a} voller Freude mit.',
    ],
    'character-not-at-position': [
      '{a} erkundet eine andere Ecke und ist nicht am Ort „{p}“.',
      '{a} setzt das Abenteuer anderswo fort, nicht am Ort „{p}“.',
    ],
    'character-in-place': [
      '{a} hilft der Gruppe am Ort „{p}“.',
      'Am Ort „{p}“ ist {a} bereit für das Abenteuer.',
    ],
    'character-not-in-place': [
      '{a} setzt das Abenteuer anderswo fort, nicht am Ort „{p}“.',
      '{a} hilft der Gruppe außerhalb des Ortes „{p}“.',
    ],
    'in-corner': ['{a} wählt eine ruhige Ecke zum Mitmachen.'],
    'not-in-corner': ['{a} macht abseits der Ecken mit.'],
    'character-next-to-obstacle': [
      'Am Ort „{p}“ macht {a} neben dem Orientierungspunkt „{o}“ mit.',
    ],
    adjacent: [
      '{a} und {b} wählen benachbarte Plätze, um das Abenteuer zu teilen.',
      '{a} und {b} sind ganz nah beieinander, auf benachbarten Plätzen.',
    ],
    'not-adjacent': [
      '{a} und {b} erkunden Plätze, die nicht benachbart sind.',
      '{a} und {b} machen von getrennten Plätzen aus mit.',
    ],
    'same-row': [
      '{a} und {b} ziehen durch dieselbe Reihe der Karte.',
      '{a} und {b} teilen sich eine Abenteuerreihe.',
    ],
    'different-row': [
      '{a} und {b} helfen der Gruppe aus verschiedenen Reihen.',
      '{a} und {b} erkunden verschiedene Reihen der Karte.',
    ],
    'same-column': [
      '{a} und {b} folgen derselben Spalte der Karte.',
      '{a} und {b} teilen sich während des Abenteuers eine Spalte.',
    ],
    'different-column': [
      '{a} und {b} erkunden verschiedene Spalten der Karte.',
      '{a} und {b} helfen aus verschiedenen Spalten.',
    ],
    'left-of': [
      '{a} hat am Platz links von {b} einen Hinweis gefunden.',
      '{a} grüßt {b} vom Platz auf der linken Seite.',
    ],
    'right-of': [
      '{a} hat am Platz rechts von {b} einen Hinweis gefunden.',
      '{a} grüßt {b} vom Platz auf der rechten Seite.',
    ],
    above: [
      '{a} hat am Platz oberhalb von {b} einen Hinweis gefunden.',
      '{a} grüßt {b} vom Platz darüber.',
    ],
    below: [
      '{a} hat am Platz unterhalb von {b} einen Hinweis gefunden.',
      '{a} grüßt {b} vom Platz darunter.',
    ],
    distance: [
      '{a} geht {n} Schritte über die Karte, um {b} zu treffen.',
      '{a} legt {n} Kartenschritte zurück, um {b} zu erreichen.',
    ],
    between: [
      '{a} hat den Treffpunkt zwischen {b} und {c} gefunden.',
      '{a} wartet am Platz zwischen {b} und {c}.',
    ],
    'has-item': [
      '{a} wählt diesen Gegenstand für das Abenteuer: {i}.',
      '{a} bringt diesen Gegenstand zum Teilen mit: {i}.',
    ],
    'does-not-have-item': [
      '{a} bringt etwas anderes mit, nicht diesen Gegenstand: {i}.',
      'Eine andere Person als {a} bringt diesen Gegenstand mit: {i}.',
    ],
    'item-in-place': ['Am Ort „{p}“ ist dieser Gegenstand startklar: {i}.'],
    'item-not-in-place': ['Dieser Gegenstand ist anderswo, nicht am Ort „{p}“: {i}.'],
    'same-floor': ['{a} und {b} arbeiten in derselben Zone zusammen.'],
    'different-floor': ['{a} und {b} helfen der Gruppe aus verschiedenen Zonen.'],
  },
}

const gridTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': [
      'A {a} li agrada molt participar. A la zona «{p}», és a la casella {d} del marcador «{o}».',
      '{a} ha arribat amb moltes ganes a la zona «{p}». És a la casella {d} del marcador «{o}».',
      '{a} ajuda a preparar la zona «{p}». La seva casella és {d} del marcador «{o}».',
    ],
    'character-not-at-position': [
      '{a} prefereix donar un cop de mà en un altre espai: no és a la casella {d} del marcador «{o}» de la zona «{p}».',
    ],
    'character-in-place': [
      '{a} entra per la porta de l’espai «{p}» i saluda tothom.',
      '{a} se sent a gust a l’espai «{p}».',
    ],
    'character-not-in-place': [
      '{a} prefereix ajudar en un altre espai, fora de la zona «{p}».',
    ],
    'in-corner': ['{a} prepara una cantonada lluminosa de l’espai.'],
    'not-in-corner': ['{a} treballa lluny de les cantonades.'],
    'character-next-to-obstacle': [
      '{a} prepara amb il·lusió la zona «{p}», al costat de «{o}».',
      'A la zona «{p}», {a} dona un cop de mà al costat de «{o}».',
      '{a} té cura de la zona «{p}» des d’un espai al costat de «{o}».',
    ],
    adjacent: ['{a} i {b} preparen junts dos espais veïns.'],
    'not-adjacent': ['{a} i {b} col·laboren en espais que no són veïns.'],
    'same-row': ['{a} i {b} ajuden des de la mateixa franja del plànol.'],
    'different-row': ['{a} i {b} ajuden des de franges diferents del plànol.'],
    'same-column': ['{a} i {b} col·laboren dins la mateixa zona.'],
    'different-column': ['{a} i {b} col·laboren en zones diferents.'],
    'left-of': ['{a} ajuda en un espai a l’esquerra de {b}.'],
    'right-of': ['{a} ajuda en un espai a la dreta de {b}.'],
    above: ['{a} prepara un espai per damunt de {b}.'],
    below: ['{a} prepara un espai per sota de {b}.'],
    distance: ['{a} i {b} col·laboren des d’espais separats exactament per {n} caselles.'],
    between: ['{a} ajuda des d’un espai entre {b} i {c}.'],
    'has-item': ['{a} porta {i}.'],
    'does-not-have-item': ['{i} no acompanya {a}.'],
    'item-in-place': ['A la zona «{p}», {i} ja és a punt per a l’activitat.'],
    'item-not-in-place': ['A la zona «{p}» han triat una altra cosa, no {i}.'],
    'same-floor': ['{a} i {b} comparteixen la mateixa zona.'],
    'different-floor': ['{a} i {b} preparen zones diferents.'],
  },
  es: {
    'character-at-position': [
      'A {a} le hace ilusión participar. En la zona «{p}», está en la casilla {d} del marcador {o}.',
      '{a} ha llegado con muchas ganas a la zona «{p}». Está en la casilla {d} del marcador {o}.',
      '{a} ayuda a preparar la zona «{p}». Su casilla está {d} del marcador {o}.',
    ],
    'character-not-at-position': [
      '{a} prefiere colaborar en otro espacio: no está en la casilla {d} del marcador {o}, en «{p}».',
    ],
    'character-in-place': [
      '{a} entra por la puerta de «{p}» y saluda a todos.',
      '{a} se siente a gusto en «{p}».',
    ],
    'character-not-in-place': ['{a} prefiere ayudar en otro espacio, no en «{p}».'],
    'in-corner': ['{a} prepara un rincón luminoso del espacio.'],
    'not-in-corner': ['{a} trabaja lejos de los rincones.'],
    'character-next-to-obstacle': [
      '{a} prepara con ilusión la zona «{p}», junto a {o}.',
      'En «{p}», {a} echa una mano junto a {o}.',
      '{a} cuida de «{p}» desde un espacio junto a {o}.',
    ],
    adjacent: ['{a} y {b} preparan juntos dos espacios vecinos.'],
    'not-adjacent': ['{a} y {b} colaboran en espacios que no son vecinos.'],
    'same-row': ['{a} y {b} ayudan desde la misma franja del plano.'],
    'different-row': ['{a} y {b} ayudan desde franjas distintas del plano.'],
    'same-column': ['{a} y {b} colaboran dentro de la misma zona.'],
    'different-column': ['{a} y {b} colaboran en zonas distintas.'],
    'left-of': ['{a} ayuda en un espacio a la izquierda de {b}.'],
    'right-of': ['{a} ayuda en un espacio a la derecha de {b}.'],
    above: ['{a} prepara un espacio por encima de {b}.'],
    below: ['{a} prepara un espacio por debajo de {b}.'],
    distance: ['{a} y {b} colaboran desde espacios separados exactamente por {n} casillas.'],
    between: ['{a} ayuda desde un espacio entre {b} y {c}.'],
    'has-item': ['{a} lleva {i}.'],
    'does-not-have-item': ['{i} no acompaña a {a}.'],
    'item-in-place': ['En «{p}» tienen preparado {i} para la actividad.'],
    'item-not-in-place': ['En «{p}» han elegido otra cosa, no {i}.'],
    'same-floor': ['{a} y {b} comparten la misma zona.'],
    'different-floor': ['{a} y {b} preparan zonas distintas.'],
  },
  en: {
    'character-at-position': [
      '{a} is excited to join in. In the “{p}” zone, they are in the cell {d} the {o} marker.',
      '{a} has arrived ready to help in the “{p}” zone. Their cell is {d} the {o} marker.',
      '{a} is helping prepare the “{p}” zone. Their cell is {d} the {o} marker.',
    ],
    'character-not-at-position': [
      '{a} would rather help elsewhere and is not in the cell {d} the {o} marker in “{p}”.',
    ],
    'character-in-place': [
      '{a} comes through the door of “{p}” and greets everyone.',
      '{a} feels at home in “{p}”.',
    ],
    'character-not-in-place': ['{a} would rather help elsewhere, not in “{p}”.'],
    'in-corner': ['{a} prepares a bright corner of the space.'],
    'not-in-corner': ['{a} works away from the corners.'],
    'character-next-to-obstacle': [
      '{a} is excited to prepare “{p}” beside {o}.',
      'In “{p}”, {a} lends a hand beside {o}.',
      '{a} looks after “{p}” from a space beside {o}.',
    ],
    adjacent: ['{a} and {b} prepare two neighboring spaces together.'],
    'not-adjacent': ['{a} and {b} help in spaces that are not neighbors.'],
    'same-row': ['{a} and {b} help from the same strip of the plan.'],
    'different-row': ['{a} and {b} help from different strips of the plan.'],
    'same-column': ['{a} and {b} work together in the same zone.'],
    'different-column': ['{a} and {b} work together in different zones.'],
    'left-of': ['{a} helps in a space left of {b}.'],
    'right-of': ['{a} helps in a space right of {b}.'],
    above: ['{a} prepares a space above {b}.'],
    below: ['{a} prepares a space below {b}.'],
    distance: ['{a} and {b} help from spaces exactly {n} cells apart.'],
    between: ['{a} helps from a space between {b} and {c}.'],
    'has-item': ['{a} carries {i}.'],
    'does-not-have-item': ['{i} is not with {a}.'],
    'item-in-place': ['The activity in “{p}” has {i} ready.'],
    'item-not-in-place': ['The team in “{p}” chose something else, not {i}.'],
    'same-floor': ['{a} and {b} share the same zone.'],
    'different-floor': ['{a} and {b} prepare different zones.'],
  },
  eu: {
    'character-at-position': [
      '{a} pozik ari da parte hartzen. «{p}» gunean, «{o}» erreferentziarekiko {d} dagoen gelaxkan dago.',
      '{a} laguntzeko prest iritsi da «{p}» gunera. Bere gelaxka «{o}» erreferentziarekiko {d} dago.',
      '{a} «{p}» gunea prestatzen ari da. Bere gelaxka «{o}» erreferentziarekiko {d} dago.',
    ],
    'character-not-at-position': [
      '{a} beste espazio batean laguntzen ari da: ez dago «{p}» guneko «{o}» erreferentziarekiko {d} dagoen gelaxkan.',
    ],
    'character-in-place': [
      '{a} «{p}» guneko atetik sartu da eta denak agurtu ditu.',
      '{a} gustura dago «{p}» gunean.',
    ],
    'character-not-in-place': ['{a} beste espazio batean ari da laguntzen, ez «{p}» gunean.'],
    'in-corner': ['{a} espazioko txoko argitsu bat prestatzen ari da.'],
    'not-in-corner': ['{a} izkinetatik urrun ari da lanean.'],
    'character-next-to-obstacle': [
      '{a} gogotsu ari da «{p}» gunea prestatzen, «{o}» erreferentziaren ondoan.',
      '«{p}» gunean, {a} laguntzen ari da «{o}» erreferentziaren ondoan.',
      '{a} «{p}» gunea zaintzen ari da «{o}» erreferentziaren ondoko espaziotik.',
    ],
    adjacent: ['{a} eta {b} elkarren ondoko bi espazio prestatzen ari dira.'],
    'not-adjacent': ['{a} eta {b} auzokoak ez diren espazioetan ari dira elkarlanean.'],
    'same-row': ['{a} eta {b} planoaren zerrenda berean ari dira laguntzen.'],
    'different-row': ['{a} eta {b} planoaren zerrenda desberdinetan ari dira laguntzen.'],
    'same-column': ['{a} eta {b} gune berean ari dira elkarlanean.'],
    'different-column': ['{a} eta {b} gune desberdinetan ari dira elkarlanean.'],
    'left-of': ['{a} {b} baino ezkerrerago ari da laguntzen.'],
    'right-of': ['{a} {b} baino eskuinerago ari da laguntzen.'],
    above: ['{a} {b} baino goragoko espazio bat prestatzen ari da.'],
    below: ['{a} {b} baino beheragoko espazio bat prestatzen ari da.'],
    distance: [
      '{a} eta {b} zehazki {n} gelaxkako tartea duten lekuetatik ari dira elkarlanean.',
    ],
    between: ['{a} bi lagunen arteko espazioan ari da laguntzen: {b} eta {c}.'],
    'has-item': ['{a} honako honekin dabil: {i}.'],
    'does-not-have-item': ['{a} beste objektu batekin dabil, ez {i}.'],
    'item-in-place': ['«{p}» guneko jarduerarako prestatutako objektua: {i}.'],
    'item-not-in-place': ['«{p}» gunean beste zerbait aukeratu dute, ez {i}.'],
    'same-floor': ['{a} eta {b} gune bera partekatzen ari dira.'],
    'different-floor': ['{a} eta {b} gune desberdinak prestatzen ari dira.'],
  },
  gl: {
    'character-at-position': [
      'A {a} encántalle participar. Na zona «{p}», está na cela {d} do marcador «{o}».',
      '{a} chegou con moitas ganas á zona «{p}». Está na cela {d} do marcador «{o}».',
      '{a} axuda a preparar a zona «{p}». A súa cela está {d} do marcador «{o}».',
    ],
    'character-not-at-position': [
      '{a} prefire colaborar noutro espazo: non está na cela {d} do marcador «{o}» da zona «{p}».',
    ],
    'character-in-place': [
      '{a} entra pola porta do espazo «{p}» e saúda a todo o mundo.',
      '{a} está a gusto no espazo «{p}».',
    ],
    'character-not-in-place': ['{a} prefire axudar noutro espazo, fóra da zona «{p}».'],
    'in-corner': ['{a} prepara un recuncho luminoso do espazo.'],
    'not-in-corner': ['{a} traballa lonxe dos recunchos.'],
    'character-next-to-obstacle': [
      '{a} prepara con ilusión a zona «{p}», a carón da referencia «{o}».',
      'Na zona «{p}», {a} bota unha man a carón da referencia «{o}».',
      '{a} coida a zona «{p}» desde un espazo a carón da referencia «{o}».',
    ],
    adjacent: ['{a} e {b} preparan xuntos dous espazos veciños.'],
    'not-adjacent': ['{a} e {b} colaboran en espazos que non son veciños.'],
    'same-row': ['{a} e {b} axudan desde a mesma franxa do plano.'],
    'different-row': ['{a} e {b} axudan desde franxas diferentes do plano.'],
    'same-column': ['{a} e {b} colaboran dentro da mesma zona.'],
    'different-column': ['{a} e {b} colaboran en zonas diferentes.'],
    'left-of': ['{a} axuda nun espazo á esquerda de {b}.'],
    'right-of': ['{a} axuda nun espazo á dereita de {b}.'],
    above: ['{a} prepara un espazo por riba de {b}.'],
    below: ['{a} prepara un espazo por baixo de {b}.'],
    distance: ['{a} e {b} colaboran desde espazos separados exactamente por {n} celas.'],
    between: ['{a} axuda desde un espazo entre {b} e {c}.'],
    'has-item': ['{a} leva {i}.'],
    'does-not-have-item': ['{a} leva outro obxecto, non {i}.'],
    'item-in-place': ['Na zona «{p}» teñen este obxecto a punto para a actividade: {i}.'],
    'item-not-in-place': ['Na zona «{p}» escolleron outra cousa, non {i}.'],
    'same-floor': ['{a} e {b} comparten a mesma zona.'],
    'different-floor': ['{a} e {b} preparan zonas diferentes.'],
  },
  fr: {
    'character-at-position': [
      '{a} participe avec plaisir. Dans la zone « {p} », sa case se trouve {d} du repère « {o} ».',
      '{a} arrive avec beaucoup d’enthousiasme dans la zone « {p} ». Sa case se trouve {d} du repère « {o} ».',
      '{a} aide à préparer la zone « {p} ». Sa case se trouve {d} du repère « {o} ».',
    ],
    'character-not-at-position': [
      '{a} préfère aider ailleurs : sa place n’est pas dans la case {d} du repère « {o} » de la zone « {p} ».',
    ],
    'character-in-place': [
      '{a} entre par la porte de l’espace « {p} » et salue tout le monde.',
      '{a} se sent bien dans l’espace « {p} ».',
    ],
    'character-not-in-place': ['{a} préfère aider ailleurs, hors de la zone « {p} ».'],
    'in-corner': ['{a} prépare un coin lumineux.'],
    'not-in-corner': ['{a} travaille loin des coins.'],
    'character-next-to-obstacle': [
      '{a} prépare avec plaisir la zone « {p} », près du repère « {o} ».',
      'Dans la zone « {p} », {a} donne un coup de main près du repère « {o} ».',
      '{a} prend soin de la zone « {p} » depuis une place près du repère « {o} ».',
    ],
    adjacent: ['{a} et {b} préparent ensemble deux espaces voisins.'],
    'not-adjacent': ['{a} et {b} coopèrent dans des espaces qui ne sont pas voisins.'],
    'same-row': ['{a} et {b} aident depuis la même bande horizontale du plan.'],
    'different-row': ['{a} et {b} aident depuis des bandes horizontales différentes du plan.'],
    'same-column': ['{a} et {b} coopèrent dans la même bande verticale du plan.'],
    'different-column': [
      '{a} et {b} coopèrent dans des bandes verticales différentes du plan.',
    ],
    'left-of': ['{a} aide à gauche de {b}.'],
    'right-of': ['{a} aide à droite de {b}.'],
    above: ['{a} prépare un espace au-dessus de {b}.'],
    below: ['{a} prépare un espace en dessous de {b}.'],
    distance: ['{a} et {b} se trouvent à exactement {n} cases d’écart.'],
    between: ['{a} aide entre {b} et {c}.'],
    'has-item': ['{a} apporte cet objet : {i}.'],
    'does-not-have-item': ['{a} n’apporte pas cet objet : {i}.'],
    'item-in-place': ['Dans la zone « {p} », l’activité peut commencer avec cet objet : {i}.'],
    'item-not-in-place': [
      'Dans la zone « {p} », l’équipe choisit autre chose que cet objet : {i}.',
    ],
    'same-floor': ['{a} et {b} partagent la même zone.'],
    'different-floor': ['{a} et {b} préparent des zones différentes.'],
  },
  de: {
    'character-at-position': [
      '{a} macht mit großer Freude mit. In der Zone „{p}“ liegt der Platz {d} vom Orientierungspunkt „{o}“.',
      '{a} kommt voller Tatendrang in die Zone „{p}“. Der Platz liegt {d} vom Orientierungspunkt „{o}“.',
      '{a} hilft bei der Vorbereitung der Zone „{p}“. Der Platz liegt {d} vom Orientierungspunkt „{o}“.',
    ],
    'character-not-at-position': [
      '{a} hilft lieber woanders und ist nicht auf dem Platz {d} vom Orientierungspunkt „{o}“ in der Zone „{p}“.',
    ],
    'character-in-place': [
      '{a} kommt durch die Tür des Bereichs „{p}“ und begrüßt alle.',
      '{a} fühlt sich im Bereich „{p}“ wohl.',
    ],
    'character-not-in-place': ['{a} hilft lieber woanders, außerhalb der Zone „{p}“.'],
    'in-corner': ['{a} bereitet eine helle Ecke vor.'],
    'not-in-corner': ['{a} arbeitet abseits der Ecken.'],
    'character-next-to-obstacle': [
      '{a} bereitet voller Freude die Zone „{p}“ neben dem Orientierungspunkt „{o}“ vor.',
      'In der Zone „{p}“ hilft {a} neben dem Orientierungspunkt „{o}“.',
      '{a} kümmert sich von einem Platz neben dem Orientierungspunkt „{o}“ aus um die Zone „{p}“.',
    ],
    adjacent: ['{a} und {b} bereiten gemeinsam zwei benachbarte Bereiche vor.'],
    'not-adjacent': ['{a} und {b} helfen in Bereichen, die nicht benachbart sind.'],
    'same-row': ['{a} und {b} helfen im selben horizontalen Streifen des Plans.'],
    'different-row': ['{a} und {b} helfen in verschiedenen horizontalen Streifen des Plans.'],
    'same-column': ['{a} und {b} arbeiten im selben vertikalen Streifen des Plans.'],
    'different-column': [
      '{a} und {b} arbeiten in verschiedenen vertikalen Streifen des Plans.',
    ],
    'left-of': ['{a} hilft links von {b}.'],
    'right-of': ['{a} hilft rechts von {b}.'],
    above: ['{a} bereitet oberhalb von {b} einen Bereich vor.'],
    below: ['{a} bereitet unterhalb von {b} einen Bereich vor.'],
    distance: ['{a} und {b} befinden sich in einem Abstand von genau {n} Feldern.'],
    between: ['{a} hilft zwischen {b} und {c}.'],
    'has-item': ['{a} bringt diesen Gegenstand mit: {i}.'],
    'does-not-have-item': ['{a} bringt diesen Gegenstand nicht mit: {i}.'],
    'item-in-place': [
      'In der Zone „{p}“ steht dieser Gegenstand für die Aktivität bereit: {i}.',
    ],
    'item-not-in-place': [
      'In der Zone „{p}“ wurde etwas anderes gewählt, nicht dieser Gegenstand: {i}.',
    ],
    'same-floor': ['{a} und {b} teilen sich dieselbe Zone.'],
    'different-floor': ['{a} und {b} bereiten verschiedene Zonen vor.'],
  },
}

const cubeTemplates: Record<Locale, Templates> = {
  ca: {
    ...gridTemplates.ca,
    'character-at-position': [
      '{a} viu a «{p}», a la casella {d} de «{o}», i comparteix estones amb el veïnat.',
      'A «{p}», {a} fa comunitat des de la casella {d} de «{o}».',
    ],
    'character-not-at-position': [
      '{a} ajuda des d’una altra casella; no és a la casella {d} de «{o}» a «{p}».',
    ],
    'character-in-place': [
      'La llar de {a} és «{p}»; al replà sempre saluda el veïnat.',
      '{a} torna cada vespre a «{p}» i coincideix amb el veïnat al replà.',
      'Quan acaba el dia, {a} entra a «{p}» i comparteix una estona amb el veïnat.',
    ],
    'character-not-in-place': [
      '{a} viu en una altra zona de l’edifici, fora de l’espai «{p}».',
      '{a} passa sovint per «{p}», però la seva llar és en una altra zona.',
      'El replà de «{p}» no és el de {a}; cal buscar en una altra zona.',
    ],
    'in-corner': ['La llar de {a} fa cantonada i rep llum per dos costats.'],
    'not-in-corner': ['L’espai de {a} no fa cantonada; al replà saluda el veïnat.'],
    'has-item': ['{a} guarda {i} amb cura a casa.'],
    'does-not-have-item': ['{a} ha triat un altre objecte, no {i}.'],
    adjacent: [
      '{a} i {b} obren portes veïnes al mateix replà.',
      '{a} i {b} són veïns de porta i sovint coincideixen al replà.',
      'Les llars de {a} i {b} comparteixen replà i tenen les portes de costat.',
    ],
    'not-adjacent': [
      'Les portes de {a} i {b} no són veïnes.',
      '{a} i {b} es troben a l’edifici, però no viuen porta per porta.',
      'Al replà, la porta de {a} no queda al costat de la de {b}.',
    ],
    above: [
      '{a} viu al pis de sobre de {b}, a la mateixa ala.',
      '{a} saluda {b} des del pis immediatament superior de la mateixa ala.',
      'A la mateixa ala, la llar de {a} queda just damunt de la de {b}.',
    ],
    below: [
      '{a} viu al pis de sota de {b}, a la mateixa ala.',
      '{a} saluda {b} des del pis immediatament inferior de la mateixa ala.',
      'A la mateixa ala, la llar de {a} queda just sota la de {b}.',
    ],
    'same-floor': [
      '{a} i {b} comparteixen el mateix replà i sempre es saluden.',
      '{a} i {b} viuen al mateix pis i coincideixen sovint al replà.',
      'Les portes de {a} i {b} s’obren al mateix pis de l’edifici.',
    ],
    'different-floor': [
      '{a} i {b} viuen en pisos diferents i es troben a l’entrada.',
      '{a} i {b} no comparteixen pis, tot i que sovint coincideixen a l’ascensor.',
      'Per visitar-se, {a} i {b} han de canviar de pis.',
    ],
  },
  es: {
    ...gridTemplates.es,
    'character-at-position': [
      '{a} vive en «{p}», en la casilla {d} de la referencia «{o}», y comparte momentos con el vecindario.',
      'En «{p}», {a} hace comunidad desde la casilla {d} de la referencia «{o}».',
    ],
    'character-not-at-position': [
      '{a} ayuda desde otra casilla; no está en la casilla {d} de la referencia «{o}» de «{p}».',
    ],
    'character-in-place': [
      'La puerta de {a} se abre en «{p}», donde siempre saluda al vecindario.',
    ],
    'character-not-in-place': ['{a} vive en otra zona del edificio, no en «{p}».'],
    'in-corner': ['El hogar de {a} hace esquina y recibe luz por dos lados.'],
    'not-in-corner': ['El espacio de {a} no hace esquina; saluda al vecindario en el rellano.'],
    'has-item': ['{a} cuida de {i} en casa.'],
    'does-not-have-item': ['{a} tiene otro objeto favorito, no {i}.'],
    adjacent: ['{a} y {b} abren puertas vecinas en el mismo rellano.'],
    'not-adjacent': ['Las puertas de {a} y {b} no son vecinas.'],
    above: ['{a} vive en el piso de encima de {b}, en la misma ala.'],
    below: ['{a} vive en el piso de debajo de {b}, en la misma ala.'],
    'same-floor': ['{a} y {b} comparten rellano y siempre se saludan.'],
    'different-floor': ['{a} y {b} viven en pisos distintos y se encuentran en la entrada.'],
  },
  en: {
    ...gridTemplates.en,
    'character-at-position': [
      '{a} lives in “{p}”, in the cell {d} “{o}”, and shares time with the neighbors.',
      'In “{p}”, {a} helps the community from the cell {d} “{o}”.',
    ],
    'character-not-at-position': [
      '{a} helps from another cell, not the cell {d} “{o}” in “{p}”.',
    ],
    'character-in-place': [
      "{a}'s door opens into “{p}”, where they always greet the neighbors.",
    ],
    'character-not-in-place': ['{a} lives elsewhere in the building, not in “{p}”.'],
    'in-corner': ["{a}'s home is on a corner and gets light from two sides."],
    'not-in-corner': ["{a}'s space is not on a corner; they greet neighbors on the landing."],
    'has-item': ['{a} looks after {i} at home.'],
    'does-not-have-item': ['{a} has another favorite object, not {i}.'],
    adjacent: ['{a} and {b} open neighboring doors on the same landing.'],
    'not-adjacent': ["{a} and {b}'s doors are not neighbors."],
    above: ['{a} lives one floor above {b}, in the same wing.'],
    below: ['{a} lives one floor below {b}, in the same wing.'],
    'same-floor': ['{a} and {b} share a landing and always say hello.'],
    'different-floor': ['{a} and {b} live on different floors and meet by the entrance.'],
  },
  eu: {
    ...gridTemplates.eu,
    'character-at-position': [
      '{a} «{p}» kokapeneko «{o}» erreferentziaren {d} dagoen gelaxkan bizi da eta auzokideekin egoten da.',
      '«{p}» kokapenean, {a} «{o}» erreferentziaren {d} dagoen gelaxkatik ari da laguntzen.',
    ],
    'character-not-at-position': [
      '{a} beste gelaxka batetik ari da auzoari laguntzen; ez dago «{p}» kokapeneko «{o}» erreferentziaren {d} dagoen gelaxkan.',
    ],
    'character-in-place': [
      '{a} bizi den etxeko atea «{p}» eremura irekitzen da; auzokideak beti agurtzen ditu.',
    ],
    'character-not-in-place': ['{a} eraikineko beste gune batean bizi da, ez «{p}» eremuan.'],
    'in-corner': ['{a} bizi den etxea izkinan dago eta bi aldetatik jasotzen du argia.'],
    'not-in-corner': [
      '{a} bizi den espazioa ez dago izkinan; eskailburuan auzokideak agurtzen ditu.',
    ],
    'has-item': ['Etxean, {a} honako honekin arduratzen da: {i}.'],
    'does-not-have-item': ['{a} beste objektu batekin dabil, ez {i}.'],
    adjacent: ['Bi etxeetako ateak auzokoak dira; etxe horietan {a} eta {b} bizi dira.'],
    'not-adjacent': ['{a} eta {b} bizi diren etxeetako ateak ez dira auzokoak.'],
    above: ['{a} {b} baino solairu bat gorago bizi da, eraikinaren hegal berean.'],
    below: ['{a} {b} baino solairu bat beherago bizi da, eraikinaren hegal berean.'],
    'same-floor': ['{a} eta {b} eskailburu berean bizi dira eta beti agurtzen dute elkar.'],
    'different-floor': [
      '{a} eta {b} solairu desberdinetan bizi dira eta sarreran elkartzen dira.',
    ],
  },
  gl: {
    ...gridTemplates.gl,
    'character-at-position': [
      '{a} vive en «{p}», na cela {d} da referencia «{o}», e comparte momentos coa veciñanza.',
      'En «{p}», {a} fai comunidade desde a cela {d} da referencia «{o}».',
    ],
    'character-not-at-position': [
      '{a} axuda desde outra cela; non está na cela {d} da referencia «{o}» de «{p}».',
    ],
    'character-in-place': [
      'A porta do fogar de {a} abre cara ao espazo «{p}», onde sempre saúda a veciñanza.',
    ],
    'character-not-in-place': ['{a} vive noutra zona do edificio, non no espazo «{p}».'],
    'in-corner': ['O fogar de {a} fai esquina e recibe luz por dous lados.'],
    'not-in-corner': ['O espazo de {a} non fai esquina; saúda a veciñanza no relanzo.'],
    'has-item': ['{a} garda {i} con coidado na casa.'],
    'does-not-have-item': ['{a} escolleu outro obxecto, non {i}.'],
    adjacent: ['{a} e {b} abren portas veciñas no mesmo relanzo.'],
    'not-adjacent': ['As portas de {a} e {b} non son veciñas.'],
    above: ['{a} vive un andar por riba de {b}, na mesma ala.'],
    below: ['{a} vive un andar por baixo de {b}, na mesma ala.'],
    'same-floor': ['{a} e {b} comparten o mesmo relanzo e sempre se saúdan.'],
    'different-floor': ['{a} e {b} viven en andares diferentes e atópanse na entrada.'],
  },
  fr: {
    ...gridTemplates.fr,
    'character-at-position': [
      '{a} habite dans « {p} », dans la case {d} de la référence « {o} », et partage de bons moments avec le voisinage.',
      'Dans « {p} », {a} aide le voisinage depuis la case {d} de la référence « {o} ».',
    ],
    'character-not-at-position': [
      '{a} aide depuis une autre case, pas depuis la case {d} de la référence « {o} » dans « {p} ».',
    ],
    'character-in-place': [
      'La porte du logement de {a} donne sur l’espace « {p} », où {a} salue toujours le voisinage.',
    ],
    'character-not-in-place': [
      '{a} habite dans une autre zone du bâtiment, pas dans l’espace « {p} ».',
    ],
    'in-corner': ['Le logement de {a} est dans un angle et reçoit la lumière de deux côtés.'],
    'not-in-corner': [
      'L’espace de {a} n’est pas dans un angle ; {a} retrouve volontiers le voisinage sur le palier.',
    ],
    'has-item': ['{a} garde cet objet avec soin à la maison : {i}.'],
    'does-not-have-item': ['{a} choisit un autre objet, pas celui-ci : {i}.'],
    adjacent: ['{a} et {b} ouvrent des portes voisines sur le même palier.'],
    'not-adjacent': ['Les portes de {a} et de {b} ne sont pas voisines.'],
    above: ['{a} habite un étage au-dessus de {b}, dans la même aile.'],
    below: ['{a} habite un étage en dessous de {b}, dans la même aile.'],
    'same-floor': ['{a} et {b} partagent le même palier et se saluent toujours.'],
    'different-floor': [
      '{a} et {b} habitent à des étages différents et se retrouvent à l’entrée.',
    ],
  },
  de: {
    ...gridTemplates.de,
    'character-at-position': [
      '{a} wohnt in „{p}“, im Feld {d} von der Markierung „{o}“, und verbringt gern Zeit mit der Nachbarschaft.',
      'In „{p}“ hilft {a} der Hausgemeinschaft vom Feld {d} von der Markierung „{o}“ aus.',
    ],
    'character-not-at-position': [
      '{a} hilft von einem anderen Feld aus, nicht vom Feld {d} von der Markierung „{o}“ in „{p}“.',
    ],
    'character-in-place': [
      'Die Wohnungstür von {a} öffnet sich zum Bereich „{p}“, wo {a} immer die Nachbarschaft begrüßt.',
    ],
    'character-not-in-place': [
      '{a} wohnt in einem anderen Teil des Gebäudes, nicht im Bereich „{p}“.',
    ],
    'in-corner': ['Das Zuhause von {a} liegt an einer Ecke und bekommt von zwei Seiten Licht.'],
    'not-in-corner': [
      'Der Bereich von {a} liegt nicht an einer Ecke; {a} trifft die Nachbarschaft gern am Treppenabsatz.',
    ],
    'has-item': ['{a} bewahrt diesen Gegenstand zu Hause sorgfältig auf: {i}.'],
    'does-not-have-item': ['{a} hat einen anderen Gegenstand gewählt, nicht diesen: {i}.'],
    adjacent: ['{a} und {b} öffnen benachbarte Türen am selben Treppenabsatz.'],
    'not-adjacent': ['Die Türen von {a} und {b} sind nicht benachbart.'],
    above: ['{a} wohnt eine Etage über {b}, im selben Gebäudeflügel.'],
    below: ['{a} wohnt eine Etage unter {b}, im selben Gebäudeflügel.'],
    'same-floor': ['{a} und {b} teilen sich denselben Treppenabsatz und grüßen sich immer.'],
    'different-floor': [
      '{a} und {b} wohnen auf verschiedenen Etagen und treffen sich am Eingang.',
    ],
  },
}

const cubeShopTemplates: Record<Locale, Templates> = {
  ca: {
    ...cubeTemplates.ca,
    'character-at-position': [
      '{a} obre «{p}» cada matí des de la casella {d} de «{o}» per rebre el barri.',
      'A «{p}», {a} atén el veïnat des de la casella {d} de «{o}».',
    ],
    'character-not-at-position': [
      '{a} ajuda des d’una altra casella; no és a la casella {d} de «{o}» a «{p}».',
    ],
    'character-in-place': [
      '{a} prepara l’aparador de «{p}» abans d’obrir.',
      'Cada matí, {a} aixeca la persiana de «{p}» i dona la benvinguda al barri.',
      '{a} atén el veïnat a «{p}» i té cura de la botiga.',
    ],
    'character-not-in-place': [
      '{a} treballa en una altra botiga de l’edifici, diferent de l’espai «{p}».',
      '{a} visita «{p}», però obre una altra botiga de la planta baixa.',
      'La botiga de {a} és a la planta baixa, però no és «{p}».',
    ],
    'has-item': ['{a} prepara {i} per a l’aparador de la botiga.'],
    'does-not-have-item': ['Avui, {a} mostra un altre objecte a l’aparador, no {i}.'],
    adjacent: [
      '{a} i {b} atenen dos espais veïns i es donen un cop de mà.',
      'Les botigues de {a} i {b} són de costat i comparteixen el moviment del matí.',
      '{a} i {b} obren portes veïnes a la planta baixa.',
    ],
    'not-adjacent': [
      '{a} i {b} col·laboren, però els seus espais no tenen portes veïnes.',
      'Les botigues de {a} i {b} són a la planta baixa, però no són de costat.',
      '{a} i {b} comparteixen barri, no pas una paret entre botigues.',
    ],
    'same-floor': [
      '{a} i {b} obren les dues botigues de la planta baixa i s’ajuden.',
      '{a} i {b} treballen a la planta baixa i coincideixen abans d’obrir.',
      'Les botigues de {a} i {b} comparteixen la planta baixa de l’edifici.',
    ],
    'different-floor': [
      'Una persona treballa a la planta baixa i l’altra és en un altre pis; {a} i {b} es troben a l’entrada.',
    ],
  },
  es: {
    ...cubeTemplates.es,
    'character-at-position': [
      '{a} abre «{p}» cada mañana desde la casilla {d} de la referencia «{o}» para recibir al barrio.',
      'En «{p}», {a} atiende al vecindario desde la casilla {d} de la referencia «{o}».',
    ],
    'character-not-at-position': [
      '{a} ayuda desde otra casilla; no está en la casilla {d} de la referencia «{o}» de «{p}».',
    ],
    'character-in-place': ['{a} prepara el escaparate de «{p}» antes de abrir.'],
    'character-not-in-place': ['{a} trabaja en otra tienda del edificio, no en «{p}».'],
    'has-item': ['{a} prepara {i} para el escaparate de la tienda.'],
    'does-not-have-item': ['Hoy, {a} muestra otro objeto en el escaparate, no {i}.'],
    adjacent: ['{a} y {b} atienden dos espacios vecinos y se ayudan.'],
    'not-adjacent': ['{a} y {b} colaboran, pero sus espacios no tienen puertas vecinas.'],
    'same-floor': ['{a} y {b} abren las dos tiendas de la planta baja y se ayudan.'],
    'different-floor': [
      'Una persona trabaja en la planta baja y la otra está en otro piso; {a} y {b} se encuentran en la entrada.',
    ],
  },
  en: {
    ...cubeTemplates.en,
    'character-at-position': [
      '{a} opens “{p}” each morning from the cell {d} “{o}” to welcome the neighborhood.',
      'At “{p}”, {a} helps customers from the cell {d} “{o}”.',
    ],
    'character-not-at-position': [
      '{a} helps from another cell, not the cell {d} “{o}” in “{p}”.',
    ],
    'character-in-place': ['{a} prepares the window display at “{p}” before opening.'],
    'character-not-in-place': ['{a} works in another shop in the building, not “{p}”.'],
    'has-item': ['{a} prepares {i} for the shop window.'],
    'does-not-have-item': ['Today, {a} displays another object, not {i}.'],
    adjacent: ['{a} and {b} look after neighboring spaces and help each other.'],
    'not-adjacent': [
      '{a} and {b} work together, but their spaces do not have neighboring doors.',
    ],
    'same-floor': ['{a} and {b} open the two ground-floor shops and help each other.'],
    'different-floor': [
      'One person works on the ground floor and the other is on another floor; {a} and {b} meet by the entrance.',
    ],
  },
  eu: {
    ...cubeTemplates.eu,
    'character-at-position': [
      '{a} da «{p}» goizero irekitzen duena; «{o}» erreferentziaren {d} dagoen gelaxkatik egiten dio harrera auzoari.',
      '«{p}» kokapenean, {a} «{o}» erreferentziaren {d} dagoen gelaxkatik ari da auzoari laguntzen.',
    ],
    'character-not-at-position': [
      '{a} beste gelaxka batean ari da auzoari laguntzen; ez dago «{p}» kokapeneko «{o}» erreferentziaren {d} dagoen gelaxkan.',
    ],
    'character-in-place': ['{a} «{p}» dendako erakusleihoa prestatzen ari da ireki aurretik.'],
    'character-not-in-place': [
      '{a} eraikineko beste denda batean ari da lanean, ez «{p}» dendan.',
    ],
    'has-item': ['{a} erakusleihoa prestatzen ari da, honako honekin: {i}.'],
    'does-not-have-item': ['Gaur, {a} beste objektu bat erakusten ari da, ez {i}.'],
    adjacent: ['{a} eta {b} auzoko bi espaziotan ari dira eta elkarri laguntzen diote.'],
    'not-adjacent': [
      '{a} eta {b} elkarlanean ari dira, baina beren espazioetako ateak ez dira auzokoak.',
    ],
    'same-floor': [
      '{a} eta {b} beheko solairuko bi dendak irekitzen ari dira eta elkarri laguntzen diote.',
    ],
    'different-floor': [
      'Bietako bat beheko solairuan ari da lanean eta bestea beste solairu batean dago; {a} eta {b} sarreran elkartzen dira.',
    ],
  },
  gl: {
    ...cubeTemplates.gl,
    'character-at-position': [
      '{a} abre «{p}» cada mañá desde a cela {d} da referencia «{o}» para recibir o barrio.',
      'En «{p}», {a} atende a veciñanza desde a cela {d} da referencia «{o}».',
    ],
    'character-not-at-position': [
      '{a} axuda desde outra cela; non está na cela {d} da referencia «{o}» de «{p}».',
    ],
    'character-in-place': ['{a} prepara o escaparate do espazo «{p}» antes de abrir.'],
    'character-not-in-place': [
      '{a} traballa noutra tenda do edificio, diferente do espazo «{p}».',
    ],
    'has-item': ['{a} prepara {i} para o escaparate da tenda.'],
    'does-not-have-item': ['Hoxe, {a} mostra outro obxecto no escaparate, non {i}.'],
    adjacent: ['{a} e {b} atenden dous espazos veciños e axúdanse.'],
    'not-adjacent': ['{a} e {b} colaboran, pero os seus espazos non teñen portas veciñas.'],
    'same-floor': ['{a} e {b} abren as dúas tendas da planta baixa e axúdanse.'],
    'different-floor': [
      'Unha persoa traballa na planta baixa e a outra está noutro andar; {a} e {b} atópanse na entrada.',
    ],
  },
  fr: {
    ...cubeTemplates.fr,
    'character-at-position': [
      '{a} ouvre « {p} » chaque matin depuis la case {d} de la référence « {o} » pour accueillir le quartier.',
      'Dans « {p} », {a} aide le voisinage depuis la case {d} de la référence « {o} ».',
    ],
    'character-not-at-position': [
      '{a} aide depuis une autre case, pas depuis la case {d} de la référence « {o} » dans « {p} ».',
    ],
    'character-in-place': ['{a} prépare la vitrine de l’espace « {p} » avant l’ouverture.'],
    'character-not-in-place': [
      '{a} travaille dans une autre boutique du bâtiment, et non dans l’espace « {p} ».',
    ],
    'has-item': ['{a} prépare cet objet pour la vitrine de la boutique : {i}.'],
    'does-not-have-item': [
      'Aujourd’hui, {a} présente un autre objet dans la vitrine, pas celui-ci : {i}.',
    ],
    adjacent: ['{a} et {b} s’occupent de deux espaces voisins et s’entraident.'],
    'not-adjacent': [
      '{a} et {b} coopèrent, mais les portes de leurs espaces ne sont pas voisines.',
    ],
    'same-floor': ['{a} et {b} ouvrent les deux boutiques du rez-de-chaussée et s’entraident.'],
    'different-floor': [
      'L’une des deux personnes travaille au rez-de-chaussée et l’autre se trouve à un autre étage ; {a} et {b} se retrouvent à l’entrée.',
    ],
  },
  de: {
    ...cubeTemplates.de,
    'character-at-position': [
      '{a} öffnet „{p}“ jeden Morgen vom Feld {d} von der Markierung „{o}“ aus und begrüßt die Nachbarschaft.',
      'In „{p}“ hilft {a} der Nachbarschaft vom Feld {d} von der Markierung „{o}“ aus.',
    ],
    'character-not-at-position': [
      '{a} hilft von einem anderen Feld aus, nicht vom Feld {d} von der Markierung „{o}“ in „{p}“.',
    ],
    'character-in-place': [
      '{a} bereitet vor der Öffnung das Schaufenster des Ladens „{p}“ vor.',
    ],
    'character-not-in-place': [
      '{a} arbeitet in einem anderen Laden im Gebäude, nicht im Laden „{p}“.',
    ],
    'has-item': ['{a} bereitet diesen Gegenstand für das Schaufenster vor: {i}.'],
    'does-not-have-item': [
      'Heute zeigt {a} einen anderen Gegenstand im Schaufenster, nicht diesen: {i}.',
    ],
    adjacent: ['{a} und {b} betreuen zwei benachbarte Bereiche und helfen einander.'],
    'not-adjacent': [
      '{a} und {b} arbeiten zusammen, aber die Türen ihrer Bereiche sind nicht benachbart.',
    ],
    'same-floor': ['{a} und {b} öffnen die beiden Läden im Erdgeschoss und helfen einander.'],
    'different-floor': [
      'Eine der beiden Personen arbeitet im Erdgeschoss, die andere befindet sich in einem anderen Stockwerk; {a} und {b} treffen sich am Eingang.',
    ],
  },
}

const requiredTemplatePlaceholders: Readonly<Record<Clue['type'], readonly string[]>> = {
  'character-at-position': ['a', 'p'],
  'character-not-at-position': ['a', 'p'],
  'character-in-place': ['a', 'p'],
  'character-not-in-place': ['a', 'p'],
  'in-corner': ['a'],
  'not-in-corner': ['a'],
  'character-next-to-obstacle': ['a', 'p', 'o'],
  adjacent: ['a', 'b'],
  'not-adjacent': ['a', 'b'],
  'same-row': ['a', 'b'],
  'different-row': ['a', 'b'],
  'same-column': ['a', 'b'],
  'different-column': ['a', 'b'],
  'left-of': ['a', 'b'],
  'right-of': ['a', 'b'],
  above: ['a', 'b'],
  below: ['a', 'b'],
  distance: ['a', 'b', 'n'],
  between: ['a', 'b', 'c'],
  'has-item': ['a', 'i'],
  'does-not-have-item': ['a', 'i'],
  'item-in-place': ['i', 'p'],
  'item-not-in-place': ['i', 'p'],
  'same-floor': ['a', 'b'],
  'different-floor': ['a', 'b'],
}

export const auditClueTemplatePlaceholders = (): readonly string[] => {
  const families = [
    { name: 'map', templates: mapTemplates, exactLocation: false },
    { name: 'grid', templates: gridTemplates, exactLocation: true },
    { name: 'cube-home', templates: cubeTemplates, exactLocation: true },
    { name: 'cube-shop', templates: cubeShopTemplates, exactLocation: true },
  ] as const
  const issues: string[] = []

  for (const family of families) {
    for (const locale of activeLocales) {
      for (const clueType of Object.keys(requiredTemplatePlaceholders) as Clue['type'][]) {
        const required = [
          ...requiredTemplatePlaceholders[clueType],
          ...(family.exactLocation &&
          (clueType === 'character-at-position' || clueType === 'character-not-at-position')
            ? ['d', 'o']
            : []),
        ]
        for (const [variant, template] of family.templates[locale][clueType].entries()) {
          const placeholders = new Set(
            [...template.matchAll(/\{(\w+)\}/gu)].map((match) => match[1]),
          )
          const missing = required.filter((placeholder) => !placeholders.has(placeholder))
          if (missing.length > 0) {
            issues.push(
              `${family.name}:${locale}:${clueType}:${variant} missing ${missing.join(',')}`,
            )
          }
        }
      }
    }
  }
  return issues
}

export const auditCatalanClueReadability = (): readonly string[] => {
  const families = [
    { name: 'map', templates: mapTemplates.ca },
    { name: 'grid', templates: gridTemplates.ca },
    { name: 'cube-home', templates: cubeTemplates.ca },
    { name: 'cube-shop', templates: cubeShopTemplates.ca },
  ] as const
  const issues: string[] = []
  const logicalItemClues = new Set<Clue['type']>([
    'has-item',
    'does-not-have-item',
    'item-in-place',
    'item-not-in-place',
  ])

  for (const family of families) {
    for (const clueType of Object.keys(family.templates) as Clue['type'][]) {
      for (const [variant, template] of family.templates[clueType].entries()) {
        if (/\breferència\b/iu.test(template)) {
          issues.push(`${family.name}:${clueType}:${variant}`)
        }
        if (!logicalItemClues.has(clueType) && template.includes('{i}')) {
          issues.push(`${family.name}:${clueType}:${variant}:decorative-item`)
        }
      }
    }
  }
  return issues
}

export const auditClueObjectRelevance = (): readonly string[] => {
  const families = [
    { name: 'map', templates: mapTemplates },
    { name: 'grid', templates: gridTemplates },
    { name: 'cube-home', templates: cubeTemplates },
    { name: 'cube-shop', templates: cubeShopTemplates },
  ] as const
  const logicalItemClues = new Set<Clue['type']>([
    'has-item',
    'does-not-have-item',
    'item-in-place',
    'item-not-in-place',
  ])
  const issues: string[] = []

  for (const family of families) {
    for (const locale of activeLocales) {
      for (const clueType of Object.keys(family.templates[locale]) as Clue['type'][]) {
        if (logicalItemClues.has(clueType)) continue
        for (const [variant, template] of family.templates[locale][clueType].entries()) {
          if (template.includes('{i}')) {
            issues.push(`${family.name}:${locale}:${clueType}:${variant}`)
          }
        }
      }
    }
  }
  return issues
}

const clueCharacterIds = (clue: Clue): readonly CharacterId[] => {
  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position':
    case 'character-in-place':
    case 'character-not-in-place':
    case 'in-corner':
    case 'not-in-corner':
    case 'character-next-to-obstacle':
    case 'has-item':
    case 'does-not-have-item':
      return [clue.characterId]
    case 'adjacent':
    case 'not-adjacent':
    case 'same-row':
    case 'different-row':
    case 'same-column':
    case 'different-column':
    case 'same-floor':
    case 'different-floor':
    case 'left-of':
    case 'right-of':
    case 'above':
    case 'below':
    case 'distance':
      return [clue.firstCharacterId, clue.secondCharacterId]
    case 'between':
      return [clue.characterId, clue.firstCharacterId, clue.secondCharacterId]
    case 'item-in-place':
    case 'item-not-in-place':
      return []
  }
}

const isShopPlace = (puzzle: Puzzle, placeId: PlaceId) =>
  puzzle.positions.some(
    (position) => position.placeId === placeId && position.buildingKind === 'shop',
  )

const sellerCharacterIds = (puzzle: Puzzle) =>
  new Set(
    puzzle.clues.flatMap((clue) => {
      if (clue.type === 'character-at-position') {
        const position = puzzle.positions.find((candidate) => candidate.id === clue.positionId)
        return position?.buildingKind === 'shop' ? [clue.characterId] : []
      }
      if (clue.type === 'character-in-place' && isShopPlace(puzzle, clue.placeId)) {
        return [clue.characterId]
      }
      return []
    }),
  )

const clueUsesShopCopy = (puzzle: Puzzle, clue: Clue) => {
  if (clue.type === 'character-at-position' || clue.type === 'character-not-at-position') {
    const position = puzzle.positions.find((candidate) => candidate.id === clue.positionId)
    if (position?.buildingKind === 'shop') return true
  }
  if (
    (clue.type === 'character-in-place' ||
      clue.type === 'character-not-in-place' ||
      clue.type === 'item-in-place' ||
      clue.type === 'item-not-in-place') &&
    isShopPlace(puzzle, clue.placeId)
  ) {
    return true
  }
  const sellers = sellerCharacterIds(puzzle)
  return clueCharacterIds(clue).some((characterId) => sellers.has(characterId))
}

const fallbackVocabulary: Record<
  Locale,
  {
    readonly person: string
    readonly place: string
    readonly item: string
    readonly near: string
    readonly landmark: string
  }
> = {
  ca: {
    person: 'algú',
    place: 'aquí',
    item: 'objecte',
    near: 'a prop',
    landmark: 'referència',
  },
  es: {
    person: 'alguien',
    place: 'aquí',
    item: 'objeto',
    near: 'cerca',
    landmark: 'referencia',
  },
  en: {
    person: 'someone',
    place: 'here',
    item: 'object',
    near: 'near',
    landmark: 'landmark',
  },
  eu: {
    person: 'norbait',
    place: 'hemen',
    item: 'objektua',
    near: 'ondoan',
    landmark: 'erreferentzia',
  },
  gl: {
    person: 'alguén',
    place: 'aquí',
    item: 'obxecto',
    near: 'a carón',
    landmark: 'referencia',
  },
  fr: {
    person: 'une personne',
    place: 'ici',
    item: 'objet',
    near: 'près',
    landmark: 'repère',
  },
  de: {
    person: 'jemand',
    place: 'hier',
    item: 'Gegenstand',
    near: 'in der Nähe',
    landmark: 'Orientierungspunkt',
  },
}

const valueOrFallback = <Id extends string>(
  values: readonly { readonly id: Id; readonly name?: string; readonly label?: string }[],
  id: Id,
  fallback: string,
) =>
  values.find((value) => value.id === id)?.name ??
  values.find((value) => value.id === id)?.label ??
  fallback

const placeLabel = (puzzle: Puzzle, placeId: PlaceId, locale: Locale) => {
  const position = puzzle.positions.find((candidate) => candidate.placeId === placeId)
  return position
    ? position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : localizeThemeLabel(locale, puzzle.theme, gridPlaceLabel(position.label))
    : fallbackVocabulary[locale].place
}

const gridPlaceLabel = (label: string) => label.replace(/\s·\s\d+(?:\.\d+)?$/u, '')

const landmarkDirection = (position: Position, obstacle: Position, locale: Locale) => {
  const directions = {
    ca: {
      left: "a l'esquerra",
      right: 'a la dreta',
      above: 'damunt',
      below: 'sota',
    },
    es: {
      left: 'a la izquierda',
      right: 'a la derecha',
      above: 'encima',
      below: 'debajo',
    },
    en: {
      left: 'to the left of',
      right: 'to the right of',
      above: 'above',
      below: 'below',
    },
    eu: {
      left: 'ezkerrean',
      right: 'eskuinean',
      above: 'goian',
      below: 'behean',
    },
    gl: {
      left: 'á esquerda',
      right: 'á dereita',
      above: 'por riba',
      below: 'por baixo',
    },
    fr: {
      left: 'à gauche',
      right: 'à droite',
      above: 'au-dessus',
      below: 'en dessous',
    },
    de: {
      left: 'links',
      right: 'rechts',
      above: 'oberhalb',
      below: 'unterhalb',
    },
  } as const
  const set = directions[locale]
  if (position.column < obstacle.column) return set.left
  if (position.column > obstacle.column) return set.right
  if (position.row < obstacle.row) return set.above
  return set.below
}

export type CluePart =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'icon'; readonly emoji: string; readonly label: string }

interface ClueValue {
  readonly text: string
  readonly emoji?: string
}

const textValue = (text: string): ClueValue => ({ text })

const clueValues = (puzzle: Puzzle, clue: Clue, locale: Locale) => {
  const fallback = fallbackVocabulary[locale]
  const characterName = (id: CharacterId) =>
    valueOrFallback(puzzle.characters, id, fallback.person)
  const positionFor = (id: PositionId) =>
    puzzle.positions.find((position) => position.id === id)
  const itemValue = (id: ItemId): ClueValue => {
    const item = puzzle.items.find((candidate) => candidate.id === id)
    return item
      ? {
          text: localizeThemeLabel(locale, puzzle.theme, item.label),
          emoji: item.emoji,
        }
      : textValue(fallback.item)
  }
  const localizedPlace = (position: Position) =>
    position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : localizeThemeLabel(locale, puzzle.theme, gridPlaceLabel(position.label))
  const obstacleValue = (position: Position, fallback: string): ClueValue => ({
    text: localizeThemeLabel(locale, puzzle.theme, position.obstacleLabel ?? fallback),
    emoji: position.obstacleEmoji,
  })
  const itemForCharacter = (id: CharacterId): ClueValue => {
    const character = puzzle.characters.find((candidate) => candidate.id === id)
    return character?.itemId ? itemValue(character.itemId) : textValue(fallback.item)
  }
  const values: Record<string, ClueValue> = {}

  switch (clue.type) {
    case 'character-at-position':
    case 'character-not-at-position': {
      const position = positionFor(clue.positionId)
      values.a = textValue(characterName(clue.characterId))
      values.i = position?.itemId
        ? itemValue(position.itemId)
        : itemForCharacter(clue.characterId)
      values.p = textValue(position ? localizedPlace(position) : fallback.place)
      const obstacle = position
        ? puzzle.positions.find(
            (candidate) =>
              candidate.blocked &&
              candidate.placeId === position.placeId &&
              Math.abs(candidate.row - position.row) +
                Math.abs(candidate.column - position.column) ===
                1,
          )
        : undefined
      values.d = textValue(
        position && obstacle ? landmarkDirection(position, obstacle, locale) : fallback.near,
      )
      values.o = obstacle
        ? obstacleValue(obstacle, fallback.landmark)
        : textValue(fallback.landmark)
      break
    }
    case 'character-in-place':
    case 'character-not-in-place':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.p = textValue(placeLabel(puzzle, clue.placeId, locale))
      break
    case 'in-corner':
    case 'not-in-corner':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      break
    case 'character-next-to-obstacle': {
      const obstacle = positionFor(clue.obstaclePositionId)
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.p = textValue(obstacle ? localizedPlace(obstacle) : fallback.place)
      values.o = obstacle
        ? obstacleValue(obstacle, fallback.landmark)
        : textValue(fallback.landmark)
      break
    }
    case 'has-item':
    case 'does-not-have-item':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemValue(clue.itemId)
      break
    case 'item-in-place':
    case 'item-not-in-place':
      values.i = itemValue(clue.itemId)
      values.p = textValue(placeLabel(puzzle, clue.placeId, locale))
      break
    case 'between':
      values.a = textValue(characterName(clue.characterId))
      values.i = itemForCharacter(clue.characterId)
      values.b = textValue(characterName(clue.firstCharacterId))
      values.c = textValue(characterName(clue.secondCharacterId))
      break
    case 'distance':
      values.a = textValue(characterName(clue.firstCharacterId))
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = textValue(characterName(clue.secondCharacterId))
      values.n = textValue(String(clue.distance))
      break
    default:
      values.a = textValue(characterName(clue.firstCharacterId))
      values.i = itemForCharacter(clue.firstCharacterId)
      values.b = textValue(characterName(clue.secondCharacterId))
  }

  return values
}

export const renderClueParts = (
  puzzle: Puzzle,
  clue: Clue,
  locale: Locale = 'ca',
): readonly CluePart[] => {
  const values = clueValues(puzzle, clue, locale)
  const templateSet =
    puzzle.boardMode === 'logic-cube'
      ? clueUsesShopCopy(puzzle, clue)
        ? cubeShopTemplates
        : cubeTemplates
      : puzzle.boardMode === 'logic-grid'
        ? gridTemplates
        : mapTemplates
  const variants = templateSet[locale][clue.type]
  const template = variants[clue.phraseVariant % variants.length]
  const parts: CluePart[] = []
  let cursor = 0
  for (const match of template.matchAll(/\{(\w+)\}/gu)) {
    const index = match.index
    const key = match[1] ?? ''
    const value = values[key] ?? textValue(key)
    const precedingText = template.slice(cursor, index)
    const needsElision = /^[aeiouhàâäéèêëíïîóòôöúùûü]/iu.test(value.text)
    const localizedPrecedingText =
      (locale === 'fr' || locale === 'ca') && /de $/u.test(precedingText) && needsElision
        ? precedingText.replace(/de $/u, 'd’')
        : precedingText
    if (localizedPrecedingText) parts.push({ type: 'text', text: localizedPrecedingText })
    if (value.emoji) {
      parts.push({ type: 'icon', emoji: value.emoji, label: value.text })
      parts.push({ type: 'text', text: ` ${value.text}` })
    } else {
      parts.push({ type: 'text', text: value.text })
    }
    cursor = index + match[0].length
  }
  if (cursor < template.length) parts.push({ type: 'text', text: template.slice(cursor) })
  return parts
}

export const renderClue = (puzzle: Puzzle, clue: Clue, locale: Locale = 'ca') =>
  renderClueParts(puzzle, clue, locale)
    .map((part) => (part.type === 'icon' ? part.emoji : part.text))
    .join('')
