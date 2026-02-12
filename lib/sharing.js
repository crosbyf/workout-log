function getDayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
}

export async function copyToSheets(workout) {
  const lines = [];
  const [year, month, day] = workout.date.split('-');
  const dateFormatted = `${parseInt(month)}-${parseInt(day)}-${year}`;
  const dayOfWeek = getDayOfWeek(workout.date);
  const headerDate = dateFormatted + '-' + dayOfWeek;

  if (workout.exercises && workout.exercises.length > 0) {
    workout.exercises.forEach((exercise, index) => {
      const set1 = exercise.sets && exercise.sets[0] ? exercise.sets[0] : '';
      const set2 = exercise.sets && exercise.sets[1] ? exercise.sets[1] : '';
      const set3 = exercise.sets && exercise.sets[2] ? exercise.sets[2] : '';
      const set4 = exercise.sets && exercise.sets[3] ? exercise.sets[3] : '';
      const total = exercise.total || '';
      let notes = exercise.notes || '';
      if (exercise.weight) {
        notes = (notes ? exercise.weight + ' ' + notes : exercise.weight);
      }

      if (index === 0) {
        const line = headerDate + '\t' + exercise.name + '\t' + set1 + '\t' + set2 + '\t' + set3 + '\t' + set4 + '\t' + total + '\t' + notes;
        lines.push(line);
      } else {
        const line = '\t' + exercise.name + '\t' + set1 + '\t' + set2 + '\t' + set3 + '\t' + set4 + '\t' + total + '\t' + notes;
        lines.push(line);
      }
    });
  }

  let locationNotes = workout.location || '';
  if (workout.notes) {
    locationNotes = (locationNotes ? locationNotes + ' ' + workout.notes : workout.notes);
  }
  const footerLine = '\tLocation\t\t\t\t\t\t' + locationNotes;
  lines.push(footerLine);

  const content = lines.join('\n');

  try {
    await navigator.clipboard.writeText(content);
    return Promise.resolve();
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return Promise.reject(err);
  }
}

export async function shareWorkout(workout) {
  const lines = [];
  const [year, month, day] = workout.date.split('-');
  const dateFormatted = `${parseInt(month)}-${parseInt(day)}-${year}`;

  lines.push('Workout: ' + dateFormatted);
  lines.push('');

  if (workout.exercises && workout.exercises.length > 0) {
    workout.exercises.forEach((exercise) => {
      let exerciseLine = exercise.name;
      const sets = [];
      if (exercise.sets) {
        exercise.sets.forEach((set) => {
          if (set) {
            sets.push(set + 'x');
          }
        });
      }
      if (sets.length > 0) {
        exerciseLine = exerciseLine + ': ' + sets.join(', ');
      }
      if (exercise.weight) {
        exerciseLine = exerciseLine + ' @ ' + exercise.weight;
      }
      if (exercise.notes) {
        exerciseLine = exerciseLine + ' (' + exercise.notes + ')';
      }
      lines.push(exerciseLine);
    });
  } else if (workout.isRestDay) {
    lines.push('Rest Day');
  }

  lines.push('');
  if (workout.location) {
    lines.push('Location: ' + workout.location);
  }
  if (workout.notes) {
    lines.push('Notes: ' + workout.notes);
  }

  const text = lines.join('\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Workout',
        text: text,
      });
      return Promise.resolve();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        return Promise.reject(err);
      }
      return Promise.resolve();
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      return Promise.resolve();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return Promise.reject(err);
    }
  }
}
