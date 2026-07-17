# Joc en grup: model d'estat visible

El joc en grup manté una sala WebRTC local mentre la PWA continua oberta. L'emparellament és una
acció temporal dins d'aquesta sala, no l'estat de tota la sala. Tancar un diàleg no desconnecta mai.

## Autoritat

- El **creador** és l'únic dispositiu que pot triar col·lecció, mode, mida, dificultat i aventura,
  afegir participants i iniciar la ronda.
- Un **participant** veu la selecció compartida pel creador, però no pot modificar-la ni iniciar una
  partida. Pot tancar el diàleg, esperar la ronda o desconnectar-se.
- Tots els dispositius veuen la mateixa llista de participants, el paper de cadascú, la ronda activa
  i els resultats acumulats.

## Estats i pantalles

| Estat            | Accés principal | Diàleg de sala                                               | Capçalera de partida                                   |
| ---------------- | --------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| Sense sala       | `Joc en grup`   | Crear sala o unir-s'hi                                       | No es mostra estat de grup                             |
| Emparellant      | `Connectant...` | QR pendent i acció `Cancel·lar l'emparellament`              | Manté el recompte de la sala si ja hi havia connexions |
| Sala connectada  | `Connectat · N` | Participants, papers i selecció del creador                  | `Connectat · N` obre la mateixa sala                   |
| Ronda activa     | `Connectat · N` | Ronda actual; no es pot afegir ningú ni iniciar-ne una altra | `Connectat · N` a tots els puzzles                     |
| Ronda acabada    | `Connectat · N` | Qui ha acabat i qui continua; el creador prepara la següent  | `Connectat · N` fins que es deixa la sala              |
| Connexió perduda | `Joc en grup`   | Motiu i opció de tornar a emparellar                         | Desapareix l'estat connectat                           |

## Accions destructives

- El creador disposa de `Tancar la sala`; avisa la resta i requereix confirmació.
- Els participants disposen de `Desconnectar-me`; requereix confirmació.
- Durant un QR pendent, `Cancel·lar l'emparellament` cancel·la només la invitació nova quan la sala
  ja té altres connexions. No expulsa els participants existents.
- Recarregar o tancar la PWA elimina els canals WebRTC. Sense un servei de senyalització o relay no
  es poden restaurar; la interfície no ha de fingir que la sala continua connectada.

## Criteris de concordança

1. `Connectat` només apareix després de l'esdeveniment `RTCDataChannel.open`, mai després de generar
   una oferta o una resposta.
2. El recompte inclou el dispositiu local i només els canals remots oberts.
3. Afegir una tercera persona no amaga ni degrada les dues connexions ja actives.
4. El creador comparteix una selecció estructurada, sense solució ni dades personals, abans de
   començar. Els participants la veuen com a només lectura.
5. Cada canvi de participants o selecció es replica a tots els canals oberts.
6. Cap botó de navegació, tancament de modal o canvi de pas pot desconnectar una sala.
