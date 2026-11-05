# TBFC Club Hub

React + TypeScript club app for the Turf Burners FC match archive, post-game entry, stats, lineups, and an iPad-friendly coaching board.

## Run locally

```sh
npm install
npm run dev
```

## Code layout

- `src/App.tsx` maps React Router URLs to pages and handles shared data updates.
- `src/components/` holds reusable UI pieces such as the opponent crest.
- Reusable visual styles use Material UI's `styled` API. The app no longer imports a standalone stylesheet.
- `src/features/matches/` holds match summary and upcoming cards, match history, the editor, and events.
- Other `src/features/` folders own schedule import, roster and player cards, Teams, Seasons, stats, lineups, and the matchboard.
- `src/model.ts`, `src/store.ts`, and `src/clubView.ts` hold data types, browser backups, and shared record selectors.
- `functions/api/club.ts` serves public reads and authorized writes from Cloudflare D1.

The app starts with 52 accepted source rows imported from `TBFC STATS - Matchlog.csv` into `src/data/seedMatches.json`. The erroneous October 15, 2026 Inter Your Mom 1–1 row is excluded by the importer and removed from existing browser data. The shared D1 database supplies club records once it is populated. Localhost edits sync to D1; the public site reads the same records and has no editing controls. Browser storage remains a backup and the source for the first import.

To move existing browser data into D1, open the browser containing those records on localhost and click **Publish this browser’s data** while the database is empty. If the records live in a different browser, use **Backup → Download backup JSON** there, then **Backup → Restore backup** in your localhost browser before publishing. Keep a backup before replacing shared data.

For a new season, create it under **Schedule → Manage seasons**, then use **Upload Season Schedule** to open the CSV import dialog. The upload accepts `Date` and `Opponent` columns, plus optional `Time`, `Location`, `Pitch`, `Competition`, `Kit Color`, and `Home/Away` (the original matchlog column names also work). Dates may be `YYYY-MM-DD` or `MM/DD/YYYY`. Review the preview, then add the valid rows as upcoming fixtures. Existing fixtures with the same season, date, opponent, and kickoff are skipped. New opponent names become editable Teams with empty crest and notes.

## Shareable routes

The main pages use `/schedule`, `/roster`, `/tactics`, `/teams`, `/locations`, and `/stats`; Matchday is `/`. Individual records use `/match/:id` and `/team/:id`. Match tabs are linkable with `?tab=history`, `?tab=events`, `?tab=lineup`, or `?tab=board` as applicable. Direct URLs and reloads work in Vite and Cloudflare Pages. Once D1 is populated, links on every device show the same records.

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

## Shared backend

Cloudflare Pages Functions expose `GET /api/club` publicly and `PUT /api/club` with a private write key. The `tbfc-club` D1 database stores one row per match, player, team, season, location, event, lineup, board, and standings snapshot. `migrations/0001_club_records.sql` defines its tables. Reads return a complete club snapshot; writes replace it in one D1 batch. A revision check catches stale edits. The write key stays in Cloudflare's encrypted environment and the ignored local `.env.local` file; the browser never receives it. Vite proxies localhost API calls and adds the key only from the local server. `npm run dev` listens on loopback, so another device cannot use that proxy.

The older `supabase/migrations/` directory remains as an unused relational design. The active backend is D1. Uploaded photos and crests are currently embedded in record data; managed image storage is a later improvement.

## Current scope

Available now: match archive and filtering, score-derived record and season charts, season records, editable Teams with crests, hex colors, and scouting notes, schedule CSV preview and upload, match editing and reports, optional-minute events, roster entry with preferred positions and flip cards, seven-player lineup selection, and a touch marker board. Player photos and uploaded crests are resized and stored in the shared record data after publishing.

Head-to-head record bars use the opposing Team's saved color on the left and TBFC orange on the right. Peachy Puffs starts with `#2d5337`; other Teams can set their own color in the editor.

Next: import review for disputed rows, match availability and lineup export, richer opponent/kit graphs, managed image storage, and coaching annotations. Animated scenarios and set pieces remain later roadmap work.
