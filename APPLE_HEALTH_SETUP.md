# Apple Health → GORS LOG Setup (v2)

Two pieces: an automation that fires when you finish a watch workout (imports runs instantly), and a daily Shortcut that pushes resting HR, HRV, and sleep. Nothing is sent except what these explicitly fetch.

---

## 30 seconds on how Shortcuts editing works

These instructions will make more sense with this in mind:

- You add actions by tapping the search bar at the bottom of the editor and typing a simple word ("text", "health", "format date"). Searching exact phrases often fails — shorter is better.
- Blue/colored words inside an action are tappable settings. "Find **All Health Samples** where" — tap the bold part to change it.
- When an instruction says insert a variable: tap where you want it (e.g., inside a Text box), and a bar appears above the keyboard with suggestions like `Repeat Item`, `Shortcut Input`, or "Select Variable". Tap the one you need.
- After inserting a variable pill, you can tap the pill itself to pick a sub-property (e.g., tap a workout pill → choose "Start Date") and set units or date formats.

If any step doesn't match your screen, stop and screenshot it — action names move around between iOS versions.

---

## Step 1 — Create the health table in Supabase (done ✓)

You've already run the SQL and chose "Run without RLS". Skip ahead.

---

## Common values for both Shortcuts

Every "Get Contents of URL" action gets these 4 headers (tap "Get Contents of URL" → expand the arrow → Headers → add each):

| Key | Value |
|---|---|
| `apikey` | the anon key below |
| `Authorization` | `Bearer ` + a space + the anon key |
| `Content-Type` | `application/json` |
| `Prefer` | `resolution=merge-duplicates` |

Anon key (one long line — easiest to email/AirDrop yourself and copy on the phone):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3lneXR2cHdjcnNzdXl5dm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzc0NzEsImV4cCI6MjA4ODA1MzQ3MX0.YXdi4yZ3blxxpeVvutDFQ5XMtUvVZuaMGgprkAVIXFs
```

`merge-duplicates` makes re-sends safe: the same row updates instead of duplicating.

---

## Step 2 — Run import: "When I finish a workout"

No "Find Workouts" action needed. We use an automation trigger that hands the finished workout straight to the Shortcut.

### 2a. Build the Shortcut

Shortcuts app → Shortcuts tab → **+** → rename it **GORS Run Import** (tap the name at top). Add these actions (search terms in quotes):

1. Search "**if**" → add **If**. Tap the first blue slot → choose **Shortcut Input**. Tap the Shortcut Input pill → a property list appears → choose **Activity Type**. Set the condition to **is** → **Running**.

   Everything below goes INSIDE the If (between "If" and "Otherwise"). Drag actions there if they land outside.

2. Search "**format date**" → add **Format Date**. Tap "Date" → Select Variable → **Shortcut Input** → tap the pill → property **Start Date**. Set Date Format: **Custom**, and type exactly: `yyyyMMdd-HHmm`
   → this is **RunID**.

3. Add another **Format Date**, same input (Shortcut Input → Start Date), Custom format: `yyyy-MM-dd`
   → this is **RunDate**.

4. Search "**time between**" → add **Get Time Between Dates**. First date: Shortcut Input → **Start Date**. Second date: Shortcut Input → **End Date**. Unit: **Seconds**.
   → this is **Seconds**.

5. Search "**round**" → add **Round Number**. Input: Select Variable → **Shortcut Input** → property **Distance** (tap the pill and check the unit shows **mi** — change it if it shows km). Round to: **2 decimal places** (tap "Round to Nearest" → choose decimal precision).
   → this is **Miles**.

6. Search "**text**" → add **Text**. Type this, inserting the variable pills where the brackets are (tap the spot, pick the variable from the bar above the keyboard):

   ```
   [{"id":"wh-RunID","date":"RunDate","location":"Run","structure":"standard","exercises":[{"_runMeta":true,"distance":Miles,"time":Seconds,"pace":null}],"elapsed_time":Seconds,"notes":"Apple Watch","is_day_off":false}]
   ```

   The words RunID, RunDate, Miles, Seconds should each be a variable pill, not typed text. Everything else (including all quotes and brackets) is typed literally. Seconds appears twice.

7. Search "**contents of url**" → add **Get Contents of URL**.
   - URL: `https://nukygytvpwcrssuyyvmk.supabase.co/rest/v1/workouts`
   - Tap the expand arrow: Method → **POST**
   - Headers: the 4 from the table above
   - Request Body: **File** → tap and choose the **Text** variable from action 6

8. Make sure actions 2–7 are inside the If's "is Running" branch, and the **Otherwise** branch is empty. Done — tap the name → Done.

### 2b. Create the automation

Automation tab → **+** → scroll to **Finish Workout** (may be labeled "When I finish a workout" / under Apple Watch). Choose **Run Immediately** (not "Run After Confirmation") → Next → pick **GORS Run Import**.

Now every watch workout you end triggers the Shortcut; only runs pass the If and get sent. Imported runs show up in GORS with distance, time, and pace (the app computes pace automatically).

---

## Step 3 — Daily health: "GORS Sync Health"

Shortcuts tab → **+** → name it **GORS Sync Health**.

1. Search "**format date**" → add **Format Date**. Date: **Current Date**. Custom format: `yyyy-MM-dd`
   → **Today**.

2. Search "**health**" → add **Find Health Samples** (it may display as "Find All Health Samples where"). Configure:
   - Tap **All Health Samples** → choose type **Resting Heart Rate**
   - Add Filter → **Start Date** → **is in the last** → **1 day**
   - Sort by: **Start Date**, Order: **Latest First**, Limit: ON, **Get 1 item**
   - First run will ask for Health permission — allow it.

3. Add **Round Number**, input = the Health Samples result from action 2.
   → **RHR**.

4. Repeat actions 2–3 with type **Heart Rate Variability SDNN**.
   → **HRV**.

5. Sleep — three identical blocks, one per stage. For each:
   - **Find Health Samples** → type **Sleep**. Add Filter → **Start Date** → in the last **18 hours**. Add a second filter if available: **Sleep Stage** (may be called "Value") → **is** → **Deep** (then **Core**, then **REM** in the other two blocks). If you can't find a stage filter, screenshot what filters you DO see and stop here.
   - Search "**statistics**" → add **Calculate Statistics**. Operation: **Sum**. Input: tap → Select Variable → the Find Health Samples result above → tap the pill → property **Duration** (minutes).
   - Add **Round Number** on the result.
   → **Deep**, **Core**, **REM**.

6. Search "**calculate**" → add **Calculate**: **Deep + Core** (tap each operand slot, Select Variable). Add a second **Calculate**: result **+ REM**.
   → **Total**.

7. Add **Text**:

   ```
   {"date":"Today","resting_hr":RHR,"hrv":HRV,"sleep_total_min":Total,"sleep_deep_min":Deep,"sleep_core_min":Core,"sleep_rem_min":REM}
   ```

   Again: the capitalized words are variable pills; all quotes/braces are typed.

8. Add **Get Contents of URL**:
   - URL: `https://nukygytvpwcrssuyyvmk.supabase.co/rest/v1/health_daily`
   - Method **POST**, the same 4 headers, Request Body: **File** → the Text variable.

### Automation

Automation tab → **+** → **Time of Day** → 9:00 AM, Daily → **Run Immediately** → pick **GORS Sync Health**.

---

## Step 4 — Test

1. Run **GORS Sync Health** manually (tap it). Grant every Health permission it requests. If it finishes without an error banner, force-close GORS LOG, reopen → Stats → a **Recovery** card should be there.
2. For runs: start any workout on your watch, let it run a minute, end it. The automation should fire within seconds. Check the GORS Log tab for the imported entry (it'll be a tiny "run" — delete it after, deletion is permanent thanks to tombstones).

## Troubleshooting

- Action search finds nothing → search a shorter word ("health", "text", "round"), or browse: bottom search bar → Categories.
- 404 from Get Contents of URL → table name typo in the URL, or the table wasn't created.
- 401 → header problem; re-check `apikey` and that `Authorization` is the word Bearer + space + key.
- Find Health Samples returns nothing → Settings → Privacy & Security → Health → Shortcuts → turn on the data types.
- Automation didn't fire after a workout → check it's set to Run Immediately, and that the workout was actually ended (not just paused).
- Wrong run duration in the app → action 4 in Step 2a is measuring Minutes instead of Seconds.
