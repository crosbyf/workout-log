function parseDate(str) {
  if (!str) return '';
  const parts = str.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return str;
}

/**
 * Parse a CSV line handling quoted fields with commas and escaped quotes
 * Handles RFC 4180 CSV format: quotes can contain commas, escaped as ""
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" becomes "
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator (only outside quotes)
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

export function importPresetsFromCSV(fileContent) {
  const lines = fileContent.split('\n').filter((line) => line.trim());
  const presets = [];
  const exercises = new Set();

  lines.forEach((line) => {
    const parts = line.split(',').map((p) => p.trim()).filter((p) => p);
    if (parts.length > 0) {
      const presetName = parts[0];
      const presetExercises = parts.slice(1);

      if (presetName && presetExercises.length > 0) {
        presets.push({
          id: Date.now() + Math.random(),
          name: presetName,
          exercises: presetExercises,
          color: 'Blue',
        });

        presetExercises.forEach((ex) => {
          exercises.add(ex);
        });
      }
    }
  });

  return {
    presets,
    exercises: Array.from(exercises),
  };
}

export function importWorkoutsFromCSV(fileContent) {
  const lines = fileContent.split('\n');
  const workouts = [];
  let currentWorkout = null;
  let locationName = '';

  // Skip first 2 lines (junk and headers)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line || !line.trim()) {
      continue;
    }

    // Parse the line using proper CSV parser
    const parts = parseCSVLine(line);

    // Check if this is an exercise row (has a date) or continuation row
    const hasDate = /^\d{1,2}-\d{1,2}-\d{4}$/.test(parts[0]?.trim());

    if (hasDate) {
      // New workout - save previous if exists
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }

      const parsedDate = parseDate(parts[0]?.trim());
      const exerciseName = (parts[1] || '').trim();

      if (exerciseName.toLowerCase() === 'day off') {
        currentWorkout = {
          id: Date.now() + Math.random(),
          date: parsedDate,
          exercises: [],
          isRestDay: true,
          location: locationName || '',
          notes: '',
        };
        workouts.push(currentWorkout);
        currentWorkout = null;
      } else {
        currentWorkout = {
          id: Date.now() + Math.random(),
          date: parsedDate,
          exercises: [],
          isRestDay: false,
          location: locationName || '',
          notes: '',
        };

        if (exerciseName) {
          const exercise = createExerciseObject(exerciseName, parts);
          currentWorkout.exercises.push(exercise);
        }
      }
    } else if (currentWorkout && (parts[1] || '').trim()) {
      // Continuation exercise (no date, but has exercise name at index 1)
      const exerciseName = (parts[1] || '').trim();
      const exercise = createExerciseObject(exerciseName, parts);
      currentWorkout.exercises.push(exercise);
    } else if (currentWorkout && !(parts[1] || '').trim()) {
      // Footer row: location at index 2, notes at index 7
      if ((parts[2] || '').trim()) {
        currentWorkout.location = (parts[2] || '').trim();
      }
      if ((parts[7] || '').trim()) {
        currentWorkout.notes = (parts[7] || '').trim();
      }
    }
  }

  // Save final workout if exists
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }

  return workouts;
}

/**
 * Create an exercise object from CSV row data
 * Converts set values to proper object format: { reps, weight }
 */
function createExerciseObject(exerciseName, parts) {
  const sets = [];

  // Parse sets from columns 2-5 (indices 2, 3, 4, 5)
  for (let i = 2; i <= 5; i++) {
    const value = (parts[i] || '').trim();
    if (value) {
      sets.push({
        reps: value,
        weight: null,
      });
    }
  }

  return {
    id: Date.now() + Math.random(),
    name: exerciseName,
    sets: sets,
    notes: (parts[7] || '').trim(),
    weight: '',
  };
}
