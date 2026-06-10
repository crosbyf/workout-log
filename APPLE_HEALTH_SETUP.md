# Apple Health → GORS LOG Setup

Two iOS Shortcuts push Apple Watch data into your Supabase database on a daily schedule. The app reads it like any other synced data. Nothing is sent except what these Shortcuts explicitly fetch.

Total setup time: ~20 minutes, all on your iPhone except Step 1.

---

## Step 1 — Create the health table in Supabase (on your computer)

1. Go to https://supabase.com/dashboard and open your project (`nukygytvpwcrssuyyvmk`).
2. Left sidebar → **SQL Editor** → **New query**.
3. Paste this and click **Run**:

```sql
create table if not exists health_daily (
  date text primary key,
  resting_hr numeric,
  hrv numeric,
  workout_avg_hr numeric,
  workout_max_hr numeric,
  sleep_total_min numeric,
  sleep_core_min numeric,
  sleep_deep_min numeric,
  sleep_rem_min numeric,
  sleep_awake_min numeric,
  bed_time text,
  wake_time text,
  updated_at timestamptz default now()
);
```

If Supabase warns that "RLS is disabled" — that matches how your other tables are set up, so it's expected.

---

## Common values (used in both Shortcuts)

**Headers** for every "Get Contents of URL" action (4 headers):

| Header | Value |
|---|---|
| `apikey` | (your anon key — see below) |
| `Authorization` | `Bearer ` followed by the same anon key |
| `Content-Type` | `application/json` |
| `Prefer` | `resolution=merge-duplicates` |

**Anon key** (one long line, no spaces):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3lneXR2cHdjcnNzdXl5dm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzc0NzEsImV4cCI6MjA4ODA1MzQ3MX0.YXdi4yZ3blxxpeVvutDFQ5XMtUvVZuaMGgprkAVIXFs
```

This is the same key the app already uses — putting it in a Shortcut adds no new exposure.

`Prefer: resolution=merge-duplicates` makes re-runs safe: sending the same row twice updates instead of duplicating.

---

## Step 2 — Shortcut A: "GORS Sync Runs"

Auto-imports watch-recorded runs as GORS run entries.

Open the **Shortcuts** app → **+** → name it **GORS Sync Runs**. Add these actions in order:

1. **Find Workouts** (search "find workouts" in the action search)
   - Add Filter: **Activity Type** is **Running**
   - Add Filter: **Start Date** is **in the last 2 days**
   - The first time you run it, iOS asks for Health access — allow Workouts.

2. **Repeat with Each** (drag the Workouts result in as input). Inside the repeat:

   a. **Format Date** — input: *Repeat Item → Start Date*, Date Format: **Custom**, string: `yyyyMMdd-HHmm` (call this **RunID**)

   b. **Format Date** — input: *Repeat Item → Start Date*, Custom: `yyyy-MM-dd` (call this **RunDate**)

   c. **Get Time Between Dates** — From: *Repeat Item → Start Date*, To: *Repeat Item → End Date*, In: **Seconds** (call this **Seconds**; use **Round Number** on it if it shows decimals)

   d. **Round Number** — input: *Repeat Item → Distance* (tap the variable → make sure the unit is **Miles**), round to **2** decimal places (call this **Miles**)

   e. **Text** — paste this, then replace the bracketed parts with the magic variables from above:

   ```
   [{"id":"wh-[RunID]","date":"[RunDate]","location":"Run","structure":"standard","exercises":[{"_runMeta":true,"distance":[Miles],"time":[Seconds],"pace":null}],"elapsed_time":[Seconds],"notes":"Apple Watch","is_day_off":false}]
   ```

   f. **Get Contents of URL**
      - URL: `https://nukygytvpwcrssuyyvmk.supabase.co/rest/v1/workouts`
      - Method: **POST**
      - Headers: the 4 from the table above
      - Request Body: **File** → choose the **Text** variable from step (e)

Notes: the ID is built from the run's start time, so re-running the Shortcut updates rather than duplicates. Pace is computed by the app automatically. If you also want walks or hikes imported, duplicate the Shortcut and change the Activity Type filter.

---

## Step 3 — Shortcut B: "GORS Sync Health"

Pushes one row per day: resting heart rate, HRV, and last night's sleep stages.

New Shortcut → name it **GORS Sync Health**. Actions in order:

1. **Format Date** — input: **Current Date**, Custom: `yyyy-MM-dd` (call this **Today**)

2. **Find Health Samples** — Type: **Resting Heart Rate**, filter **Start Date in the last 1 day**, Sort by **Start Date**, Order **Latest First**, **Limit 1**. Then add **Round Number** on the result (call it **RHR**). Allow Health access when prompted.

3. **Find Health Samples** — Type: **Heart Rate Variability SDNN**, same filters/sort/limit. **Round Number** → (**HRV**)

4. Sleep stages — three nearly identical pairs. For each stage:
   - **Find Health Samples** — Type: **Sleep**, filter **Start Date in the last 18 hours**, and add filter **Value is Asleep – Deep** (then Core, then REM for the other two)
   - **Calculate Statistics** — Operation: **Sum**, input: the samples' **Duration** (tap the input → select the Find result → choose Duration; unit minutes)
   - **Round Number** each → (**Deep**, **Core**, **REM**)

5. **Calculate** — Deep + Core + REM → (**Total**)

6. **Text**:

   ```
   {"date":"[Today]","resting_hr":[RHR],"hrv":[HRV],"sleep_total_min":[Total],"sleep_deep_min":[Deep],"sleep_core_min":[Core],"sleep_rem_min":[REM]}
   ```

7. **Get Contents of URL**
   - URL: `https://nukygytvpwcrssuyyvmk.supabase.co/rest/v1/health_daily`
   - Method: **POST**, the same 4 headers, Request Body: **File** → the Text variable

Notes: the row's date is the morning you woke up. Bed/wake times and workout heart rate are optional later additions — the table already has columns for them. If a value is missing on some day (e.g., didn't wear the watch overnight), that field just stays empty and the app skips it.

---

## Step 4 — Make them run automatically

In Shortcuts → **Automation** tab → **+**:

1. **Time of Day** → 9:00 AM, Daily → Run **GORS Sync Health** → select **Run Immediately** (so it doesn't ask each time).
2. Repeat for **GORS Sync Runs** (same time is fine).

The phone runs these in the background each morning. If the phone is off at 9 AM, that day's data syncs the next morning (the runs Shortcut looks back 2 days for exactly this reason).

---

## Step 5 — Test

1. Run **GORS Sync Health** manually once (tap it in Shortcuts). Grant all Health permissions it asks for.
2. Run **GORS Sync Runs** manually (it does something only if you recorded a watch run in the last 2 days).
3. Force-close GORS LOG and reopen → Stats tab → a **Recovery** card should appear with your resting HR. Tap it for sleep stages and trends. Imported runs appear in the Log like any other run.

## Troubleshooting

- Get Contents of URL shows a 404 → the `health_daily` table wasn't created (Step 1).
- 401 error → a header is wrong; re-check `apikey` and `Authorization` (the word `Bearer`, a space, then the key).
- Empty results from Find Health Samples → Shortcuts wasn't granted Health access: iPhone Settings → Privacy & Security → Health → Shortcuts → enable the data types.
- Run shows but with wrong duration → check Step 2c is measuring in Seconds, not Minutes.
