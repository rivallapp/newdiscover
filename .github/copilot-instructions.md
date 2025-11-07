# Copilot instructions for this repo

Static single-page app for discovering Volo activities. Everything renders client‑side in `index.html`; config/data live in two small JS files plus `leagues.json`.

## Big picture
- Core: `index.html` (search, filters, pills, cards, map, countdowns, image fallbacks). No build system.
- Config/data:
  - `experience-elevators.js` → `window.experienceElevators` (label, color, icon, aliases; order = priority).
  - `venue-locations.js` → `venues` used to render Location filter list.
  - `leagues.json` (raw feed) → normalized `activities` via `transformLeagueToActivity()`.
- Maps: Google Maps JS API loaded dynamically; full-screen map + small inactive preview.

## Run locally
- Serve this folder over HTTP so `fetch('./leagues.json')` works; if opened as `file://`, a local file picker appears to load JSON manually.
- Update the Google Maps API key in `index.html` inside `loadGoogleMapsScript()` if maps fail to load.

## Data flow (key functions in `index.html`)
- `loadLeaguesData()` → loads `./leagues.json` (array or `records`) → sets global `activities`.
- `transformLeagueToActivity(l)` → normalizes ids, titles, `activity_type` (League/Drop-in/PickUp/Tournament), `sport` (via `CANONICAL_SPORTS`/`SPORT_ALIASES`), `format`, `skill_levels`, `features`, prices, images, and `lat/lng` (parsed from `venue_map_url` if missing).
- Images are auto-healed via `fixImageUrl()`; `handleImgError()` falls back across formats, then to a 1×1 PNG.

## Filters and pills (project conventions)
- Inputs that affect filtering must have class `filter-input` and a meaningful `data-name`. Pills read these to render/remove selections.
- AND semantics across categories in `getFilteredActivities()` (activity type, venue, sports, composition, skills, features/community, day-of-week, optional price cap).
- Price slider appears only after selecting a price type; bounds derive from dataset maxima.
- “Your Sports” is staged multi-select: selections are cloned into hidden checked inputs under `#applied-sports-inputs` (also `filter-input`).

## Experience elevators
- Defined in `experience-elevators.js` and matched to activity `features` by alias; rendered as emoji color pills. Add/rename here—no app code change needed.

## Maps behavior
- Markers are grouped by exact `lat,lng` (`groupActivitiesByCoords()`); clicking opens a card with prev/next within the group. `refreshMapMarkers()` re-computes on filter change.
- `scheduleMapFitToMarkers()` runs after render/view switches to keep bounds correct; preview map is non-interactive.

## Formatting/normalization
- Titles use interpuncts and parenthesis removal; day-of-week chips auto-extracted (`extractDayPill()`).
- Skill labels canonicalized to: Competitive, Intermediate, Recreational, Social/Beginner (`SKILL_NORMALIZATION`).
- Closing status chips compute "Closing in …" to a 6pm ET deadline; live countdown updates every 30s.

## Common edits
- Add an elevator: edit `experience-elevators.js` (add `{ key, label, color, icon, aliases }`).
- Add a venue for Location filter: append to `venues` in `venue-locations.js`.
- Extend feature synonyms: add to `FEATURE_ALIASES` in `index.html` so filters match dataset wording.
- Add data: append to `leagues.json` (`records` entries with `program_name`, `venue_name`, `format`, `skill_levels`, `features`, `price_*`, `image_url`, and `lat/lng` or a parsable `venue_map_url`).

## Gotchas
- `file://` disables fetch; use a simple local server for default behavior.
- New radios (e.g., price-type) must remain unique in staged map filter panel; the code renames staged radios to avoid collisions.
- Ensure any new filter input has `filter-input` and `data-name`, or pills/counters won’t update.
