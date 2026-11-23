# First Touch: first playable pass

First Touch runs on the existing Candler Park (`eastside`) level, with its normal collision, boundary, camera, weather and street-life systems. Practice offers the story and the existing Free Practice picker. Finishing the story unlocks all twelve chapters with Practice This Skill and Start Story Here choices.

## Editing

- `src/tutorial/dialogue.html`: lesson card, dialogue, pause/options and completion templates.
- `src/tutorial/practice.html`: Practice and chapter selection templates.
- `src/tutorial/tutorial.css`: presentation and responsive styling.
- `src/tutorial/script.json`: all chapters, dialogue, skill events, coaching hints, transitions and scrimmage reactions. Chapter 00 has an `instructions` array so each short instruction and its badge stay together.
- `src/tutorial/scene.json`: unique home/away roster, arrival chapters and sideline dressing.
- `src/tutorial/director.ts`: narrative lifecycle and template binding.
- `src/tutorial/progress.ts`: versioned local saves (`tbfc-first-touch-v1`), separate from Career.
- `src/tutorial/input.ts`: edge-triggered controller UI commands.
- `src/tutorial/ai.ts`: intentions fed into the existing actor steering; never writes ball state.
- `src/tutorial/park.ts`: cosmetic props and gradual light dimming.

The existing edits to Career screens, match speed settings and their main-game integrations were preserved.

## Connected mechanics

The normal simulation supplies movement/dribbling, sprint/stamina, passes and receptions, through balls, crosses, aerial headers, switching, tackles won, shots/on-target/goals/saves, curved shots, chemistry chains, Burn charging/readiness and special shots. Events persist even when performed before their lesson. Success is optional for advancement. Dialogue A/B input is consumed before gameplay input; right-stick camera switching remains the existing action. Explicit pause pauses simulation; dialogue does not.

Chapter transitions do not reset the world or move the ball. Next waits for a break in play. Normal match boundary restarts and post-goal restarts remain in effect. Reset Ball is an explicit tutorial-options action. The scrimmage uses normal match AI, with a three-minute active-play finish queued for a lull, or an explicit Finish when ready choice. Single-skill replay never auto-advances or overwrites story position.

Pam replaces Felipe with user approval: Felipe has no playable roster entry. Burn already activates automatically at full charge; the script explains this rather than inventing an activation button.

## Verified

- Production build passes.
- Ten tutorial tests cover save recovery, all chapter indices, early-event recognition, replay isolation, retained completion, storage failure, script integrity, coaching intentions, unique cast and simulated controller button edges.
- Browser walkthrough reached all twelve chapters, recognized movement/camera input, resumed chapter 06 after reload, completed the ending and unlocked Drills.
- Verified single-skill chapter 07 launch, visible pause options, explicit reset, return to the chapter list, and Start Story Here at chapter 11.
- Existing Free Practice launched successfully with Pam.
- The broader suite has 24 passing tests and one pre-existing Career test failure: `career.test.mjs` expects `beginners`, while the current code returns `d6`. Tutorial work does not change that code.

## Further playtesting and refinement

No physical Xbox controller was available for a complete hardware run. Check menu navigation, A reveal/advance without an accidental pass, optional B dismissal, Menu pause, RS camera, all gameplay bindings, and reconnected/held buttons on hardware. Keyboard and browser UI flow were exercised; controller edges have automated unit coverage.

Coaching currently layers arrival, passing-lane, gathering and light-pressure intentions onto the normal six-outfielder-per-side engine. This is not yet a custom small-sided roster system. Later lessons use the existing tactical runs and crosses; bespoke NPC demonstrations (especially a deliberately curled Steven shot or a guaranteed Pam delivery) are not scripted. The story wording does not pretend those demonstrations occurred. Aerial timing, defensive pressure and Burn combinations need sustained gameplay tuning. Mobile touch positioning and reduced-motion presentation need device testing. Existing sprite frames supply portraits; dedicated headshot artwork remains a polish opportunity.
