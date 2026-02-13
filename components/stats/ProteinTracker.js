import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useTrackingStore } from '../../stores/trackingStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { getTodayDate } from '../../lib/formatting';
import BottomSheet from '../modals/BottomSheet';

export default function ProteinTracker() {
  const { getCurrentTheme } = useThemeStore();
  const { setStatsView, showAddProtein, editingProteinDate, expandedProteinDays, toggleProteinDay, openModal, closeModal } = useUIStore();
  const { proteinEntries, addProteinEntry, updateProteinEntry, deleteProteinEntry } = useTrackingStore();
  const currentTheme = getCurrentTheme();

  const [grams, setGrams] = useState('');
  const [food, setFood] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editGrams, setEditGrams] = useState('');
  const [editFood, setEditFood] = useState('');

  // Get last 30 days
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  }, []);

  // Get entries by date
  const entriesByDate = useMemo(() => {
    const grouped = {};
    last30Days.forEach((date) => {
      grouped[date] = [];
    });

    proteinEntries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      if (grouped[entryDate]) {
        grouped[entryDate].push(entry);
      }
    });

    // Sort entries within each day by timestamp
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.timestamp - b.timestamp);
    });

    return grouped;
  }, [proteinEntries, last30Days]);

  // Add protein entry
  const handleAddProtein = () => {
    if (!grams || !food) {
      alert('Please fill in grams and food');
      return;
    }

    addProteinEntry({
      date: getTodayDate(),
      grams: parseFloat(grams),
      food,
      timestamp: Date.now(),
    });

    setGrams('');
    setFood('');
    closeModal('addProtein');
  };

  // Update protein entry
  const handleUpdateProteinEntry = () => {
    if (!editGrams || !editFood) {
      alert('Please fill in grams and food');
      return;
    }

    updateProteinEntry(editingEntry.timestamp, {
      grams: parseFloat(editGrams),
      food: editFood,
    });

    setEditingEntry(null);
    setEditGrams('');
    setEditFood('');
    closeModal('editingProteinEntry');
  };

  // Delete entry
  const handleDeleteEntry = (timestamp) => {
    if (confirm('Delete this entry?')) {
      deleteProteinEntry(timestamp);
    }
  };

  // Get day label
  const getDayLabel = (dateStr) => {
    const today = getTodayDate();
    if (dateStr === today) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === yesterdayStr) return 'Yesterday';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get total for date
  const getTotalForDate = (dateStr) => {
    return entriesByDate[dateStr]?.reduce((sum, entry) => sum + (entry.grams || 0), 0) || 0;
  };

  // getTodayDate imported from lib/formatting

  return (
    <div className={`pb-20 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Back Button */}
      <button
        onClick={() => setStatsView('menu')}
        className={`flex items-center gap-2 mb-6 font-semibold ${currentTheme.text} px-4 pt-4`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 mb-6 px-4">
        <span className="text-3xl">🥩</span>
        <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Protein Intake</h2>
      </div>

      {/* Add Protein Button - Full width */}
      <button
        onClick={() => openModal('addProtein')}
        className="w-full mx-4 mb-6 px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
      >
        <Plus size={20} className="inline mr-2" />
        Add Protein
      </button>

      {/* 30-Day List */}
      <div className="space-y-3 px-4">
        {last30Days.map((dateStr) => {
          const isExpanded = expandedProteinDays.includes(dateStr);
          const isToday = dateStr === getTodayDate();
          const total = getTotalForDate(dateStr);
          const entries = entriesByDate[dateStr] || [];
          const mealCount = entries.length;

          return (
            <div
              key={dateStr}
              className={`rounded-xl overflow-hidden ${currentTheme.cardBg}`}
              style={{ backgroundColor: currentTheme.rawCardBg }}
            >
              {/* Day Header */}
              <button
                onClick={() => !isToday && toggleProteinDay(dateStr)}
                className={`w-full p-4 flex items-center justify-between ${isExpanded || isToday ? 'border-b' : ''}`}
                style={{ borderColor: isExpanded || isToday ? currentTheme.rawCardBorder : 'transparent' }}
              >
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${currentTheme.text}`}>
                    {getDayLabel(dateStr)} • {dateStr}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold text-green-500`}>{total}g</div>
                  <div className={`text-xs opacity-60 ${currentTheme.text}`}>{mealCount} {mealCount === 1 ? 'meal' : 'meals'}</div>
                </div>
                {!isToday && (
                  <div className={`transition-transform ml-4`} style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    <ChevronLeft size={20} className={currentTheme.text} />
                  </div>
                )}
              </button>

              {/* Expanded Content (Today is always expanded) */}
              {(isExpanded || isToday) && (
                <div className={`px-4 pb-4 pt-2 space-y-2 border-t`} style={{ borderColor: currentTheme.rawCardBorder }}>
                  {entries.length === 0 ? (
                    <div className={`text-center py-4 text-sm opacity-50 ${currentTheme.text}`}>
                      No entries for this day
                    </div>
                  ) : (
                    entries.map((entry) => {
                      const entryTime = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      });
                      return (
                        <div key={entry.timestamp} className={`p-3 rounded-lg flex items-center justify-between`} style={{ backgroundColor: currentTheme.rawInputBg }}>
                          <div className="flex-1">
                            <div className={`font-semibold ${currentTheme.text}`}>{entry.food}</div>
                            <div className={`text-sm opacity-60 ${currentTheme.text}`}>
                              {entryTime}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`font-bold ${currentTheme.text}`}>{entry.grams}g</div>
                            {isToday && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingEntry(entry);
                                    setEditGrams(entry.grams.toString());
                                    setEditFood(entry.food);
                                    openModal('editingProteinEntry');
                                  }}
                                  className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text}`}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(entry.timestamp)}
                                  className={`p-2 rounded hover:bg-red-500/20 transition-all text-red-500`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add entry button for this date (only show for today) */}
                  {isToday && (
                    <button
                      onClick={() => openModal('addProtein')}
                      className={`w-full mt-3 px-4 py-2 rounded-lg font-semibold border transition-all ${currentTheme.cardBorder} ${currentTheme.text} text-sm`}
                      style={{ borderColor: currentTheme.rawCardBorder }}
                    >
                      + Add Entry
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Protein Modal */}
      <BottomSheet isOpen={showAddProtein} onClose={() => closeModal('addProtein')} title="Add Protein Entry">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Grams</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="0.0"
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-green-500`}
              step="0.1"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Food</label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Chicken breast, protein shake, etc."
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => closeModal('addProtein')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-all ${currentTheme.cardBorder} ${currentTheme.text}`}
              style={{ borderColor: currentTheme.rawCardBorder }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddProtein}
              className="flex-1 px-4 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Edit Entry Modal */}
      <BottomSheet isOpen={editingEntry !== null} onClose={() => { setEditingEntry(null); closeModal('editingProteinEntry'); }} title="Edit Protein Entry">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Grams</label>
            <input
              type="number"
              value={editGrams}
              onChange={(e) => setEditGrams(e.target.value)}
              placeholder="0.0"
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              step="0.1"
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Food</label>
            <input
              type="text"
              value={editFood}
              onChange={(e) => setEditFood(e.target.value)}
              placeholder="Chicken breast, protein shake, etc."
              className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => {
                setEditingEntry(null);
                closeModal('editingProteinEntry');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-all ${currentTheme.cardBorder} ${currentTheme.text}`}
              style={{ borderColor: currentTheme.rawCardBorder }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProteinEntry}
              className="flex-1 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
