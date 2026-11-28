# Arcade release notes

Keep Debug sandboxes and their tuning out of the public change log. When a feature graduates into regular play, describe its player-facing effects. After completing a public-facing change, ask the user whether it deserves a bullet in the change log. Add a bullet to `src/changeLog.html` only when the user approves or explicitly requests one. Use the current date in America/New_York and the existing uppercase weekday, abbreviated month, day, and year heading format. Put new date sections first. For an existing date, insert the newest approved bullet at the top of its list.

Tag each release note bullet with one or two small uppercase labels inside a `.change-tags` span. Use the existing `.change-tag--*` styles in `src/mainMenu.css`: BUG FIX, VISUALS, ENVIRONMENTS, FEATURE, MECHANIC TWEAK, or UI. Choose the labels that best describe the player-facing change, and never put more than two on one bullet.
