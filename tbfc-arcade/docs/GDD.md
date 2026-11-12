# Turf Burners FC Arcade Soccer

**Game design and implementation brief · v1.5 · November 2026**  
**Destination** `/Users/cosmopro/Sites/tbfc-arcade/docs/GDD.md` · **First assignment** Character design and sprites · **First playable** TBFC Practice Mode

Build a match that feels good in the first five seconds. From kickoff, a thumb on the stick and a tap on Pass should send the ball to a teammate already moving into space. A shot should have a readable windup, an unmistakable impact, and a keeper the player can see react. The fun comes from quick decisions, expressive players, and exaggerated feedback. Mega Man Soccer is the feel reference. Use original sprites, sounds, effects, and code.

## 1. First playable · Practice Mode

Open Practice, select one to seven players from the TBFC roster, and enter a free-play pitch. Show the selected count out of seven. Enable Start at one selection. At seven, disable unselected players until someone is deselected. Spawn everyone selected on the pitch with one ball. Use the milestone 1 sprite atlas and visible names. Use its generic base for unconfirmed likenesses.

- **Solo.** Dribble, sprint, kick into space, shoot and chase down the ball. Reset Ball returns it to the controlled player's feet. An out-of-bounds ball resets automatically.
- **Two or more.** Off-ball teammates spread out and offer passing angles. Turn toward an outlet and tap Pass to choose and lead a teammate automatically. Try a give-and-go with two players, a passing triangle with three, then repeat with seven players.
- **Session.** Keep practicing until the player exits. Pause offers Resume, Reset Ball and Change Players. There are no required positions, opponent, bench, clock or score. Keep free play available alongside the finishing drill below. Cones remain an optional experiment.
- **Iteration priority.** First tune movement and stopping, then pass targeting and receiving, then shooting and camera tracking. Play the same drill after each change. Ship a runnable browser build for hands-on feedback before expanding scope.

### Practice teammate movement · first playtest

Use a passing triangle as the basic drill. The carrier should be able to look up, see two different passes, and trust that both teammates will still be there when they tap Pass. Distances and timings below are starting values to tune on the actual pitch.

| Players selected | Off-ball behavior |
| --- | --- |
| 1 | The human can carry, shoot and retrieve the ball freely. |
| 2 | The partner jogs into view about 6–9 m away, diagonally ahead or alongside. Once there, they face the ball and wait. After passing, the former carrier continues a few strides into space and shows for the return pass. |
| 3 | One teammate offers the short diagonal. The other takes a wider angle on the opposite side, about 9–13 m away, roughly level with or slightly behind the carrier. This creates three distinct passing lanes and an easy backward option. |
| 4–7 | Keep the two close outlets. A third teammate can make a short forward run when the carrier advances. Others occupy staggered positions across the pitch, keeping enough width and depth to receive the ball as play reaches them. Only nearby players rotate into support roles. |

**When to move.** Orient the triangle to the carrier's recent travel direction, using their initial facing at rest. A small aim adjustment should let the human pick a pass without rearranging the outlets. Hold each outlet while its lane is usable. Reposition when the carrier travels roughly 3 m, commits to a new direction, or a teammate blocks the lane. Near a touchline, offer one pass along the line and one back inside. Choose reachable spots within bounds and favor keeping teammates on their current sides so they seldom cross paths.

**Pass and move.** As soon as A passes to B, the human controls B and A automatically runs a few strides into open space at an angle where B can play the ball back. Start the run while the ball is traveling. If the forward lane is crowded or runs out of pitch, A peels wide or back inside. If B holds the ball, A settles into the outlet and faces B. A return pass uses the normal targeting and interception rules. If B passes elsewhere, A rejoins the support shape. On a loose ball, keep one human-controlled retriever.

**First Practice drill · two-player give-and-go.** Pass from A to B while jogging upfield. Aim into A's run and tap Pass again once B has the ball. A should receive in stride, with B already moving to offer the next pass. Repeat for three passes without a manual player change or a pause to wait for the runner. With three, stand still and aim at each outlet in turn: both should hold position. Dribble toward the touchline and pass back inside, then repeat with seven players. Watch for teammates bunching around the ball, hiding behind each other, or swapping sides while the player aims. Tune spacing and movement triggers before adding drills.

### Practice shooting · give-and-go finish

Once the passing drill feels good, add **Target Practice** to the same pitch. Keep the selected squad. Start the ball carrier about 12 m from an empty goal. With a partner, play the diagonal pass, run into space, take the return in stride, and shoot. A solo player can start with a dribble and shoot directly.

**First target layout.** Try three fixed, high-contrast targets inside the goal mouth: one low just inside each post and one higher in the middle. Give each a bold rim and an opening about two ball-widths across as a starting point. Keep them visible from the normal camera on a landscape phone. Fixed positions let the player repeat the same approach and adjust one thing at a time.

**Aim and contact.** Use the regular Shoot action and ball physics. Aim across the goal with the movement control and tap Shoot for a low finish. Hold briefly and release for more pace and lift toward the high target. The shot goes where the player aims. On the ball's first crossing of the goal plane after a shot, check its horizontal position and height against the target faces. A hit makes the target wobble and ring once. A goal between targets still rustles the net. A shot off the post stays live for a rebound.

**Try again.** After a goal or a shot out of play, briefly show where the ball finished, then restore the starting ball carrier, support positions and targets together. Keep the drill untimed. Test a low finish to each side, a lifted finish, a goal between targets, and a miss. Repeat the give-and-go from the same start on touch: can you tell whether to change your angle or your charge on the next shot?

### Following releases

The first match is a separate playtest build: TBFC with team sprites against one generic test opponent. Use it to tune a complete 7v7 exhibition from kickoff through the result screen. Only after match playtests and refinement, expand to the named clubs and eight-week season below. Same-team couch co-op is the first expansion after the single-player season. Native packaging and a standalone knockout tournament remain later options.

### Menus and pre-match setup

Use the [original menu sketch](menu-sketch.png) as the layout reference.

| Screen | Layout and behavior |
| --- | --- |
| Title | Center the TBFC Arcade wordmark above **Practice**. Add menu entries as their modes ship: **New Match**, **New Season**, and **Settings**. A small flame marks the focused choice. When a season save exists, offer Resume Season and confirm before replacing it. |
| Select Opponent | In exhibition, show the human club crest on the left, VS in the middle, and the opponent crest between two arrows on the right. Show names beneath both crests. Default to TBFC and let the player change their club. Cycle through the seven eligible opponents. In season play, show the scheduled matchup with the opponent locked. |
| Set Lineup | Show the roster on the left, the pitch on the right, and tappable formation thumbnails along the bottom. Tap a thumbnail to immediately rearrange the seven pitch markers and highlight the chosen formation. Then tap a spot on the pitch and choose its player from the roster. Repeat for any spot and confirm to use that shape and lineup at kickoff. |

Changing shape keeps the current seven selected and the keeper in goal. Choosing a player who already occupies another spot swaps the two if both are eligible. Choosing a reserve sends the previous occupant to the bench. Start with a complete default seven so the player can keep any assignments they like. Use the confirmed formation coordinates as the team's tactical positions in the match.

### New Season · eight-week league and playoff gauntlet

Pick a club and show its route as a vertical arcade ladder of opponent crests. Highlight this week's matchup, stamp completed rungs with scores, and leave future playoff opponents TBD until qualification. Keep the ladder tied to the fixture list and put the standings one action away.

| Weeks | Fixtures | Advance |
| --- | --- | --- |
| 1–6 · Regular season | Eight clubs play one match each week. Play the human fixture and simulate the other three. Each club faces six distinct rivals. | Update the table after all four results. After week six, lock the seeds and qualify positions 1–4. |
| 7 · Semifinals | Seed 1 plays 4 and seed 2 plays 3. Play the human semifinal if qualified and simulate the other fixtures. | The two winners reach the final. |
| 8 · Final | Play the final if the human club advanced, otherwise simulate it. | Show the champion, playoff scores, and the human club's finish. |

**Schedule.** Six regular games leave one of the seven rivals unscheduled for each club. Generate a seeded single round robin, omit one whole round, and assign three home and three away games per club. Playoff pairings follow the seeds and can produce rematches. A regular-season loss advances the week. A player who misses the cut or loses a semifinal can advance through the remaining results as a spectator.

**Weekly results.** After the final whistle show every fixture's score and highlight the human club's row in the updated table. Show rank, club, played, wins, draws, losses, goals for/against, goal difference and points. Mark the fourth-place cutoff and show movement since last week (first week has no prior rank). Proposed arcade league rules award 3 points for a win, 1 for a draw, 0 for a loss. Break ties by goal difference, then goals scored, then a seeded preseason draw order visible under Table Rules. Playoff results leave regular-season standings intact.

**CPU fixtures and saves.** For unplayed fixtures use a lightweight seeded score generator with chances weighted by arcade attack and keeping ratings. Allow draws in league play. Proposed playoff tiebreaker: a level score after 50 minutes goes directly to alternating penalties, best of five with early clinch, then paired sudden death. Let the human aim and shoot for their club and choose the human keeper’s dive direction against CPU kicks. Simulate CPU shootouts under the same outcome rules. Store shootout scores separately. Save the season seed, player club, versioned schedule and committed results together after each week. Derive standings and bracket from those results. Reloading a completed week must preserve scores and qualification.

## 2. Club content and source of truth

The companion app is at `/Users/cosmopro/Sites/tbfc/`. Build the game in the existing repository at `/Users/cosmopro/Sites/tbfc-arcade/`. At implementation time, snapshot only the needed files into the game and record each source path and companion commit in a small content manifest. The deployed game must work with the companion checkout absent.

| Club | Crest found under companion `public/crests/` |
| --- | --- |
| Turf Burners FC | `tbfc.png` |
| Whiff City FC | `whiff-city-fc.png` |
| One Kick Wonders | TBD |
| Peach Passers | `peach-passers.png` |
| Orange Slices | TBD |
| Chippington Towne | TBD |
| Peachy Puffs | `peachy-puffs.png` |
| Goal Dancers FC | `goal-dancers-fc-v2.png` |

- **Roster.** `src/data/seedPlayers.ts` contains 16 seeded TBFC names, shirt numbers, and IDs. Preserve spelling, accents, and numbers as strings. Seed position fields are empty. Treat the seed as a dated snapshot. Keep real positions and current lineup TBD unless confirmed. Use editable game-only slot assignments so the match can start.
- **Visual identity.** `src/store.ts` maps opponent names to crests and contains a seeded Peachy Puffs color. An app accent alone does not establish a kit. Inspect `public/jerseys/` for black and white front/back artwork and `public/portraits/` for six cutouts. Confirm player-to-portrait assignments before deriving individual sprites. Use `src/features/lineup/formations` as a reference for shapes. Import neither the UI nor the store.
- **Missing data.** `src/data/seedMatches.json` includes opponent identities. Restrict the game to the eight listed clubs. Give each rival reusable anonymous outfield and keeper sprites, seven starting slots, and at least two bench slots. Unknown real names, kits, and crests stay TBD in content. At runtime show generic labels such as “Reserve 1”, a neutral shield, and contrasting light/dark arcade strips with distinct trim patterns. Apply the same fallback on an asset load failure.
- **Ratings.** Historical match totals and ratings serve different purposes. Author ratings as game balance values, identified as such in the squad screen. Never infer a person's ability, role, or appearance from a name, jersey number, or missing statistic.

## 3. Match loop and rulings · first opponent playtest

Use a 64 × 42 game-metre pitch, 5 m goal mouth and a 2–2–2 outfield shape as starting values. Attack horizontally and swap ends at halftime. The home side takes the first kickoff and the away side takes the second. There is no offside detection. Exhibition ends in a draw on level scores.

**Clock.** Store elapsed simulation time and displayed match time separately. Offer 1×, 5×, and default 10× at setup. At 10× a half takes 150 real seconds of live play. The multiplier affects only the scoreboard clock. Freeze it during restarts, celebrations, pause, halftime, and backgrounding. Show 00:00 through 25:00, then 25:00 through 50:00. No added time. Process events chronologically within a tick. A goal crossing at or before the whistle counts once. A period-ending goal goes directly to the interval or result after its score cue.

| Event | Award and placement | Resume |
| --- | --- | --- |
| Whole ball crosses the goal plane between the posts and below the bar | Increment scoring side once, including own goals. Show scorer if known | Brief celebration, then conceding side kicks off at center |
| Whole ball crosses a touchline | Other side gets a kick-in at crossing point | Taker passes infield |
| Whole ball crosses a goal line outside the goal, attacker touched last | Defending keeper takes goal kick in goal area | Pass or long clearance |
| Same exit, defender touched last | Attackers take nearest corner | Pass or shoot |
| Keeper secures ball in own area | Keeper holds for up to 3 real seconds of live play | Human can pass early. AI or timeout distributes to an outlet |

Use swept crossings for fast shots. A post or bar contact rebounds into play when it precedes the crossing. For simultaneous corner boundary crossings use goal-line precedence. Track last touch on kicks, tackles and deflections. Put opponents at least 3 m from a dead-ball taker until release. Give the human directional aim and Pass at every restart, with Shoot also available for corners and clearances. CPU takes restarts promptly. After 4 unpaused real seconds, auto-pass for an idle human. Restart actions begin only on a fresh press after setup. Match tackles resolve as steals or misses, with no foul, cards, penalties, or injuries.

## 4. Hands, feet, and ball

| Intent | Landscape touch | Keyboard | Standard gamepad |
| --- | --- | --- | --- |
| Move / aim | Floating left stick | WASD or arrows | Left stick or D-pad |
| Pass / tackle | Primary button changes label with possession | J | South face |
| Shoot | Secondary button on ball or approaching a pass | K | East face |
| Sprint | Hold right-side sprint pad | Hold Shift | Hold right trigger |
| Pause / resume | Pause icon | Esc | Start |

Capture simultaneous pointers independently. Keep action buttons within thumb reach and support move + sprint + kick together. Allow sprint to latch via a touch setting for two-thumb play. Sample input every simulation tick. Latch contextual actions at press time and cancel a charged shot if possession is lost before release. Clear held actions on pause, lost focus, controller disconnect, and pointer cancellation. Buttons and menus need focus, keyboard activation, and gamepad navigation.

- **Carry and receive.** Ball states are free, carried, in flight, and keeper-held. Each tick has at most one owner. A carried ball stays just ahead of the foot during turns. Receivers take control within trapping range and speed limits. Fast shots can ricochet. On a friendly first touch, control belongs to the teammate who actually secures the ball.
- **Pass and automatic selection.** On press, rank reachable teammates by stick direction, openness of the lane, then distance. With neutral input prefer a short open outlet. Break ties by stable player ID. Kick toward the chosen teammate's projected position and immediately give the human control of that receiver, marked by the selection ring. Keep possession unassigned until someone traps the ball. Another player crossing the lane can intercept it. With no reachable teammate, kick into the aimed space and keep control of the kicker.
- **Shoot.** Press for a quick windup and release to strike. Cap charge at 0.65 real seconds and fire at cap. Use aim at release, facing as fallback. Charge adds pace and height. Show a foot flash and a short ball trail on a full strike. A tap must still produce a useful shot.
- **Defending.** Player selection is automatic on every input device. On an opponent interception, select the human side's outfielder best placed to challenge, using estimated time to intercept. Retain that defender while viable to avoid flickering between teammates. Tackle makes a short directional lunge with about 0.35 s recovery on a miss. Ball-first contact knocks the ball loose. Keep the GK under AI control except for human distribution.
- **Feel check.** Aim for a 10 m pass to arrive in roughly half a second. Play the kick sound at contact, give tackles a clear recovery pose, and keep the ball legible through every effect. Compare a kickoff passing triangle, a missed tackle, and a shot across goal on phone and desktop. The supplied ROM can serve as a private hands-on reference for cadence and framing. The game build has no dependency on it.

## 5. Players, AI, and the bench

Rate pace, passing, shooting, tackling, stamina and keeping on a 1–100 scale. Pace sets top speed, passing narrows directional error, shooting raises shot speed, tackling improves contact reach within a capped range, and keeping affects reaction delay and catch radius. Use bounded curves so a low-rated player can still complete a short pass. Give the initial arcade roster balanced profiles with visible tradeoffs, such as a quick runner with slower stamina recovery.

**Energy** is a match value from 0–100, separate from the stamina rating. Start at 100. Sprint gives about 25% extra speed and costs 6–10 energy per live second depending on stamina. Jogging recovers 2/s, resting on the bench 5/s. Below 20, taper the sprint boost to zero at empty. Halftime restores 20, capped at 100. Show a bar on the HUD and numbers for everyone in the pause menu. Pausing never restores energy.

**Match AI.** Update tactical decisions at 10 Hz and movement every simulation tick. In possession, the carrier shoots with a clear angle in range, passes when pressed, otherwise advances. One teammate offers a short diagonal outlet, one makes a forward run, and the others maintain width and defensive cover. With the ball lost, assign one presser by time to intercept, a second defender to cover, and the rest to shape. Use a short assignment lock to prevent oscillation. For loose balls, both teams pursue with their nearest eligible player. Keeper tracks the ball-to-goal angle, steps out on a reachable loose ball, catches or parries using speed and keeping rating, then distributes. Outside the keeper area use outfield contact rules.

**Rolling substitutions.** Pause → Squad → select on-field slot → select bench player → confirm. Show both players' energy, role eligibility and arcade ratings before confirmation. A replacement inherits the tactical slot. Preserve individual energy and match totals across repeated swaps. Allow returning players and unlimited swaps. Validate eligibility against game-assigned roles and always retain one GK. Commit the pair atomically. Transfer selection and any carried ball to the incoming occupant of that slot. Cancel changes nothing. CPU checks its bench on stoppages and favors eligible fresh replacements for exhausted players.

## 6. Picture, sound, and small screens

Use hand-directed pixel-art characters as transparent 2D sprites in a Three.js 3D pitch, goal and ball scene. Let the limited pixel palette, bold clusters and strong silhouettes guide field markings, props, effects and menus. Use a Three.js orthographic camera with a shallow elevated sideline view, a textured pitch plane and camera-facing sprites. Track whoever has possession, including an opponent or keeper. While the ball is airborne or loose, track the ball itself. Ease toward the new carrier on a reception or interception. Selecting a pass target moves the control ring immediately while the camera stays with the traveling ball. Clamp at the stadium edge. Keep the attacking goal visible near the box. A small edge arrow indicates an offscreen pass target.

Use a 480 × 270 reference viewport. Display the player frames at 48 × 48 with the current Practice camera. Work on an intentional pixel grid, enlarge with nearest-neighbor sampling and pad atlas frames against edge bleed. Plan eight facing directions or mirrored equivalents where the kit permits. Draw idle, run, pass, shoot, tackle, stagger, and celebrate, plus keeper set, dive, and catch. Give TBFC players individual sprite variants as source art is confirmed. Distinguish teams and keeper with lightness and pattern. Use a ball shadow for height and an outline for visibility against kits. Add original whistle, kick, save, and crowd bursts. Respect mute and reduced-motion settings.

Fit the action inside the landscape viewport, preserve pitch proportions, and letterbox where necessary. Render HUD and controls separately at screen resolution. Reserve safe-area insets and at least 48 CSS px per touch target. Keep score, half and time at the top, selected player and energy above the stick. Portrait presents a rotate prompt and pauses an active match. Returning to landscape or foreground requires deliberate resume. Unlock audio on the first user gesture.

## 7. Implementation contract for Codex

Use Vite, TypeScript and Three.js. Deliver a static production build with relative asset URLs. No server is required for a match. Keep the browser shell thin so a later Capacitor wrapper can load the same build and route background/resume and safe-area behavior through existing handlers.

| Module | Owns |
| --- | --- |
| `src/sim/` | Pure fixed-step match state, players, ball, rules, phase transitions, seeded randomness and AI. No DOM, renderer, or wall-clock reads |
| `src/input/` | Touch, keyboard and gamepad adapters yielding the same movement axes and pressed/held/released actions |
| `src/render/` | Three.js scene, interpolated positions, sprite atlas animation, camera, effects and resource disposal |
| `src/season/` | Schedule generation, CPU score simulation, table sorting, qualification, bracket progression and versioned save/load |
| `src/ui/` | Practice picker and HUD, then title, matchup, lineup, season ladder, weekly results, table, bracket, team select, HUD, pause, squad, halftime, result and settings |
| `src/content/`, `public/game/` | Validated team/player snapshots, source manifest, fallback palettes, atlases and audio |
| `src/main.ts` | Load content, wire screens and adapters, run loop, handle resize and lifecycle |

Run the simulation at 60 fixed steps/s with an accumulator driven by animation frames. Cap catch-up work after a long frame and clear elapsed backlog on resume. Resolve movement, ball contacts and timed rule events before emitting presentation events. Rendering and sound consume events once. Pause overlays preserve the underlying phase and timers, including a pending kick-in. Use versioned local storage for settings. A rematch creates fresh match state.

**Sample TypeScript content and setup schemas**

```ts
type Team = {
  id: string
  name: string
  crestPath: string | null
  verifiedKit: { shirt: string; shorts: string } | null
  fallbackStrip: "light" | "dark"
  playerIds: string[]
}
type Rating = "pace" | "passing" | "shooting" | "tackling" | "stamina" | "keeping"
type GamePlayer = {
  id: string
  sourcePlayerId: string | null
  displayName: string | null
  shirtNumber: string | null
  gameRoles: ("GK" | "OUT")[]
  arcadeRatings: Record<Rating, number>
  spriteKey: string
}
type PracticeSetup = { selectedTbfcPlayerIds: string[] }
type MatchSetup = {
  homeId: string
  awayId: string
  halfMinutes: 25
  clockScale: 1 | 5 | 10
  seed: number
}
```

Use null for unknown content and render TBD in factual detail fields. Validate unique IDs, foreign keys and integer ratings. Practice requires one to seven distinct TBFC players. Only match setup enforces distinct opponents and a legal starting seven plus eligible reserves. Reserve one eligible backup GK per squad, possibly dual-role. Derive slot labels from lineup configuration. Runtime state additionally stores active IDs by slot, bench IDs, energy by player, controlled slot, ball owner/last touch, restart award, phase, half, score and clock.

## 8. Milestones and acceptance

| Order | Implement | Exit check |
| --- | --- | --- |
| 1. Character design and sprites | Create the character sheet and first animation atlas described in section 9 | Review silhouettes at phone scale, facing, run cycle and boot contact. Use the approved pixel-art character sheet to produce the TBFC set before the test match. |
| 2. Practice MVP | TBFC roster picker, free-play pitch, movement, receiving, passing, shooting, possession camera and reset | From a clean checkout, launch the sandbox and test solo, two players, a triangle and seven players. Verify that zero cannot start and an eighth selection is blocked. Repeat the triangle on landscape touch, keyboard and gamepad. Verify the expected receiver gets the ring on release and the camera follows the ball until first touch. Run the give-and-go, stationary triangle and touchline support checks above. Then test the target finishes and quick retry. Record confusing plays, tune, and replay. |
| 3. First test match | TBFC versus one test squad. Add legal lineups, defensive AI, keeper, stamina, subs, clock, goals and restarts | Play both halves to a result. Force a pass interception and check defender selection and camera handoff. Observe a complete match, tune passing, defensive pressure, keeper saves and fatigue, then replay the matchup before expanding. |
| 4. Exhibition expansion | Eight selectable clubs, crest and kit fallbacks, matchup selection and rematches | Start each club on both sides. Verify the tested match loop works with every lineup. |
| 5. New Season | Six weekly rounds, results simulator, table, semifinals and final, shootouts and resume | Finish as a finalist and as an eliminated club. Reload between rounds and verify opponents and standings. |
| First expansion | Same-team couch co-op for two local players | Complete a season match on two pads. Verify independent control, reconnection and credit for a shared goal. |
| Later. Tournament | Seed eight clubs into quarterfinals, semifinals and final. Persist bracket between rounds | Specify and test tied-match resolution before enabling the mode |

**Match and season acceptance tests.** Apply each check when its mode is built. The Practice MVP is complete against milestone 2.

- **Simulation tests.** Use seeded command sequences for pass interception, keeper catch/parry, last-touch deflection, own goal, post rebound, and whole-ball crossing. Check a goal just before, exactly at, and after the whistle. Verify a 10× half ends after 150 live seconds and that changing clock scale leaves ball speed and fatigue per live second equal.
- **State invariants.** After every goal, restart and swap, assert seven unique active players per team, exactly one keeper and at most one ball owner. Test duplicate swap attempts, ineligible keeper swaps, a sub during a pending restart, pause during shot charge, and resume without a phantom kick. Verify CPU and human attackers can receive beyond the last defender.
- **Season tests.** Assert 24 distinct regular fixtures, four per week, six opponents and three home games per club. Verify points, tied seeds at the cutoff, the 1–4 and 2–3 pairings, and exactly one champion after 27 total fixtures. Exercise a tied playoff game, a CPU-only final and repeat week completion after reload.
- **Input and flow.** Finish an exhibition on mobile Safari and Android Chrome using touch, and on desktop using keyboard and a standard pad. Reach kickoff from the title via opponent selection and lineup on each input type. Choose a different formation and verify that the pitch markers move immediately. Assign a reserve to a spot and confirm that kickoff uses the displayed shape and players, with one GK and six distinct outfielders. Verify menu navigation, multi-touch sprint/pass, pointer loss, rematch and team reselection. Check narrow landscape, wide landscape, portrait rotation, safe areas, tab backgrounding and pad disconnect. Record any untested device explicitly.
- **Content and performance.** Start every club on each side, force a missing crest and sprite, and verify readable strips and a playable match. Target 60 fps on a representative recent phone with 14 players on screen. Profile two continuous minutes of play, record device and browser, and investigate sustained runs below 50 fps. Restart five matches and check that canvas, audio and input listeners do not accumulate.
- **Handoff.** A clean checkout installs, type-checks, passes rule tests, builds, and serves both exhibition and season play from static hosting with the companion app offline. Ship the control map, content provenance, known TBDs and manual test results with the game. Keep unverified assets replaceable without editing simulation code.

**First assignment for Codex.** Start in the existing game repo with character design. Deliver the first sprite review sheet and prototype atlas below. Review the art at game scale, revise it, then use it in the Practice build. The eight-club season remains downstream.

## 9. Character design · first assignment

Start with one representative TBFC outfielder. Use a confirmed portrait-to-player match if available. Otherwise label the prototype as a generic kit study. Review the companion jersey artwork and record the reference used. Keep unknown identity details open.

**Review sheet.** Use #6 Meghan Wahlstrom’s supplied PixelLab idle and run atlases as the roster reference. Pair the black jersey with black shorts and the white jersey with white shorts. Other players draw a stable cleat color from black, pink, yellow or white. Use one pixel grid, palette, outline weight, light direction and foot pivot for front, side, back and three-quarter views. Review the enlarged form and the approved 48-pixel display scale beside a ball and two outlets. Compare one light and one dark strip for readability. Check the contact foot against the ball on both facing directions before expanding the animation set.

**First atlas.** Follow PLAYER-SPRITES.md. Inspect the companion kit PNGs before every TBFC sprite or revision. Derive the alternate by recoloring both black shirt fabric and black shorts fabric white. Deliver transparent PNG frames for idle, run, pass and shoot, plus frame rectangles, facing, foot pivot, timing and kick-contact frame in a small manifest. Show the same run and kick in a loop. Keep planted feet still at contact and preserve shirt-number orientation when mirroring. Review this sheet before multiplying variants. Extend the approved style to the roster and keeper poses before the first opponent match.

## 10. Play and season decisions

- **First-time shot.** Buffer a Shoot tap from the selected receiver for an initial 150 ms before an incoming pass. On a reachable first contact, strike once using the queued aim. Expire the input on a miss, interception, pause or change of receiver. Test early, just-in-window and late taps on touch and pad.
- **Rival identity.** Give each fictional arcade team a readable tactical tendency, such as an early shot, a high press or a deep block. Express it through the same AI parameters and test counterplay. Assign tendencies during balancing.
- **Between weeks.** Save formation, selected lineup, results and individual stats after each completed fixture. Restore player energy to full for the next match. On a phone interruption, pause immediately. After a browser close, restart the unfinished fixture from its pre-match state and retain all completed weeks.
- **Season record book.** Keep scorer, assister when known, match minute and fixture for each human-played goal. Show the title-winning goal and season scoring and assist leaders for fixtures with individual event data. Keep simulated scorelines in league history.
- **Shootouts.** Let the human aim and shoot for their club and choose left, center or right as the keeper before each CPU kick. Use stick/D-pad or touch direction and confirm before the opponent strikes. End as soon as a winner is determined.

## 11. Physical controllers

Support wired USB, Bluetooth and phone-mounted controllers exposed by the browser, including direct-plug mobile grips. Use the same actions for menus and gameplay as the controls table. Show “Press a button to join” on a focused page. Read current axes and buttons each frame, apply a stick dead zone, and track edges once per press. Offer a binding screen for nonstandard mappings. Keep touch and keyboard available when hardware is unavailable. [MDN Gamepad API guide](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)

**Playtest matrix.** Try a USB pad on desktop, a Bluetooth pad on desktop and phone, and a direct-plug phone controller. Cover iOS Safari and Android Chrome across mobile runs. Record hardware, OS and browser for each. Start with a pad connected before launch, join from the title, select seven players, pass, sprint, shoot first-time, pause and navigate back. Disconnect during a charged shot: pause, clear held input, reconnect or choose touch, and resume deliberately. Verify no accidental shot. Record actual passes and untested combinations.

## 12. Achievement sticker book

FIFA 23 and EA SPORTS FC 24 both list “Power Shot” and “Dead-ball specialist”. Those are useful patterns for rewarding a particular technique. TBFC uses its own moves, season format and names below. [FIFA 23 achievements](https://steamcommunity.com/stats/1811260/achievements/) · [EA SPORTS FC 24 achievements](https://steamcommunity.com/stats/2195250/achievements/)

| Sticker | Unlock condition |
| --- | --- |
| Right Back at You | Practice: complete A → B → A before another player touches the ball. |
| Three Corners | Practice: complete A → B → C → A in one passing sequence. |
| Meet It | Target Practice: score with a buffered first-time shot from a return pass. |
| Paint the Posts | Target Practice: hit both low targets and the high target in one session. |
| Four Corners (secret) | Hit all three distinct targets on three consecutive shots to reveal a fourth. Hit it with the very next shot. |
| On the Sheet | Match: record your first assist on a teammate’s goal. |
| Bench Spark | Match: score with a player who entered from the bench that game. |
| All Seven | Match: all seven active players touch the ball during one uninterrupted team possession. |
| Safe Hands | Match: win with a clean sheet after the keeper makes at least one save. |
| Off the Corner | Match: score from the first teammate touch after a corner delivery. |
| From Downtown | Match: score from a keeper’s clearance launched inside their own area. |
| Turf Burn (secret) | Match: complete three give-and-gos in one possession and score before a stoppage. Briefly trace the pass route in pixel flames. |

### Season stickers and expansion rewards

| Sticker | Unlock condition |
| --- | --- |
| Turn the Table | Win a season match after trailing at halftime. |
| Above the Line | Finish the six regular games in positions 1–4. |
| Denied | Save a playoff shootout kick with the human keeper. |
| Eight Weeks Later | Win the playoff final with the human club. |
| Same Couch, Same Goal | Co-op expansion: one human assists and the other scores in a match. |

**Awarding rules.** Unlock each sticker once per local profile and display its date, mode and season fixture when available. Practice stickers resolve at drill completion or the qualifying touch. Match and season stickers commit with the completed fixture. Consume stable event IDs so reconnecting or reloading never awards twice. Only human-played fixtures qualify for action stickers. Test near misses, qualifying actions, reload and two-player attribution. Ship stickers alongside their modes.

**First expansion · couch co-op.** Two humans, two local controllers, one team and one shared camera. Aim for exhibition and a shared season. Each player joins an independent seat. A pass to the partner leaves that avatar with the partner; a pass to an AI teammate moves the passer’s seat to the receiver. Keep control rings distinct and pause on disconnect. Prototype shared-screen spacing with the two-player give-and-go.

**Replay and support.** Try a weekly seeded skill challenge with a local personal best, such as five shots at three targets. Explore a one-time supporter pack with alternate pitch art, celebrations or soundtrack extras. Keep the full season and competitive ratings available to everyone.

**Other secrets.** After the season final, a groundskeeper can mow around the trophy if the player lingers. Reserve a hidden celebration for a real TBFC story supplied by the club.
