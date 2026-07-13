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

type Templates = Record<Clue['type'], readonly string[]>

const mapTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': [
      '{a} ha arribat a {p} amb {i} i un gran somriure.',
      'A {p}, {a} prepara {i} amb molta il·lusió.',
    ],
    'character-not-at-position': [
      '{a} vol explorar un altre racó; no és a {p}.',
      '{a} porta {i} a un altre lloc, no a {p}.',
    ],
    'character-in-place': [
      '{a} ajuda el grup a {p} i hi porta {i}.',
      'A {p}, {a} té {i} a punt per a l’aventura.',
    ],
    'character-not-in-place': [
      '{a} continua l’aventura en un altre lloc, no a {p}.',
      '{a} no prepara {i} a {p}.',
    ],
    'in-corner': ['{a} ha triat una cantonada tranquil·la per mirar {i}.'],
    'not-in-corner': ['{a} no ha triat cap cantonada per preparar {i}.'],
    'character-next-to-obstacle': ['A {p}, {a} prepara {i} al costat de {o}.'],
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
      '{a} saluda {b} des del lloc de l’esquerra.',
      '{a} prepara {i} a l’esquerra de {b}.',
    ],
    'right-of': [
      '{a} saluda {b} des del lloc de la dreta.',
      '{a} prepara {i} a la dreta de {b}.',
    ],
    above: ['{a} saluda {b} des del lloc de sobre.', '{a}, amb {i}, mira {b} des de sobre.'],
    below: ['{a} saluda {b} des del lloc de sota.', '{a}, amb {i}, mira {b} des de sota.'],
    distance: [
      '{a} camina {n} passos pel mapa per trobar {b}.',
      '{a} recorre {n} passos del mapa per trobar {b}.',
    ],
    between: [
      '{a} comparteix el camí entre {b} i {c}.',
      '{a} prepara {i} al mig de {b} i {c}.',
    ],
    'has-item': ['{a} ha triat {i} per a l’aventura.', '{a} porta {i} per compartir.'],
    'does-not-have-item': ['{a} porta una altra cosa, no {i}.', '{i} acompanya un altre amic.'],
    'item-in-place': ['{i} espera a {p}, a punt per començar.'],
    'item-not-in-place': ['{i} acompanya algú en un altre lloc, no a {p}.'],
    'same-floor': ['{a} i {b} col·laboren a la mateixa zona.'],
    'different-floor': ['{a} i {b} ajuden el grup des de zones diferents.'],
  },
  es: {
    'character-at-position': [
      '{a} ha llegado a {p} con {i} y una gran sonrisa.',
      'En {p}, {a} prepara {i} con mucha ilusión.',
    ],
    'character-not-at-position': [
      '{a} quiere explorar otro rincón; no está en {p}.',
      '{a} lleva {i} a otro lugar, no a {p}.',
    ],
    'character-in-place': [
      '{a} ayuda al grupo en {p} y lleva {i}.',
      'En {p}, {a} guarda {i} para la aventura.',
    ],
    'character-not-in-place': [
      '{a} sigue la aventura en otro lugar, no en {p}.',
      '{a} no prepara {i} en {p}.',
    ],
    'in-corner': ['{a} ha elegido un rincón tranquilo para mirar {i}.'],
    'not-in-corner': ['{a} no ha elegido ningún rincón para preparar {i}.'],
    'character-next-to-obstacle': ['En {p}, {a} prepara {i} junto a {o}.'],
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
      '{a} saluda a {b} desde el lugar de la izquierda.',
      '{a} prepara {i} a la izquierda de {b}.',
    ],
    'right-of': [
      '{a} saluda a {b} desde el lugar de la derecha.',
      '{a} prepara {i} a la derecha de {b}.',
    ],
    above: [
      '{a} saluda a {b} desde el lugar de arriba.',
      '{a}, con {i}, mira a {b} desde arriba.',
    ],
    below: [
      '{a} saluda a {b} desde el lugar de abajo.',
      '{a}, con {i}, mira a {b} desde abajo.',
    ],
    distance: [
      '{a} camina {n} pasos por el mapa para encontrar a {b}.',
      '{a} recorre {n} pasos del mapa para encontrar a {b}.',
    ],
    between: ['{a} comparte el camino entre {b} y {c}.', '{a} prepara {i} entre {b} y {c}.'],
    'has-item': ['{a} ha elegido {i} para la aventura.', '{a} lleva {i} para compartir.'],
    'does-not-have-item': ['{a} lleva otra cosa, no {i}.', '{i} acompaña a otro amigo.'],
    'item-in-place': ['{i} espera en {p}, a punto de empezar.'],
    'item-not-in-place': ['{i} acompaña a alguien en otro lugar, no en {p}.'],
    'same-floor': ['{a} y {b} colaboran en la misma zona.'],
    'different-floor': ['{a} y {b} ayudan al grupo desde zonas distintas.'],
  },
  en: {
    'character-at-position': [
      '{a} arrived at {p} with {i} and a big smile.',
      'At {p}, {a} prepares {i} with great excitement.',
    ],
    'character-not-at-position': [
      '{a} wants to explore another spot, not {p}.',
      '{a} takes {i} somewhere else, not {p}.',
    ],
    'character-in-place': [
      '{a} helps the group at {p} and brings {i}.',
      'At {p}, {a} has {i} ready for the adventure.',
    ],
    'character-not-in-place': [
      '{a} continues the adventure somewhere else, not {p}.',
      '{a} does not prepare {i} at {p}.',
    ],
    'in-corner': ['{a} chose a quiet corner to look at {i}.'],
    'not-in-corner': ['{a} did not choose a corner to prepare {i}.'],
    'character-next-to-obstacle': ['At {p}, {a} prepares {i} next to {o}.'],
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
      '{a} waves to {b} from the place on the left.',
      '{a} prepares {i} to the left of {b}.',
    ],
    'right-of': [
      '{a} waves to {b} from the place on the right.',
      '{a} prepares {i} to the right of {b}.',
    ],
    above: [
      '{a} waves to {b} from the place above.',
      '{a}, carrying {i}, looks at {b} from above.',
    ],
    below: [
      '{a} waves to {b} from the place below.',
      '{a}, carrying {i}, looks at {b} from below.',
    ],
    distance: [
      '{a} walks {n} map steps to find {b}.',
      '{a} travels {n} map steps to find {b}.',
    ],
    between: [
      '{a} shares the path between {b} and {c}.',
      '{a} prepares {i} between {b} and {c}.',
    ],
    'has-item': ['{a} chose {i} for the adventure.', '{a} brings {i} to share.'],
    'does-not-have-item': ['{a} brings something else, not {i}.', '{i} joins another friend.'],
    'item-in-place': ['{i} waits at {p}, ready to begin.'],
    'item-not-in-place': ['{i} joins someone somewhere else, not {p}.'],
    'same-floor': ['{a} and {b} work together in the same zone.'],
    'different-floor': ['{a} and {b} help the group from different zones.'],
  },
}

const gridTemplates: Record<Locale, Templates> = {
  ca: {
    'character-at-position': [
      'A {a} li agrada molt participar. A la zona «{p}», és a la casella {d} del marcador {o} i porta {i}.',
      '{a} ha arribat amb moltes ganes a la zona «{p}». És a la casella {d} del marcador {o} i porta {i}.',
      '{a} ajuda a preparar la zona «{p}». La seva casella és {d} del marcador {o}, i hi porta {i}.',
    ],
    'character-not-at-position': [
      '{a} prefereix donar un cop de mà en un altre espai: no és a la casella {d} del marcador {o}, a «{p}».',
    ],
    'character-in-place': [
      '{a} entra per la porta de «{p}» amb {i} i saluda tothom.',
      '{a} se sent a gust a «{p}» i hi porta {i}.',
    ],
    'character-not-in-place': ['{a} prefereix ajudar en un altre espai, no a «{p}».'],
    'in-corner': ['{a}, amb {i}, prepara una cantonada lluminosa de l’espai.'],
    'not-in-corner': ['{a}, amb {i}, treballa lluny de les cantonades.'],
    'character-next-to-obstacle': [
      '{a} prepara amb il·lusió la zona «{p}», al costat de {o}, i hi porta {i}.',
      'A «{p}», {a} dona un cop de mà al costat de {o} i porta {i}.',
      '{a} té cura de «{p}» des d’un espai al costat de {o}, amb {i}.',
    ],
    adjacent: ['{a} i {b} preparen junts dos espais veïns.'],
    'not-adjacent': ['{a} i {b} col·laboren en espais que no són veïns.'],
    'same-row': ['{a} i {b} ajuden des de la mateixa franja del plànol.'],
    'different-row': ['{a} i {b} ajuden des de franges diferents del plànol.'],
    'same-column': ['{a} i {b} col·laboren dins la mateixa zona.'],
    'different-column': ['{a} i {b} col·laboren en zones diferents.'],
    'left-of': ["{a}, amb {i}, ajuda en un espai a l'esquerra de {b}."],
    'right-of': ['{a}, amb {i}, ajuda en un espai a la dreta de {b}.'],
    above: ['{a}, amb {i}, prepara un espai per damunt de {b}.'],
    below: ['{a}, amb {i}, prepara un espai per sota de {b}.'],
    distance: ['{a} i {b} col·laboren amb la separació indicada al plànol.'],
    between: ['{a}, amb {i}, ajuda des d’un espai entre {b} i {c}.'],
    'has-item': ['{a} porta {i}.'],
    'does-not-have-item': ['{i} no acompanya {a}.'],
    'item-in-place': ['A «{p}» tenen preparat {i} per a l’activitat.'],
    'item-not-in-place': ['A «{p}» han triat una altra cosa, no {i}.'],
    'same-floor': ['{a} i {b} comparteixen la mateixa zona.'],
    'different-floor': ['{a} i {b} preparen zones diferents.'],
  },
  es: {
    'character-at-position': [
      'A {a} le hace ilusión participar. En la zona «{p}», está en la casilla {d} del marcador {o} y lleva {i}.',
      '{a} ha llegado con muchas ganas a la zona «{p}». Está en la casilla {d} del marcador {o} y lleva {i}.',
      '{a} ayuda a preparar la zona «{p}». Su casilla está {d} del marcador {o} y lleva {i}.',
    ],
    'character-not-at-position': [
      '{a} prefiere colaborar en otro espacio: no está en la casilla {d} del marcador {o}, en «{p}».',
    ],
    'character-in-place': [
      '{a} entra por la puerta de «{p}» con {i} y saluda a todos.',
      '{a} se siente a gusto en «{p}» y lleva {i}.',
    ],
    'character-not-in-place': ['{a} prefiere ayudar en otro espacio, no en «{p}».'],
    'in-corner': ['{a}, con {i}, prepara un rincón luminoso del espacio.'],
    'not-in-corner': ['{a}, con {i}, trabaja lejos de los rincones.'],
    'character-next-to-obstacle': [
      '{a} prepara con ilusión la zona «{p}», junto a {o}, y lleva {i}.',
      'En «{p}», {a} echa una mano junto a {o} y lleva {i}.',
      '{a} cuida de «{p}» desde un espacio junto a {o}, con {i}.',
    ],
    adjacent: ['{a} y {b} preparan juntos dos espacios vecinos.'],
    'not-adjacent': ['{a} y {b} colaboran en espacios que no son vecinos.'],
    'same-row': ['{a} y {b} ayudan desde la misma franja del plano.'],
    'different-row': ['{a} y {b} ayudan desde franjas distintas del plano.'],
    'same-column': ['{a} y {b} colaboran dentro de la misma zona.'],
    'different-column': ['{a} y {b} colaboran en zonas distintas.'],
    'left-of': ['{a}, con {i}, ayuda en un espacio a la izquierda de {b}.'],
    'right-of': ['{a}, con {i}, ayuda en un espacio a la derecha de {b}.'],
    above: ['{a}, con {i}, prepara un espacio por encima de {b}.'],
    below: ['{a}, con {i}, prepara un espacio por debajo de {b}.'],
    distance: ['{a} y {b} colaboran con la separación indicada en el plano.'],
    between: ['{a}, con {i}, ayuda desde un espacio entre {b} y {c}.'],
    'has-item': ['{a} lleva {i}.'],
    'does-not-have-item': ['{i} no acompaña a {a}.'],
    'item-in-place': ['En «{p}» tienen preparado {i} para la actividad.'],
    'item-not-in-place': ['En «{p}» han elegido otra cosa, no {i}.'],
    'same-floor': ['{a} y {b} comparten la misma zona.'],
    'different-floor': ['{a} y {b} preparan zonas distintas.'],
  },
  en: {
    'character-at-position': [
      '{a} is excited to join in. In the “{p}” zone, they are in the cell {d} the {o} marker and carry {i}.',
      '{a} has arrived ready to help in the “{p}” zone. Their cell is {d} the {o} marker, and they carry {i}.',
      '{a} is helping prepare the “{p}” zone. Their cell is {d} the {o} marker, and they carry {i}.',
    ],
    'character-not-at-position': [
      '{a} would rather help elsewhere and is not in the cell {d} the {o} marker in “{p}”.',
    ],
    'character-in-place': [
      '{a} comes through the door of “{p}” with {i} and greets everyone.',
      '{a} feels at home in “{p}” and carries {i}.',
    ],
    'character-not-in-place': ['{a} would rather help elsewhere, not in “{p}”.'],
    'in-corner': ['{a}, with {i}, prepares a bright corner of the space.'],
    'not-in-corner': ['{a}, with {i}, works away from the corners.'],
    'character-next-to-obstacle': [
      '{a} is excited to prepare “{p}” beside {o}, carrying {i}.',
      'In “{p}”, {a} lends a hand beside {o} and carries {i}.',
      '{a} looks after “{p}” from a space beside {o}, with {i}.',
    ],
    adjacent: ['{a} and {b} prepare two neighboring spaces together.'],
    'not-adjacent': ['{a} and {b} help in spaces that are not neighbors.'],
    'same-row': ['{a} and {b} help from the same strip of the plan.'],
    'different-row': ['{a} and {b} help from different strips of the plan.'],
    'same-column': ['{a} and {b} work together in the same zone.'],
    'different-column': ['{a} and {b} work together in different zones.'],
    'left-of': ['{a}, with {i}, helps in a space left of {b}.'],
    'right-of': ['{a}, with {i}, helps in a space right of {b}.'],
    above: ['{a}, with {i}, prepares a space above {b}.'],
    below: ['{a}, with {i}, prepares a space below {b}.'],
    distance: ['{a} and {b} help with the separation marked on the plan.'],
    between: ['{a}, with {i}, helps from a space between {b} and {c}.'],
    'has-item': ['{a} carries {i}.'],
    'does-not-have-item': ['{i} is not with {a}.'],
    'item-in-place': ['The activity in “{p}” has {i} ready.'],
    'item-not-in-place': ['The team in “{p}” chose something else, not {i}.'],
    'same-floor': ['{a} and {b} share the same zone.'],
    'different-floor': ['{a} and {b} prepare different zones.'],
  },
}

const cubeTemplates: Record<Locale, Templates> = {
  ca: {
    ...gridTemplates.ca,
    'character-at-position': [
      '{a} viu a «{p}» i sempre hi té {i} a punt per compartir.',
      '{a} fa comunitat a «{p}» i hi guarda {i}.',
    ],
    'character-not-at-position': ['{a} viu en una altra llar, no a «{p}».'],
    'character-in-place': ['La porta de {a} s’obre a «{p}», on sempre saluda el veïnat.'],
    'character-not-in-place': ['{a} viu en una altra zona de l’edifici, no a «{p}».'],
    'in-corner': ['La llar de {a} fa cantonada i rep llum per dos costats.'],
    'not-in-corner': ['La llar de {a} no fa cantonada; té veïns als dos costats.'],
    'has-item': ['{a} té cura de {i} a casa.'],
    'does-not-have-item': ['{a} té un altre objecte preferit, no {i}.'],
    adjacent: ['{a} i {b} obren portes veïnes al mateix replà.'],
    'not-adjacent': ['Les portes de {a} i {b} no són veïnes.'],
    above: ['{a} viu al pis de sobre de {b}, a la mateixa ala.'],
    below: ['{a} viu al pis de sota de {b}, a la mateixa ala.'],
    'same-floor': ['{a} i {b} comparteixen replà i sempre es saluden.'],
    'different-floor': ['{a} i {b} viuen en pisos diferents i es troben a l’entrada.'],
  },
  es: {
    ...gridTemplates.es,
    'character-at-position': [
      '{a} vive en «{p}» y siempre tiene {i} listo para compartir.',
      '{a} hace comunidad en «{p}» y guarda allí {i}.',
    ],
    'character-not-at-position': ['{a} vive en otro hogar, no en «{p}».'],
    'character-in-place': [
      'La puerta de {a} se abre en «{p}», donde siempre saluda al vecindario.',
    ],
    'character-not-in-place': ['{a} vive en otra zona del edificio, no en «{p}».'],
    'in-corner': ['El hogar de {a} hace esquina y recibe luz por dos lados.'],
    'not-in-corner': ['El hogar de {a} no hace esquina; tiene vecinos a ambos lados.'],
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
      '{a} lives in “{p}” and keeps {i} ready to share.',
      '{a} builds community in “{p}” and keeps {i} there.',
    ],
    'character-not-at-position': ['{a} lives in another home, not in “{p}”.'],
    'character-in-place': [
      "{a}'s door opens into “{p}”, where they always greet the neighbors.",
    ],
    'character-not-in-place': ['{a} lives elsewhere in the building, not in “{p}”.'],
    'in-corner': ["{a}'s home is on a corner and gets light from two sides."],
    'not-in-corner': ["{a}'s home is not on a corner and has neighbors on both sides."],
    'has-item': ['{a} looks after {i} at home.'],
    'does-not-have-item': ['{a} has another favorite object, not {i}.'],
    adjacent: ['{a} and {b} open neighboring doors on the same landing.'],
    'not-adjacent': ["{a} and {b}'s doors are not neighbors."],
    above: ['{a} lives one floor above {b}, in the same wing.'],
    below: ['{a} lives one floor below {b}, in the same wing.'],
    'same-floor': ['{a} and {b} share a landing and always say hello.'],
    'different-floor': ['{a} and {b} live on different floors and meet by the entrance.'],
  },
}

const cubeShopTemplates: Record<Locale, Templates> = {
  ca: {
    ...cubeTemplates.ca,
    'character-at-position': [
      '{a} obre «{p}» cada matí i prepara {i} per rebre el barri.',
      'A «{p}», {a} atén el veïnat i té {i} a punt.',
    ],
    'character-not-at-position': ['{a} obre una altra botiga, no «{p}».'],
    'character-in-place': ['{a} prepara l’aparador de «{p}» abans d’obrir.'],
    'character-not-in-place': ['{a} treballa en una altra botiga de l’edifici, no «{p}».'],
    'has-item': ['{a} prepara {i} per a l’aparador de la botiga.'],
    'does-not-have-item': ['Avui, {a} mostra un altre objecte a l’aparador, no {i}.'],
    adjacent: ['{a} i {b} atenen dos espais veïns i es donen un cop de mà.'],
    'not-adjacent': ['{a} i {b} col·laboren, però els seus espais no tenen portes veïnes.'],
    'same-floor': ['{a} i {b} obren les dues botigues de la planta baixa i s’ajuden.'],
    'different-floor': [
      'Una de les dues persones treballa a la planta baixa; {a} i {b} es troben a l’entrada.',
    ],
  },
  es: {
    ...cubeTemplates.es,
    'character-at-position': [
      '{a} abre «{p}» cada mañana y prepara {i} para recibir al barrio.',
      'En «{p}», {a} atiende al vecindario y tiene {i} a punto.',
    ],
    'character-not-at-position': ['{a} abre otra tienda, no «{p}».'],
    'character-in-place': ['{a} prepara el escaparate de «{p}» antes de abrir.'],
    'character-not-in-place': ['{a} trabaja en otra tienda del edificio, no en «{p}».'],
    'has-item': ['{a} prepara {i} para el escaparate de la tienda.'],
    'does-not-have-item': ['Hoy, {a} muestra otro objeto en el escaparate, no {i}.'],
    adjacent: ['{a} y {b} atienden dos espacios vecinos y se ayudan.'],
    'not-adjacent': ['{a} y {b} colaboran, pero sus espacios no tienen puertas vecinas.'],
    'same-floor': ['{a} y {b} abren las dos tiendas de la planta baja y se ayudan.'],
    'different-floor': [
      'Una de las dos personas trabaja en la planta baja; {a} y {b} se encuentran en la entrada.',
    ],
  },
  en: {
    ...cubeTemplates.en,
    'character-at-position': [
      '{a} opens “{p}” each morning and prepares {i} to welcome the neighborhood.',
      'At “{p}”, {a} helps customers and keeps {i} ready.',
    ],
    'character-not-at-position': ['{a} opens another shop, not “{p}”.'],
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
      'One of them works on the ground floor; {a} and {b} meet by the entrance.',
    ],
  },
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

const valueOrFallback = <Id extends string>(
  values: readonly { readonly id: Id; readonly name?: string; readonly label?: string }[],
  id: Id,
) =>
  values.find((value) => value.id === id)?.name ??
  values.find((value) => value.id === id)?.label ??
  'here'

const placeLabel = (puzzle: Puzzle, placeId: PlaceId, locale: Locale) => {
  const position = puzzle.positions.find((candidate) => candidate.placeId === placeId)
  return position
    ? position.buildingUnitId !== undefined && position.layer !== undefined
      ? buildingUnitLabel(locale, position.buildingUnitId, position.layer)
      : localizeThemeLabel(locale, puzzle.theme, gridPlaceLabel(position.label))
    : { ca: 'aquí', es: 'aquí', en: 'here' }[locale]
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
  const characterName = (id: CharacterId) => valueOrFallback(puzzle.characters, id)
  const positionFor = (id: PositionId) =>
    puzzle.positions.find((position) => position.id === id)
  const itemValue = (id: ItemId): ClueValue => {
    const item = puzzle.items.find((candidate) => candidate.id === id)
    return item
      ? {
          text: localizeThemeLabel(locale, puzzle.theme, item.label),
          emoji: item.emoji,
        }
      : textValue('object')
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
    return character?.itemId ? itemValue(character.itemId) : textValue('object')
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
      values.p = textValue(position ? localizedPlace(position) : 'here')
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
      const near = { ca: 'prop de', es: 'junto a', en: 'near' } as const
      values.d = textValue(
        position && obstacle ? landmarkDirection(position, obstacle, locale) : near[locale],
      )
      values.o = obstacle ? obstacleValue(obstacle, values.p.text) : values.p
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
      values.p = textValue(obstacle ? localizedPlace(obstacle) : 'here')
      values.o = obstacle ? obstacleValue(obstacle, values.p.text) : values.p
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
    if (index > cursor) parts.push({ type: 'text', text: template.slice(cursor, index) })
    const key = match[1] ?? ''
    const value = values[key] ?? textValue(key)
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
