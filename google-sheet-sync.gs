/**
 * GORS LOG → Google Sheet sync (v2 — push receiver).
 *
 * The app POSTs workouts here the moment you save them; this web app writes
 * them into 'Work' in your existing scaffold format. No outbound fetching
 * (Google's fetcher can't resolve your Supabase subdomain — known quirk).
 *
 * SETUP:
 *   1. DELETE all previous GORS code from your script (everything below your
 *      original onEdit/logProtein/backfillDates), then paste this whole file.
 *      Keep ONE onOpen total — use the one in this file.
 *   2. Set GORS_SPREADSHEET_ID below: it's the long id in your sheet's URL,
 *      docs.google.com/spreadsheets/d/THIS_PART/edit
 *   3. Clock icon (Triggers) in the left sidebar → if an hourly
 *      "syncFromGors" trigger exists from the old version, delete it.
 *   4. Deploy → New deployment → gear icon → Web app →
 *      Execute as: Me · Who has access: Anyone → Deploy → copy the URL.
 *   5. In GORS LOG: Settings → Integrations → paste that URL with the key
 *      appended:   <web app URL>?key=gors-x7k2-sheet
 *
 * After that, every strength workout or day off you save in the app appears
 * in the sheet within seconds. Re-sends can't duplicate (dedupe by id).
 */

const GORS_SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
const GORS_SECRET = 'gors-x7k2-sheet';
const GORS_SHEET_NAME = 'Work';
const GORS_INSERT_ROW = 3;
const GORS_HIDDEN_DATE_COL = 11; // column K, used by Dashboard queries
const GORS_LAST_COL = 14;
const GORS_MAX_SET_COLS = 4; // columns C–F

// Background for the merged preset-name cell. Tweak hexes to taste;
// names not listed get no background.
const GORS_PRESET_COLORS = {
  'BW-Only.1': '#d9d2e9',
  'Garage A.1': '#b7e1cd',
  'Garage B.1': '#a4c2f4',
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Log')
    .addItem('Log Protein', 'logProtein')
    .addToUi();
}

/** Receives workouts pushed by the GORS app. */
function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.key !== GORS_SECRET) {
      return gorsJson_({ ok: false, error: 'unauthorized' });
    }

    // Serialize concurrent pushes so two saves can't interleave row inserts
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const payload = JSON.parse(e.postData.contents);
      const workouts = payload.workouts || [];

      const props = PropertiesService.getScriptProperties();
      const imported = JSON.parse(props.getProperty('gors_imported_ids') || '[]');
      const importedSet = {};
      imported.forEach(function (id) { importedSet[id] = true; });

      const ss = SpreadsheetApp.openById(GORS_SPREADSHEET_ID);
      const sheet = ss.getSheetByName(GORS_SHEET_NAME);
      const dropdownRange = ss.getSheetByName('Exercise Reference').getRange('A2:A');
      const dropdownRule = SpreadsheetApp.newDataValidation()
        .requireValueInRange(dropdownRange, true)
        .setAllowInvalid(false)
        .build();

      // Runs excluded; oldest first so the newest block lands on top
      const fresh = workouts
        .filter(function (w) { return w && w.id && !importedSet[w.id]; })
        .filter(function (w) { return !w.isRun; })
        .sort(function (a, b) { return a.date < b.date ? -1 : 1; });

      fresh.forEach(function (w) {
        if (w.isDayOff) {
          gorsWriteDayOffRow_(sheet, w);
        } else {
          gorsWriteWorkoutBlock_(sheet, w, dropdownRule);
        }
        imported.push(w.id);
      });

      props.setProperty('gors_imported_ids', JSON.stringify(imported.slice(-1000)));
      return gorsJson_({ ok: true, imported: fresh.length });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return gorsJson_({ ok: false, error: String(err) });
  }
}

function gorsJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 'YYYY-MM-DD' → local Date at midnight (avoids UTC off-by-one). */
function gorsParseDate_(str) {
  const p = String(str).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

/** Trim trailing commas/space from app exercise notes. */
function gorsCleanNote_(s) {
  return (s || '').replace(/,+\s*$/g, '').trim();
}

/**
 * Day off: one compact row — date in A, "Day Off" merged in C:G, note in H,
 * bottom border. No hidden K date (K drives Dashboard exercise queries).
 */
function gorsWriteDayOffRow_(sheet, workout) {
  const date = gorsParseDate_(workout.date);
  sheet.insertRowsBefore(GORS_INSERT_ROW, 1);
  const row = GORS_INSERT_ROW;

  sheet.getRange(row, 2).clearDataValidations();

  const dateCell = sheet.getRange(row, 1);
  dateCell.setValue(date);
  dateCell.setNumberFormat('MM-dd-yyyy');
  dateCell.setHorizontalAlignment('center');
  dateCell.setVerticalAlignment('middle');
  dateCell.setBackground('#eeeeee');

  const label = sheet.getRange(row, 3, 1, 5);
  label.merge();
  label.setValue('Day Off');
  label.setHorizontalAlignment('center');
  label.setVerticalAlignment('middle');
  label.setFontStyle('italic');
  label.setFontColor('#999999');

  if (workout.notes) sheet.getRange(row, 8).setValue(workout.notes);

  sheet.getRange(row, 1, 1, GORS_LAST_COL).setBorder(
    false, false, true, false, false, false,
    'black', SpreadsheetApp.BorderStyle.SOLID
  );
}

/**
 * Writes one workout block at the top of the sheet, mirroring the manual
 * A1-dropdown scaffold: exercise rows (A date, B name+dropdown, C–F sets,
 * G SUM formula, H notes, K hidden date), then the spacer row with the
 * merged bold preset name in C:G and the workout note in H.
 */
function gorsWriteWorkoutBlock_(sheet, workout, dropdownRule) {
  const exercises = workout.exercises || [];
  const date = gorsParseDate_(workout.date);
  const numberOfInsertRows = exercises.length + 1;
  const spacerRow = GORS_INSERT_ROW + exercises.length;

  sheet.insertRowsBefore(GORS_INSERT_ROW, numberOfInsertRows);

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const row = GORS_INSERT_ROW + i;

    sheet.getRange(row, 1).setValue(date);
    sheet.getRange(row, 2).setValue(ex.name || '').setDataValidation(dropdownRule);

    // Set values into C–F; anything beyond 4 sets is appended to the note
    const reps = (ex.sets || [])
      .map(function (s) { return s && s.reps; })
      .filter(function (r) { return typeof r === 'number' && r > 0; });
    for (let c = 0; c < Math.min(reps.length, GORS_MAX_SET_COLS); c++) {
      sheet.getRange(row, 3 + c).setValue(reps[c]);
    }

    sheet.getRange(row, 7).setFormula('=SUM(C' + row + ':F' + row + ')');

    let note = gorsCleanNote_(ex.notes);
    if (reps.length > GORS_MAX_SET_COLS) {
      const extra = 'sets 5+: ' + reps.slice(GORS_MAX_SET_COLS).join(', ');
      note = note ? note + ' · ' + extra : extra;
    }
    if (note) sheet.getRange(row, 8).setValue(note);

    sheet.getRange(row, GORS_HIDDEN_DATE_COL).setValue(date); // Dashboard queries
  }

  // Spacer row: no dropdown, merged preset name in C:G, workout note in H
  sheet.getRange(spacerRow, 2).clearDataValidations();

  const mergedRange = sheet.getRange(spacerRow, 3, 1, 5);
  mergedRange.merge();
  mergedRange.setValue(workout.location || 'Workout');
  mergedRange.setHorizontalAlignment('center');
  mergedRange.setVerticalAlignment('middle');
  mergedRange.setFontWeight('bold');
  const bg = GORS_PRESET_COLORS[workout.location];
  if (bg) mergedRange.setBackground(bg);

  if (workout.notes) sheet.getRange(spacerRow, 8).setValue(workout.notes);

  // Merged, rotated date cell down column A
  const dateRange = sheet.getRange(GORS_INSERT_ROW, 1, numberOfInsertRows, 1);
  dateRange.breakApart();
  dateRange.clearContent();
  dateRange.clearFormat();
  dateRange.merge();
  dateRange.setBorder(false, false, true, false, false, false, 'black', SpreadsheetApp.BorderStyle.SOLID);

  const dateCell = sheet.getRange(GORS_INSERT_ROW, 1);
  dateCell.setValue(date);
  dateCell.setNumberFormat('MM-dd-yyyy');
  dateCell.setVerticalAlignment('middle');
  dateCell.setHorizontalAlignment('center');
  dateCell.setTextRotation(90);
  dateCell.setBackground('#eeeeee');

  // Bottom border across the whole spacer row
  sheet.getRange(spacerRow, 1, 1, GORS_LAST_COL).setBorder(
    false, false, true, false, false, false,
    'black', SpreadsheetApp.BorderStyle.SOLID
  );
}
