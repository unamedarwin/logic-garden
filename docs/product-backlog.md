# Product backlog

## Navigation path: implemented

- The upper journey path now moves among collection, board size, difficulty, and adventure. Each
  setup screen shows only its own decision. Adventure is a real horizontal theme picker and play
  starts only from that fourth step. The theme choice is converted to a normally replayable seeded
  puzzle, so shared links need no answer or extra theme payload. Returning to a
  picker suspends rather than clears the current puzzle, placements, timer, and challenge; moving
  forward resumes the same state.
- Every collection now has an explicit persisted and shared size choice: 4/6/8 friends for
  Illustrated Adventures, `6 x 6`/`9 x 9`/`16 x 16` for Puzzles 2D, and 3-10 floors for Puzzles 3D. New
  installs default to four friends, `6 x 6`, and three floors; every `16 x 16` template uses
  eight people.
- Direction controls expose disabled endpoints, step buttons use `aria-current`, every target is
  at least 44 pixels, future steps cannot skip required setup decisions, and interface tests cover
  both the one-decision-per-step flow and placement restoration.
- Child easy, medium, and hard modes now differ deductively at the same 4/6/8 size: easy protects
  direct friendly clues for most friends, medium protects fewer, and hard prioritizes relations.
- The public child-facing label is now the age-neutral `Illustrated Adventures` equivalent in every
  locale. Three premises per theme combine with six deterministic mystery incidents, four
  objectives, four endings, and four clue-derived character roles. Every rendered fragment retains
  one structured source clue. Automated samples enforce at least 80 complete signatures per 100
  seeds and theme, all three premises, at least 17 of 18 opening combinations, normalized incident
  entropy of 0.95, normalized premise entropy of 0.90, and strict share caps. Eligible audience
  validation remains open under [`content-quality-rubric.md`](content-quality-rubric.md).
- On narrow setup screens the journey path is sticky below the safe area and above the scrolling
  decision. The first-arrival browser journey scrolls the first selector and checks that the active
  step, previous/next controls, and full path remain in the viewport without horizontal overflow.

## Deduction grading: implemented

- The framework-independent deduction trace measures initial candidate domains, forced placements,
  branching pressure, clue interpretation load, and the longest reconstructed chain. It never reads
  or persists a stored answer; after forced moves end, evidence generation may follow only the
  solution already verified unique with a two-solution limit.
- Runtime guidance now produces ordered pressure at every advanced size and height. Automated
  matrices cover both internal audiences, all `6 x 6`, `9 x 9`, and `16 x 16` boards, and every
  building height from 3 through 10. Child 4/6/8 modes retain a locally forced first deduction while
  easy, medium, and hard vary the later chain.
- Player calibration remains separate: automated traces prove structural ordering, not perceived
  difficulty or enjoyment.

## Advanced three-dimensional puzzles: published foundation

- The published model now ranges from `5 x 5 x 3` through `5 x 5 x 10`, with one accessible floor
  slice at a time, `4(d-1)` semantic homes, two shops, `14(d-1) + 10` playable room cells, eight
  people, and crossing on horizontal, vertical, and adjacent-height axes.
- The answer-free catalog reserves 16 hard building templates, one per internal audience and height.
  Each stores separate generic clue tuples for cell mode and room mode. Runtime materialization is
  still checked with a two-solution limit, and height is selected uniformly before a template so the
  unequal per-height quotas do not bias play.
- The level step is now real for every height: easy ensures direct home or landmark guidance for at
  least six people, medium ensures it for at least three, and hard uses the unassisted structural
  clue set. Existing direct facts count toward those targets instead of being repeated. Every
  guided result is rerun through the solver with a two-solution limit and shares its selected level
  normally.
- A real-user report identified excessive perceived difficulty before 3D play. The entry presentation
  now recommends three floors, illustrates three floors, and describes one-floor-at-a-time play.
  This remains open for anonymous first-time validation under `docs/content-quality-rubric.md`;
  implementation alone does not close the evidence gap.
- The elevator, deterministic furniture and plants, local SVG rendering, shopkeeper clues, and
  blocked-cell semantics are implemented. Keep expanding building-specific social clue combinations
  only after the published mobile interaction checks remain stable. See `docs/building-system.md`.

## Room-based 3D entry mode: implemented

- A whole-room placement mode is the recommended explicit setup choice rather than a hidden Easy
  rule. It keeps the current visual `5 x 5 x d` building but exposes one semantic target
  per home or shop, hides only the cell-grid interaction layer, and removes cross-room row and column
  conflicts. The existing walls, doors, materials, furniture, elevator, labels, and avatars are
  reused.
- The solver, reducer, evaluator, hints, persistence, and DOM share the same pure canonical target
  selector. The 48 audience/height/difficulty combinations remain uniquely solvable with ordered
  deduction pressure; wrong room hypotheses persist until an explicit hint changes one. The
  compatible advanced cell mode remains available. Details and regression gates are in
  `docs/room-based-building-proposal.md`.

## Catalog verification: implemented

- Scheduled verification materializes all 100 answer-free structures and independently checks a
  second matrix of all 288 public theme, difficulty, and selected-dimension combinations.
- Every case reruns uniqueness with a two-solution limit, reconstructs a complete satisfying
  assignment from the deduction trace, and composes every clue in Catalan without empty
  tokens or unresolved placeholders. The exhaustive test is retained in the normal release suite;
  it currently completes in about two minutes inside the frozen Docker image.
- V8 coverage runs serially and excludes only this exhaustive corpus file because it repeats already
  instrumented branches hundreds of times. The release `verify` command still runs the corpus in
  full, while coverage retains its independent statement, branch, function, and line thresholds.

## Touch gestures: implemented

- A mobile report found that page scrolling and zoom gestures could trap the app after dragging
  the screen downward and then attempting to zoom the board. The board now owns a dedicated gesture
  controller: two-finger pinch zoom is captured only on the board surface, one-finger page scrolling
  remains normal outside the board, and returning to fitted mode clears internal pan offsets.
- Regression tests dispatch a two-finger board gesture, verify that the native pinch is cancelled
  on the board, confirm the zoom reaches 150%, and assert that the `Encaixa` action restores fit
  mode and zeroes board scroll.
- Tablet orientation regression is now covered in Playwright for portrait and landscape viewports:
  the suite fits and centers placements on a `16 x 16` 2D board and a 10-floor 3D building without
  horizontal document overflow.
- The contextual clue rail no longer performs vertical page corrections when the selected person
  changes or when a clue card is paged horizontally. It may center content only inside its own
  horizontal rails. Unit tests reject `window.scrollBy` from the rail, and the iPhone 16e E2E check
  asserts that selecting another rail person does not move `window.scrollY`.
- Open follow-up before the next release: the focused iPhone 16e Playwright run confirmed that
  removing the vertical auto-scroll avoids the jump, but the selected person's contextual clue can
  still sit too close to, or partly under, the fixed action rail. Fix this with CSS layout reserve
  or scroll margin around the lower workspace, not by reintroducing JavaScript `window.scrollBy`
  corrections from the clue rail.

## Local competitive mode: P2P QR baseline

- Implemented network shape: the PWA does not start a server, relay, websocket listener, LAN
  discovery process, Bluetooth exchange, or NFC exchange. Nearby devices pair explicitly with a
  QR/copy/share flow carrying a compressed WebRTC offer and answer. Once paired, game events travel
  through a direct WebRTC DataChannel.
- Pairing flow: the master creates a lobby and shows an offer QR. A participant scans or pastes it,
  creates an answer QR, and the master scans or pastes that answer. The same codes can be copied or
  sent through the device share sheet for AirDrop, messages, or another local sharing path.
- Privacy model: signaling QR codes contain only WebRTC session descriptions, local lobby ids, and
  temporary display profiles. Rounds send reproducible puzzle metadata: collection, size, difficulty,
  seed, generator version, variant, building placement, and selected safe theme id. They never send a
  solution, answer map, saved solo history, token, geolocation, or tracking identifier.
- Session model: the master chooses the current setup and starts each round. Every connected device
  generates the same puzzle locally and validates completion locally. Finishing a round sends only
  participant id, round id, elapsed time, moves, hints used, and finish timestamp.
- Round flow: all connected players solve the same puzzle. The standings panel keeps cumulative
  time and solved-round count. A round is considered complete when every connected lobby member,
  including the master, has submitted a finish result; the master can then start the next round.
- Compatibility limits: this is intended for nearby devices and works best on the same Wi-Fi. With
  no STUN/TURN server and no relay, restrictive routers or client-isolated networks can prevent
  direct connection. The UI keeps copy/paste as a fallback when camera scanning is unavailable.
- Open hardening: add a two-browser Playwright flow with mocked camera/QR input, reconnection
  behavior, participant removal when someone leaves, and a compact mobile lobby layout review before
  treating group play as release-polished.
