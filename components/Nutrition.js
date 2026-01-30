// This file handles all the 'Math' for your Protein Tracker
export const NutritionLogic = {
  // Calculates total protein for a specific date
  getDayTotal: (entries, targetDate) => {
    return entries
      .filter(entry => entry.date === targetDate)
      .reduce((sum, entry) => sum + (parseFloat(entry.grams) || 0), 0);
  },

  // Groups entries by day for the 14-day list view
  getHistory: (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });
    return grouped;
  },

  // Formats the protein display for the Workout Cards (e.g. "127g")
  formatDisplay: (grams) => {
    return grams > 0 ? `${Math.round(grams)}g` : null;
  }
};
