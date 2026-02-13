function parseDate(str) {
  if (!str) return '';
  const parts = str.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return str;
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
  const lines = fileContent.split('\n').map((line) => line.trim()).filter((line) => line);
  const workouts = [];
  let currentWorkout = null;
  let locationName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',').map((p) => p.trim());

    if (parts.length === 0 || !parts[0]) {
      if (i === 0) {
        locationName = parts[1] || '';
      }
      continue;
    }

    const hasDate = /^\d{1,2}-\d{1,2}-\d{4}$/.test(parts[0]);

    if (hasDate) {
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      const parsedDate = parseDate(parts[0]);
      const exerciseName = parts[1] || '';

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
          const exercise = {
            id: Date.now() + Math.random(),
            name: exerciseName,
            sets: [parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || ''],
            total: parts[6] || '',
            notes: parts[7] || '',
            weight: '',
          };
          currentWorkout.exercises.push(exercise);
        }
      }
    } else if (currentWorkout && parts[1]) {
      const exerciseName = parts[1];
      const exercise = {
        id: Date.now() + Math.random(),
        name: exerciseName,
        sets: [parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || ''],
        total: parts[6] || '',
        notes: parts[7] || '',
        weight: '',
      };
      currentWorkout.exercises.push(exercise);
    } else if (currentWorkout && !parts[1]) {
      if (parts[0]) {
        currentWorkout.location = parts[0];
      }
      if (parts[7]) {
        currentWorkout.notes = parts[7];
      }
    }
  }

  if (currentWorkout) {
    workouts.push(currentWorkout);
  }

  return workouts;
}
