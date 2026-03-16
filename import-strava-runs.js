/**
 * GORS LOG — Strava Run Importer
 *
 * Run from ~/workout-log with:
 *   node import-strava-runs.js
 *
 * This script:
 * 1. Reads parsed Strava run data from strava-runs.json
 * 2. Fetches existing runs from Supabase to avoid duplicates
 * 3. Inserts new runs matching the GORS LOG workout format
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://nukygytvpwcrssuyyvmk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3lneXR2cHdjcnNzdXl5dm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzc0NzEsImV4cCI6MjA4ODA1MzQ3MX0.YXdi4yZ3blxxpeVvutDFQ5XMtUvVZuaMGgprkAVIXFs';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}_${timestamp}_${random}`;
}

// Small delay to ensure unique timestamps in IDs
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  // 1. Load Strava runs
  const jsonPath = path.join(__dirname, 'strava-runs.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('ERROR: strava-runs.json not found in', __dirname);
    console.error('Make sure the file is in the same folder as this script.');
    process.exit(1);
  }
  const stravaRuns = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${stravaRuns.length} Strava runs to import`);

  // 2. Fetch existing runs from Supabase for dedup
  console.log('Checking for existing runs in Supabase...');
  const { data: existingWorkouts, error: fetchError } = await supabase
    .from('workouts')
    .select('id, date, exercises, elapsed_time')
    .order('date', { ascending: true });

  if (fetchError) {
    console.error('ERROR fetching existing workouts:', fetchError.message);
    process.exit(1);
  }

  // Find existing runs by date+distance fingerprint
  const existingRunFingerprints = new Set();
  let existingRunCount = 0;
  for (const w of existingWorkouts) {
    const exercises = w.exercises || [];
    for (const ex of exercises) {
      if (ex && ex._runMeta) {
        existingRunCount++;
        // Fingerprint: date + rounded distance
        const fp = `${w.date}_${Math.round(ex.distance * 100)}`;
        existingRunFingerprints.add(fp);
      }
    }
  }
  console.log(`Found ${existingRunCount} existing runs in database`);

  // 3. Filter out duplicates
  const newRuns = [];
  const skipped = [];
  for (const run of stravaRuns) {
    const fp = `${run.date}_${Math.round(run.distance * 100)}`;
    if (existingRunFingerprints.has(fp)) {
      skipped.push(run);
    } else {
      newRuns.push(run);
      // Add to fingerprints to catch same-day same-distance Strava dupes
      existingRunFingerprints.add(fp);
    }
  }

  if (skipped.length > 0) {
    console.log(`Skipping ${skipped.length} duplicate runs:`);
    for (const s of skipped) {
      console.log(`  ${s.date}  ${s.distance} mi  (${s.name})`);
    }
  }

  if (newRuns.length === 0) {
    console.log('\nNo new runs to import. All runs already exist in the database.');
    return;
  }

  console.log(`\nImporting ${newRuns.length} new runs...`);

  // 4. Build workout rows
  const rows = [];
  for (let i = 0; i < newRuns.length; i++) {
    const run = newRuns[i];
    const id = generateId('w');

    rows.push({
      id,
      date: run.date,
      location: 'Run',
      structure: 'standard',
      structure_duration: null,
      exercises: [{ _runMeta: true, distance: run.distance, time: run.time, pace: run.pace }],
      elapsed_time: run.time,
      notes: run.name || '',
      is_day_off: false,
    });

    // Small delay to ensure unique IDs
    if (i < newRuns.length - 1) {
      await sleep(2);
    }
  }

  // 5. Upsert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('workouts').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`ERROR inserting batch ${Math.floor(i/BATCH_SIZE) + 1}:`, error.message);
      console.error('Stopping. Successfully imported', inserted, 'runs before error.');
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${rows.length}...`);
  }

  console.log(`\nDone! Successfully imported ${inserted} runs.`);
  console.log('Open GORS LOG and pull from cloud (Settings > Data Management > Pull from Cloud) to see them.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
