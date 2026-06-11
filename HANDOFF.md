# GORS LOG — Handoff Brief (June 2026 session)

## What is this?
GORS LOG is a personal PWA for tracking workouts (strength + running), protein, and body weight. Built with Next.js 15 (App Router, static export), React 18 hooks, Tailwind CSS 4, Supabase. Single user (Crosby), NOT a developer. Runs as an iOS standalone PWA launched from a Safari bookmark on the home screen.

## Critical user preferences
- Always provide full terminal commands with every build. Repeatedly requested.
- Project lives at `~/workout-log` on the user's Mac. Connect this folder to edit code directly.
- Deploy flow (no more tar files — edit files in place): `cd ~/workout-log` → `npm run build` → `git add -A && git commit -m "msg" && git push --force origin main`. Vercel auto-deploys from `main`. The user's local `npm run build` is the verification gate — sandbox builds die (memory limits); lint with `npx next lint --dir src` instead.
- User tests in dark theme, standalone PWA mode on iPhone. NOT Safari.
- Ask clarifying questions before building; give outline/options first; user picks. Iterate from his on-device screenshots.
- GORS brand colors: G=#4a9eff (blue), O=#f59e0b (orange/run color), R=#a855f7 (purple), S=#22c55e (green).

## Tech / infra
- Supabase URL: `https://nukygytvpwcrssuyyvmk.supabase.co`
- Anon key is hardcoded in `src/lib/supabase.js` (and in APPLE_HEALTH_SETUP.md). No auth/RLS anywhere — known accepted risk for a personal app.
- Repo: `https://github.com/crosbyf/workout-log.git`
- Tables: workouts, protein_entries, weight_entries, presets, exercises, settings, **health_daily** (new this session; created WITHOUT RLS like the others).

## Design language: "Athletic bold" (v13 redesign, user-approved)
- Dark theme = pure black `#000` bg, surfaces `#111113`, border `#232328`, dim `#6b6b73`, muted `#9a9aa3`. Defined in BOTH `src/hooks/useTheme.js` THEMES and `globals.css` :root — keep in sync.
- Only 3 themes now: dark="Black", ocean="Blue", light="White" (deliberately dimmed gray-white). Removed midnight/aurora/neon/forest.
- Card/item titles: uppercase, fontWeight 800, letterSpacing 0.04em, text-[13px].
- Section labels: uppercase, fontWeight 700, letterSpacing 0.15em, text-[10px], dim.
- Headline stats: white fontWeight-800 numbers with 3px GORS-color underline (see Home scoreboard).
- Active toggles/filters: rounded-full pill, accent bg, white text, uppercase 700.
- Card left color bars: w-1.5. Subtitles: single line, parts joined ' · ', truncate (never wrap).
- Home scoreboard: 2x2 grid (REPS/MILES/WORKOUTS/PROTEIN) with week-over-week delta sub-labels on THIS WEEK view. TIME cell was replaced by WORKOUTS.
- GORS header logo: bold colored letters (not blocks). BottomNav: accent pill around active icon.
- Home shows 4 recent workouts (was 5 — viewport height constraint with taller scoreboard).

## Sync architecture (significantly hardened this session)
- localStorage = cache, Supabase = source of truth. Hydrate-on-mount merges via refs (`workoutsRef`/`entriesRef`) so data created during the fetch window is never lost.
- **Pending queue** (`src/utils/pending.js`): every add/edit is marked pending until Supabase confirms; pending local versions WIN over remote during hydrate and get re-pushed. Fixes silent offline-edit reversion. Keys: workouts_pending, protein_pending, weight_pending.
- **Tombstones** (`src/utils/tombstones.js`, shared by useWorkouts/useProtein/useWeight): deleted IDs stored as {updatedAt, ids} in localStorage + settings table (keys deleted_workout_ids / deleted_protein_ids / deleted_weight_ids). Last-write-wins between devices; legacy plain arrays unioned. JSON import REMOVES tombstones for imported IDs (restores work). Hydrate retries remote deletes only for tombstoned IDs still present remotely.
- Duplicate detection fingerprint includes per-set reps + notes, so same-day same-preset sessions (GtG) survive; only identical content dedupes.
- useSettings filters out `deleted_*` and `diag_*` keys from app settings (prevents stale tombstone clobbering via force-push).
- Settings schema: `{ progressUI: false, proteinGoal: 0, archivedPresetIds: [] }`.

## Features added this session
- **Last-session ghosts**: WorkoutEntry computes per-exercise last session; ProgressExerciseCard shows "LAST: 8 · 8 · 7 · 6 (31)" + previous reps as input placeholders.
- **In-progress workout persistence**: entry state snapshots to localStorage key `inprogress_workout` (gated on first interaction); restored on launch as the minimized resume pill; timer restores paused at last elapsed; 24h expiry; cleared on save/discard. Survives iOS PWA eviction.
- **Protein goal**: Settings → Goals; Home card shows "129g / 180g" + progress bar + "Xg to go"/"Goal hit"; ProteinTracker header matches.
- **Preset reorder + archive**: up/down chevrons in PresetEditor; archive via `archivedPresetIds` setting (no schema change); archived presets in collapsed section, hidden from PresetSelector via `selectablePresets` useMemo in page.js (full presets array still flows everywhere else for color lookups).
- **WeightTracker polish**: smoothed SVG chart, gridlines, range pills (1M/3M/6M/ALL), emphasized latest point, per-entry deltas in history (down=green).
- **Apple Health (in progress, see below)**: `health_daily` table + `fetchHealthDaily` in sync.js + read-only `useHealthDaily` hook + Recovery StatCard/detail on Stats (hidden until data exists). Imported-run tolerance: `toNum()` in sync.js parses "3.42 mi" / "1,721" strings; pace auto-computed when missing.

## Rest timer system (v18–v18e)
- RestTimerBar (src/components/workout/RestTimerBar.js) below the WorkoutEntry header; state lives in WorkoutEntry (survives minimize). Auto-starts a wall-clock countdown when a set's reps changes to >0 (detection in handleExerciseUpdate via prevExercisesRef). Structure-aware durations per preset (localStorage 'rest_durations', presetName → {main, ex, round}; legacy number = main): standard/pairs use main (default 2:00) after every set; circuit uses ex (default 1:00) between exercises and round (default 2:00) when the LAST listed exercise is logged. Cycling pills (REST / EX+RND) step through 0:30–4:00. NEXT hint is structure-aware (pairs → pair partner; circuit → next station wrapping; standard → same exercise until done). GO flash (green, silent, ~4s) at zero; tap countdown to skip; pause clears countdown. Structure pills row hides once started (badge in bar instead); Pairs 3'/4'/5' buttons are metadata-only again.
- KEYBOARD: while the iOS keyboard is up, a condensed one-line bar pins to the visual viewport top (fixed wrapper + translate3d(vv.offsetTop), class .safe-top for the status bar). CRITICAL LESSON: keyboard detection MUST compare visualViewport.height against the MAX height ever seen, NOT window.innerHeight — in standalone/bookmark mode iOS shrinks innerHeight with the keyboard, so innerHeight-based detection silently never fires (this had broken the save-bar hiding for ages).

## Bugs fixed this session
Critical: hydrate race (stale closure) losing fresh entries; offline edits silently reverted; backup import permanently blocked by tombstones. Moderate: GtG same-day dedup data loss; protein/weight delete resurrection; protein "Today" UTC bug (evenings); service worker offline fallback (promise-truthiness) + cache bumped to gorslog-v2; tombstone write batching; settings pollution.

## Apple Health integration — ABANDONED (do not resurrect without asking)
The iOS Shortcuts approach was tried and ROLLED BACK: hand-building Shortcuts was too frustrating for the user, and the prebuilt-.shortcut-file path died because he couldn't run the `shortcuts sign` step on his machine. The shortcut file and APPLE_HEALTH_SETUP.md were deleted from the repo.
- What REMAINS (deliberately, dormant and invisible): the `health_daily` Supabase table (empty), `fetchHealthDaily` in sync.js, `useHealthDaily` hook, RecoveryStats + the Recovery card on Stats (renders only when health data exists), and tolerant run parsing (`toNum`/`computePace` in sync.js — harmless robustness).
- If the user ever wants Health data again: the path is the Health Auto Export iOS app (~$25, GUI-configured REST export) feeding the same `health_daily` table — likely needs a small payload-translation layer (Supabase Edge Function). The dormant app code would light up unchanged.

## Google Sheet sync (v17 — working, user-confirmed)
The user keeps a formatted Google Sheet ('Work' tab) of all workouts. The app now pushes strength workouts and day-offs (runs excluded) to it on save:
- App side: `src/lib/sheetSync.js` — localStorage queue ('sheet_queue') + flush; wired in page.js handleSaveWorkout (new saves only, not edits) and a launch-time retry. Webhook URL lives in settings `sheetWebhookUrl` (Settings → Integrations), empty = disabled. POSTs as text/plain (simple CORS request) with body {workouts:[...]}.
- Sheet side: `google-sheet-sync.gs` (repo root, source of truth) — Apps Script web app doPost: checks ?key= secret ('gors-x7k2-sheet'), LockService serialization, dedupes via Script Properties 'gors_imported_ids', writes blocks matching the user's manual scaffold (date merged/rotated in A, exercises in B with dropdown validation, sets C–F, =SUM in G, notes H, hidden K dates for his Dashboard, merged colored preset-name spacer row). Day-offs = single gray italic row, no K date.
- IMPORTANT: pull-from-Supabase does NOT work in Apps Script — Google's UrlFetchApp gets a DNS error for the project subdomain specifically (verified: google.com/example.com/supabase.co resolve, the project subdomain doesn't). Push architecture is the workaround; don't retry pulling.
- Sheet edits in app don't re-sync (sheet keeps original — accepted). Redeploying script changes requires a new web app deployment version.

## Deploy/verification state at handoff
- Deployed + user-confirmed: through v14 (sync fixes, full redesign, moderate bugs, Tier 1 features).
- v15 (preset reorder/archive, 3 themes, weight polish): delivered with deploy commands; deployment not explicitly confirmed.
- v16/v16a (health plumbing + Recovery card + tolerant run parsing) and v17 (sheet push sync): deployed; v17 confirmed working end-to-end by the user.
- Shortcut signing/install/test: pending on user.

## Remaining backlog (from full product audit, in priority order)
Tier 2: PR detection at save time + streak counter on Home; save-moment toast ("Garage A — 184 reps · 22:14") instead of teleporting to Log; sync status indicator (pending.js + isOnline() plumbing exists, zero UI).
Tier 3: GtG fast path (auto-start timer on first set input; skip save confirm when complete); backdate strength/day-off entries (runs can already); orphaned-preset Edit silently no-ops (page.js handleEditWorkout — synthesize preset from workout's own exercises); negative reps accepted; run PACE never shown in RunningStats.
Tier 4: JSON import replaces presets/protein/weight with no preview/confirm; exercises can't be renamed (typos fragment history); Exercises detail renders blank with 0 exercises; protein quick-add implemented 3 separate times; dead code (HomeTab.js, ExerciseCard.js unused).
Security (accepted, unaddressed): anon key ships client-side, full DB read/write/delete for anyone who finds it.

## Lessons learned (save yourself pain)
1. iOS PWA standalone ≠ Safari: scroll, keyboard, viewport (100dvh), localStorage persistence all differ. His quasi-standalone bookmark launch clips bottoms easily — content must fit the flex chain; measure header with getBoundingClientRect, never hardcode.
2. focus() only opens the iOS keyboard synchronously from a tap — the hidden proxy input pattern in WeeklyPulseHome exists for this. Don't touch it, the scroll choreography, z-index values, or safe-area handling during restyles.
3. Supabase jsonb auto-parses — typeof-check before JSON.parse.
4. The sandbox can't run `npm run build` (silently killed). Lint instead; the user's Mac build is the gate. Background processes don't survive bash calls; `pgrep -f` matches its own command line.
5. Visual changes: agents with strict "styling only, don't touch handlers/scroll/keyboard" constraints worked flawlessly across ~25 files. Verify with `git diff` grep for risky tokens.
6. Don't walk a non-developer through the Shortcuts editor in prose — generate the .shortcut file programmatically (plistlib; legacy format keys verified via shortcuts-js source) and have him sign it.
7. Themes live in TWO places: useTheme.js THEMES + globals.css :root defaults.
8. The user gives precise, actionable feedback from screenshots — show him things on-device early rather than perfecting blind.

## Z-index hierarchy (unchanged)
Header z-50 · Log sticky bar z-20 · DetailScreen 9980 · BottomNav 9990 · Resume pill 9989 · Protein overlay 10010/10011.
