# SNOWPOCALYPSE

SNOWPOCALYPSE is a Kick Off exhibition mode built on `classicRules()`: seven players per side, one goalkeeper, normal formations, substitutions, chemistry, Burn Mode, fouls, restarts, scoring, celebrations and replays. It does not create a second match engine or season standings path.

## Implementation

- Phase 1: third mode card using existing controller navigation; arena capabilities filter to outdoor Classic pitches (Grant Park, West End, Old 4th Ward, Candler Park, Midtown). Weather controls are replaced by a locked Snow label. The existing snow surface starts at maximum cover and preserves that baseline on reset. Time of day remains selectable.
- Phase 2: immutable match-local profiles in `matchPhysics.ts`. Snow uses traction .35, acceleration .8, deceleration .35, launch speed 1.25, rolling resistance .5, tackle distance 1.75, recovery 1.25. Standard rules retain neutral multipliers and their original movement path. Direction changes and stopping integrate velocity immediately, without input delay. Humans, teammates, opponents and normal goalkeeper movement share the same integrator. AI brakes on approach and leads moving rebounds farther ahead.
- Tackle contact and foul timing remain at .12 seconds. A finite .3-second coast follows the original lunge. Recovery animation is extended and field bounds still clamp players.
- Ball changes use launch durations or speed once, with rolling resistance replacing ordinary snow's .9 friction rather than stacking with it. Existing curved flight, Burn shots and swept contacts remain in use. Snow aimed-shot/pass durations have a 45 m/s straight-line travel bound and loose-ball velocity is capped at 45 m/s; existing swept collision checks still handle curved trajectories. Missed AI passes roll loose instead of teleporting to a distant receiver.
- Snow coverage now follows upward-facing scenery surfaces (ground, track, roofs, steps and tree canopies), using the pitch’s same accumulation clock. A two-metre pitch-edge blend retains tracks, while distant scenery fades out gradually. Transparent glazing, emissive lights, sprites and vertical walls remain unaffected; switching weather disables both layers.
- Phase 3: reuse the existing orange winter ball, snow keeper artwork, snow rendering and tracks; add contrasting pitch markings and a skippable weather advisory within the stadium's existing introduction. Results identify the mode and offer Rematch/Return to Kickoff using the existing history-state flow.
- There is no persistent exhibition match-record store in this engine. The mode is retained in result/rematch state. Career persistence still requires an actual career ticket.
- Phase 4: no new snow spray, frosted scoreboard, melted Burn trails or achievements. Existing snow tracks remain available.

## Verification

Use Node 22 (the host's default Node 21 executable has a missing ICU dependency):

```
node --experimental-transform-types --test tbfc-arcade/tests/*.test.mjs
npm run build
```

Nine new tests cover rules/profile isolation, stadium eligibility, immediate input response, directional drift, braking distance, frame-rate stability, AI target approach, finite slide travel/recovery, ball tuning, zero-time updates and full snow cover/reset behavior.

Browser checks also verified Rematch reloads SNOWPOCALYPSE with the same stadium/weather/time, and Return to Kickoff restores Classic’s six stadiums (including Cabbagetown), unlocked weather controls and Sun selection.

Browser checks exercised setup, weather locking, full-cover rendering, orange ball and readable markings; controller movement retained about 1.07 m of travel during the .25 s after releasing sprint. A 7v7 run produced a 2–0 result, five/thirteen completed passes, three/one tackles, a foul, two saves, two woodwork contacts, goals and replay/highlight playback. Both halves were advanced near their end for transition coverage; this was not an uninterrupted full-duration endurance test. Burn meters progressed during live play. Full combinations of teams, stadiums, substitutions, red cards and Burn shot styles still merit playtesting.

Known baseline issues reproduced before these changes: one career test expects Beginners but receives D6; a direct Arcade type check reports `grounds.ts:27` (void/callback union); the title screen's `alignTitle` callback can access a removed element when rapidly leaving the menu. The standard production build succeeds. The test suite runs 79 tests: 78 pass and only the same baseline career assertion fails. The existing menu/change-log edits were preserved.

Environmental snow was visually checked on all five outdoor Classic stadiums, in full cover and with partial regular accumulation at Grant Park, including night lighting and switching back to Sun. Two additional tests cover scene-local materials, accumulation uniforms, visibility/reset, and excluded lights/glazing/sprites.
