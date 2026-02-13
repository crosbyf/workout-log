export function exportWorkoutsCSV(workouts) {
  const lines = [];

  workouts.forEach((workout) => {
    const dateStr = workout.date;
    const [year, month, day] = dateStr.split('-');
    const formattedDate = `${parseInt(month)}-${parseInt(day)}-${year}`;

    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises.forEach((exercise, index) => {
        // Read set data from exercise.sets objects { reps, weight }
        const set1 = exercise.sets && exercise.sets[0]?.reps ? exercise.sets[0].reps : '';
        const set2 = exercise.sets && exercise.sets[1]?.reps ? exercise.sets[1].reps : '';
        const set3 = exercise.sets && exercise.sets[2]?.reps ? exercise.sets[2].reps : '';
        const set4 = exercise.sets && exercise.sets[3]?.reps ? exercise.sets[3].reps : '';
        const total = exercise.total || '';
        let notes = exercise.notes || '';
        if (exercise.weight) {
          notes = (notes ? exercise.weight + ' ' + notes : exercise.weight);
        }
        const dateCol = index === 0 ? formattedDate : '';
        const line = dateCol + ',' + exercise.name + ',' + set1 + ',' + set2 + ',' + set3 + ',' + set4 + ',' + total + ',' + notes;
        lines.push(line);
      });
    }

    let locationNotes = workout.location || '';
    if (workout.notes) {
      locationNotes = (locationNotes ? locationNotes + ' ' + workout.notes : workout.notes);
    }
    const footerLine = ',' + locationNotes;
    lines.push(footerLine);
  });

  return lines.join('\n');
}

export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
