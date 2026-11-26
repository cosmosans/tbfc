# Live STREET templates

These files are imported into the running game using Vite `?raw` imports. Edit the HTML here, then reload the preview. They replace the markup previously embedded in the TypeScript controllers.

## Start here

| Screen | Layout | Styles | Controller / data |
| --- | --- | --- | --- |
| Mode selection | `mode-select.html`, `mode-card.html` | `../../kickOff.css` | `../../kickOff.ts` |
| 3v3 / 5v5 selection | `team-size.html`, `team-size-card.html` | `../../kickOff.css` | `../../kickOff.ts` |
| Teams | `team-select.html`, `team-card.html` | `../../teamSelect.css` | `../../teamSelect.ts` |
| Lineup | `lineup.html`, `lineup-player-slot.html`, `lineup-roster.html`, `lineup-roster-player.html` | `../../lineup.css` | `../../lineup.ts` |
| Court and match settings | `court-settings.html`, `court-swatch.html`, `*-option.html` | `../../kickOff.css` | `../../kickOff.ts` |
| Pause | `pause.html`, `pause-score.html` | `../../fullTime.css` | `../../pauseMenu.ts` |
| Results | `full-time.html` | `../../fullTime.css` | `../../main.ts`, `showFullTime()` / `matchCard()` |
| In-match scoreboard / HUD | `../../../play.html` (search `id="scoreboard"`) | inline styles in that file, STREET overrides in `../../kickOff.css` | `../../main.ts` |

The smaller files are reusable parts of those layouts. `mode-legend.html` is shared by mode and size selection through `selectionLegend()` in `kickOff.ts`. The team, lineup, pause and results layouts are shared with Classic, so edits there affect both modes.

## Editing

Change labels, reorder elements, add wrappers, or adjust CSS normally. Keep existing `id`, `data-*`, and class hooks used by the controllers unless you update their selectors too. In particular, preserve empty containers used to insert live content (team articles, lineup details, pause section, and results h2/p).

`{{name}}` inserts a value or rendered partial supplied by the controller's `renderMarkup(...)` call. Move the whole placeholder along with its surrounding markup. Do not rename a placeholder without updating its matching key in the controller. Values include trusted HTML and are not escaped by the helper. Do not insert untrusted input.

Roster names, mode-card descriptions, current scores and conditional labels still come from controller data. Repeated cards and buttons have their own HTML files so you can change their structure once. Some small partials retain numbered `slotNN` placeholders; their controller call lists the exact corresponding values.

No gameplay rules or screen designs were changed by this extraction.

## Controller legends

`team-legend.html`, `stadium-legend.html`, `side-legend.html`, `lineup-legend.html` and `mode-legend.html` use the shared `controller-legend` component in `../../menuLegend.css`. That stylesheet owns centering, the normal UI font, mixed-case labels and plain action buttons. Keep styling changes there so all screens stay consistent. Controller badges come from `padBadge()` in `../../screenUI.ts`; controls remain clickable and keyboard-operable.
