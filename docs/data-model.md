# TBFC data model — initial setup

The live app stores shared club records in Cloudflare D1. `migrations/0001_club_records.sql` creates `club_records`, keyed by collection and record ID, and `club_meta`, which tracks the revision. Each row holds one typed JSON record. The earlier `supabase/migrations/` files describe an unused alternative design.

```mermaid
erDiagram
  SEASONS ||--o{ MATCHES : groups
  OPPONENTS ||--o{ MATCHES : plays
  MATCHES ||--o{ MATCH_EVENTS : contains
  PLAYERS o|--o{ MATCH_EVENTS : credited_to
  MATCHES ||--o| LINEUPS : has
  MATCHES ||--o| BOARDS : has
  SEASONS ||--o| STANDINGS_SNAPSHOTS : has
```

| Record | What it stores | Important fields |
| --- | --- | --- |
| `seasons` | Named groups of fixtures | name, optional start date, notes |
| `opponents` | Every opposing team | name, crest URL, hex color, scouting notes |
| `matches` | Fixtures and historical entries | status, season, opponent, date, competition, location, pitch, kickoff, home/away, score, optional shootout score, kit, report, original CSV row |
| `locations` | Reusable match venues | name, address, image |
| `players` | TBFC roster | name, shirt number, photo reference, active status, optional preferred and secondary positions: ST, CAM, CDM, LW, LB, RW, RB, GK |
| `match_events` | Details known for a game | kind, team for goals/cards/penalty saves, own goal flag, team goal flag, player when known, optional minute, note |
| `lineups` | Official saved starters and bench | match, formation, player IDs |
| `boards` | Coaching positions and notes | match, marker positions, board notes |
| `standings_snapshots` | Latest uploaded league table per season | update date, ranked team rows with W/L/D, scored, allowed, PI and ranking points |

## Derived views

- `match_results`: derives W/D/L from the score. A tied match with a recorded shootout uses the shootout to determine its winner. Shootout goals do not increase match goals.
- `season_totals`: derives each season's played, W/D/L, goals for, and goals against from its matches.
- Seasons display in chronological order using their start date (inferred from imported matches where available).
- `opponent_totals`: derives the head-to-head record and goals against each opponent from linked matches.
- `player_event_totals`: counts only recorded, attributed match events. Historical gaps remain gaps.

## Imported starting point

The seed contains 52 accepted completed matches, 8 season names, and 17 opponents from the matchlog, plus 3 upcoming fixtures. The October 15, 2026 Inter Your Mom 1–1 row is excluded. Seed scores derive a 21 W / 11 D / 20 L record and 79–78 goals. This includes one shootout win with a 1–1 match score and 2–1 shootout score. The hand-maintained overview is not used to calculate totals.

The aggregate goals-and-assists CSV supplied 16 initial player names and numbers. Its totals are not fabricated into match events. Historical scorer text is preserved on matches, and a player event is created only when entered or reviewed explicitly.

Player images are resized and embedded in the record data. Managed media storage can replace embedded image data later.

## App operations

`GET /api/club` returns every collection and its revision. `PUT /api/club` replaces all collection rows atomically when supplied with the current revision and a private write key. Only the localhost Vite proxy holds that key; no sign-in UI is required for public reading. Scores and totals are calculated in app code from match records, preserving the matchlog as the source of truth.
