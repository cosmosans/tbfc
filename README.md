# TBFC Club Hub

React + TypeScript club app for the Turf Burners FC match archive, post-game entry, stats, lineups, and an iPad-friendly coaching board.

## Run locally

```sh
npm install
npm run dev
```

## Code layout

- `src/App.tsx` maps React Router URLs to pages and handles browser data updates.
- `src/components/` holds reusable UI pieces such as the opponent crest.
- Reusable visual styles use Material UI's `styled` API. The app no longer imports a standalone stylesheet.
- `src/features/matches/` holds match summary and upcoming cards, match history, the editor, and events.
- Other `src/features/` folders own schedule import, squad and player cards, Teams, Seasons, stats, lineups, and the matchboard.
- `src/model.ts`, `src/store.ts`, and `src/clubView.ts` hold data types, local persistence, and shared record selectors.

The app starts with 52 accepted source rows imported from `TBFC STATS - Matchlog.csv` into `src/data/seedMatches.json`. The erroneous October 15, 2026 Inter Your Mom 1–1 row is excluded by the importer and removed from existing browser data. Changes made on localhost are saved in that browser's local storage. The public site is read only and data is not yet shared across devices.

To move browser data, click **Backup** in the top bar and **Download backup JSON**. In another browser running the app, click **Backup**, choose the downloaded JSON, review the record counts, and click **Restore backup**. Restoring replaces the destination browser's local edits; download its backup first if you need to keep them.

For a new season, create it under **Schedule → Manage seasons**, then use **Upload Season Schedule** to open the CSV import dialog. The upload accepts `Date` and `Opponent` columns, plus optional `Time`, `Location`, `Pitch`, `Competition`, `Kit Color`, and `Home/Away` (the original matchlog column names also work). Dates may be `YYYY-MM-DD` or `MM/DD/YYYY`. Review the preview, then add the valid rows as upcoming fixtures. Existing fixtures with the same season, date, opponent, and kickoff are skipped. New opponent names become editable Teams with empty crest and notes.

## Shareable routes

The main pages use `/schedule`, `/squad`, `/tactics`, `/teams`, `/locations`, and `/stats`; Matchday is `/`. Individual records use `/match/:id` and `/team/:id`. Match tabs are linkable with `?tab=history`, `?tab=events`, `?tab=lineup`, or `?tab=board` as applicable. Direct URLs and reloads work in the Vite dev server. Production hosting needs a single-page-app fallback to `index.html`. Custom edits still live in browser local storage, so a link opened in another browser will show that browser's data until its backup is restored.

The initial Fall 2026 schedule includes the November 5 Peachy Puffs, November 12 Peach Passers, and November 19 Whiff City FC fixtures from the supplied league screenshot. The October 29 result in that screenshot was already completed and is not part of the upcoming schedule. Browser edits to those fixtures take precedence over the defaults.

**Matchday** shows the next match. Open that card to prepare its lineup and coaching board. **Schedule** contains upcoming fixtures and completed match history, with the newest season selected by default.

Opponent crests on match views, schedule cards, Teams, and standings link to `/team/:id`. Each team page shows the lifetime head-to-head record and matches across every season; match cards there link back to their individual match pages.

**Standings** appears on Matchday. Select a season, download the CSV template, update its league table rows, and upload it. The app previews the team count before replacing that season's standings. Point difference is calculated from scored minus allowed; PI and ranking points use the values in the league CSV. The initial Fall 2026 table was transcribed from the supplied league screenshot.

Lineups offer `1-2-3-1` (CAM and ST) and `1-3-3` (CDM and CAM). Switching keeps players in roles shared by both formations and moves players from removed roles to the bench.

## Source-of-truth rules

- Match scores drive wins, draws, losses, goals scored, and goals allowed. Hand-maintained overview totals are not imported.
- The original score and result text are retained on every imported row for audit. Inconsistencies are flagged, not silently changed.
- Historical scorer notes are stored as text. They do not create player goal events automatically. Missing attribution stays unknown.
- New events can include a match minute. The minute is optional for historical records.
- The separate goals-and-assists sheet supplied initial names and shirt numbers only. Its aggregate figures are not attached to invented matches.
- Coaching board marker movements never rewrite the official lineup. Resetting the board reloads the latest saved lineup. Players start as Unavailable for each fixture until assigned to the bench or a starting slot.

To regenerate the seed from an updated CSV:

```sh
python3 scripts/import_matchlog.py '/absolute/path/to/TBFC STATS - Matchlog.csv'
```

This updates only the checked-in seed file. Existing browser data remains untouched until local storage is cleared or a dedicated import is added.

## Hosting

Cloudflare Pages is the intended host for `turfburnersfc.soccer`. The build uses Node 22, `npm run build`, and the `dist` output directory. See [the deployment guide](docs/deploy-cloudflare.md) for the GitHub connection, custom domain steps, and current browser-local data behavior.

## Backend setup

The proposed production backend is Supabase/PostgreSQL. `supabase/migrations/20261104000000_initial.sql` defines matches, seasons, opponents and crests, players, events, lineups, boards, calculated result views, and role-based access rules. It is ready to apply after a Supabase project is created. No cloud project, credentials, or deployment are included here.

The current UI runs in local mode. The next backend step is to connect the app's data operations to Supabase, add sign-in, and provide a reviewed first import of the matchlog. Avoid entering irreplaceable new data in local mode without downloading a backup.

## Current scope

Available now: match archive and filtering, score-derived record and season charts, season records, editable Teams with crests, hex colors, and scouting notes, schedule CSV preview and upload, match editing and reports, optional-minute events, squad entry with preferred positions and flip cards, seven-player lineup selection, and a touch marker board. Player photos and uploaded crests are resized and saved in browser-local data for now; cloud storage will replace this when the backend is connected.

Head-to-head record bars use the opposing Team's saved color on the left and TBFC orange on the right. Peachy Puffs starts with `#2d5337`; other Teams can set their own color in the editor.

Next: cloud sync and authentication, import review for disputed rows, match availability and lineup export, richer opponent/kit graphs, and coaching annotations. Animated scenarios and set pieces remain later roadmap work.
