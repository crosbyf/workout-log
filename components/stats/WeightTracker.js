import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useTrackingStore } from '../../stores/trackingStore';
import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import BottomSheet from '../modals/BottomSheet';

export default function WeightTracker() {
  const { getCurrentTheme } = useThemeStore();
  const { setStatsView, showWeightModal, openModal, closeModal, editingWeight } = useUIStore();
  const { weightEntries, addWeightEntry, updateWeightEntry, deleteWeightEntry } = useTrackingStore();
  const currentTheme = getCurrentTheme();

  const [formDate, setFormDate] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Sort entries by date (newest first for history, oldest first for chart)
  const sortedEntries = useMemo(() => {
    return [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [weightEntries]);

  const chartEntries = useMemo(() => {
    return [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightEntries]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (chartEntries.length === 0) return null;

    const currentWeight = chartEntries[chartEntries.length - 1].weight;
    const startingWeight = chartEntries[0].weight;
    const change = currentWeight - startingWeight;
    const daysElapsed = (new Date(chartEntries[chartEntries.length - 1].date) - new Date(chartEntries[0].date)) / (1000 * 60 * 60 * 24);
    const weeksElapsed = daysElapsed / 7;
    const ratePerWeek = weeksElapsed > 0 ? (change / weeksElapsed).toFixed(1) : 0;

    return {
      currentWeight,
      startingWeight,
      change,
      ratePerWeek,
      entryCount: chartEntries.length,
    };
  }, [chartEntries]);

  // Open weight modal
  const handleAddWeight = () => {
    setFormDate('');
    setFormWeight('');
    setFormNotes('');
    openModal('weightModal');
  };

  // Handle weight form submit
  const handleWeightSubmit = () => {
    if (!formDate || !formWeight) {
      alert('Please fill in date and weight');
      return;
    }

    const entry = {
      date: formDate,
      weight: parseFloat(formWeight),
      notes: formNotes,
    };

    if (editingWeight !== null) {
      updateWeightEntry(editingWeight, entry);
    } else {
      addWeightEntry(entry);
    }

    closeModal('weightModal');
    setFormDate('');
    setFormWeight('');
    setFormNotes('');
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return new Date(year, parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US');
  };

  const handleDaySelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setFormDate(`${year}-${month}-${dayStr}`);
  };

  // Chart rendering
  const renderChart = () => {
    if (chartEntries.length < 2) return null;

    const padding = 40;
    const width = 300;
    const height = 200;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minWeight = Math.min(...chartEntries.map((e) => e.weight));
    const maxWeight = Math.max(...chartEntries.map((e) => e.weight));
    const weightRange = maxWeight - minWeight || 1;

    // Generate SVG path for line
    const points = chartEntries.map((entry, index) => {
      const x = (index / (chartEntries.length - 1)) * chartWidth + padding;
      const y = height - padding - ((entry.weight - minWeight) / weightRange) * chartHeight;
      return { x, y, weight: entry.weight };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    // X-axis labels
    const xLabels = [
      chartEntries[0].date,
      chartEntries[Math.floor(chartEntries.length / 2)]?.date,
      chartEntries[chartEntries.length - 1].date,
    ];

    return (
      <svg width="100%" height="240" viewBox={`0 0 ${width} ${height}`} className="mx-auto">
        {/* Gradient */}
        <defs>
          <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - padding - ratio * chartHeight;
          const label = (minWeight + ratio * weightRange).toFixed(0);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={currentTheme.cardBorder}
                strokeWidth="1"
                strokeDasharray="4"
                opacity="0.5"
              />
              <text
                x={padding - 5}
                y={y + 4}
                fontSize="12"
                textAnchor="end"
                fill={currentTheme.text}
                opacity="0.6"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Fill area */}
        <path d={fillPath} fill="url(#weightGradient)" />

        {/* Line */}
        <path d={pathData} stroke="#3b82f6" strokeWidth="2" fill="none" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => {
          if (!label) return null;
          const index = chartEntries.findIndex((e) => e.date === label);
          if (index === -1) return null;
          const x = (index / (chartEntries.length - 1)) * chartWidth + padding;
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              fontSize="12"
              textAnchor="middle"
              fill={currentTheme.text}
              opacity="0.6"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`pb-20 px-4 pt-4 ${currentTheme.bg}`} style={{ backgroundColor: currentTheme.rawBg }}>
      {/* Back Button */}
      <button
        onClick={() => setStatsView('menu')}
        className={`flex items-center gap-2 mb-6 font-semibold ${currentTheme.text}`}
      >
        <ChevronLeft size={24} />
        Back
      </button>

      {/* Title and Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${currentTheme.text}`}>Body Weight</h2>
        <button
          onClick={handleAddWeight}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Summary Card */}
      {summaryStats && (
        <div className={`rounded-xl p-4 mb-6 ${currentTheme.cardBg}`} style={{ backgroundColor: currentTheme.rawCardBg }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`text-sm opacity-75 ${currentTheme.text}`}>Current Weight</div>
              <div className={`text-2xl font-bold ${currentTheme.text}`}>{summaryStats.currentWeight} lbs</div>
            </div>
            <div>
              <div className={`text-sm opacity-75 ${currentTheme.text}`}>Total Change</div>
              <div className={`text-2xl font-bold ${summaryStats.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {summaryStats.change >= 0 ? '+' : ''}{summaryStats.change.toFixed(1)} lbs
              </div>
            </div>
            <div>
              <div className={`text-sm opacity-75 ${currentTheme.text}`}>Starting Weight</div>
              <div className={`font-bold ${currentTheme.text}`}>{summaryStats.startingWeight} lbs</div>
            </div>
            <div>
              <div className={`text-sm opacity-75 ${currentTheme.text}`}>Rate</div>
              <div className={`font-bold ${currentTheme.text}`}>{summaryStats.ratePerWeek} lbs/week</div>
            </div>
          </div>
          <div className={`text-xs opacity-50 mt-4 ${currentTheme.text}`}>
            {summaryStats.entryCount} entries tracked
          </div>
        </div>
      )}

      {/* Chart */}
      {chartEntries.length > 1 && (
        <div className={`rounded-xl p-4 mb-6 ${currentTheme.cardBg}`} style={{ backgroundColor: currentTheme.rawCardBg }}>
          <h3 className={`text-lg font-bold mb-4 ${currentTheme.text}`}>Trend</h3>
          {renderChart()}
        </div>
      )}

      {/* History List */}
      <div className="space-y-2">
        <h3 className={`text-lg font-bold mb-4 ${currentTheme.text}`}>History</h3>
        {sortedEntries.length === 0 ? (
          <div className={`text-center py-8 ${currentTheme.text} opacity-50`}>
            No weight entries yet
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const prevEntry = chartEntries[chartEntries.findIndex((e) => e.date === entry.date) - 1];
            const change = prevEntry ? entry.weight - prevEntry.weight : null;
            return (
              <div
                key={entry.date}
                className={`p-4 rounded-xl flex items-center justify-between ${currentTheme.cardBg}`}
                style={{ backgroundColor: currentTheme.rawCardBg }}
              >
                <div className="flex-1">
                  <div className={`font-semibold ${currentTheme.text}`}>{entry.date}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-bold ${currentTheme.text}`}>{entry.weight} lbs</span>
                    {change !== null && (
                      <span className={`text-sm px-2 py-1 rounded ${change >= 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {entry.notes && <div className={`text-xs opacity-50 mt-1 ${currentTheme.text}`}>{entry.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFormDate(entry.date);
                      setFormWeight(entry.weight.toString());
                      setFormNotes(entry.notes || '');
                      openModal('weightModal');
                    }}
                    className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteWeightEntry(weightEntries.findIndex((e) => e.date === entry.date))}
                    className={`p-2 rounded hover:bg-red-500/20 transition-all text-red-500`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Weight Modal */}
      <WeightModal
        isOpen={showWeightModal}
        onClose={() => closeModal('weightModal')}
        formDate={formDate}
        setFormDate={setFormDate}
        formWeight={formWeight}
        setFormWeight={setFormWeight}
        formNotes={formNotes}
        setFormNotes={setFormNotes}
        onSubmit={handleWeightSubmit}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        handleDaySelect={handleDaySelect}
        getDaysInMonth={getDaysInMonth}
        getFirstDayOfMonth={getFirstDayOfMonth}
        currentTheme={currentTheme}
      />
    </div>
  );
}

function WeightModal({
  isOpen,
  onClose,
  formDate,
  setFormDate,
  formWeight,
  setFormWeight,
  formNotes,
  setFormNotes,
  onSubmit,
  currentMonth,
  setCurrentMonth,
  selectedDay,
  setSelectedDay,
  handleDaySelect,
  getDaysInMonth,
  getFirstDayOfMonth,
  currentTheme,
}) {
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add Weight Entry">
      <div className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text}`}
          >
            ←
          </button>
          <span className={`font-semibold ${currentTheme.text}`}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-10 transition-all ${currentTheme.text}`}
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className={`text-center text-xs font-semibold ${currentTheme.text} opacity-50 py-2`}>
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day && handleDaySelect(day)}
              disabled={!day}
              className={`
                aspect-square rounded text-sm font-semibold transition-all
                ${!day ? 'invisible' : ''}
                ${formDate && new Date(formDate).getDate() === day ? 'bg-blue-500 text-white' : `${currentTheme.cardBorder} ${currentTheme.text}`}
              `}
              style={{
                backgroundColor: formDate && new Date(formDate).getDate() === day ? undefined : 'transparent',
                border: formDate && new Date(formDate).getDate() === day ? 'none' : `1px solid ${currentTheme.rawCardBorder}`,
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Weight Input */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Weight (lbs)</label>
          <input
            type="number"
            value={formWeight}
            onChange={(e) => setFormWeight(e.target.value)}
            placeholder="0.0"
            className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            step="0.1"
            style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>Notes (optional)</label>
          <textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Morning weight, felt bloated, etc."
            className={`w-full px-4 py-2 rounded-lg border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows="3"
            style={{ borderColor: currentTheme.rawInputBorder, backgroundColor: currentTheme.rawInputBg, color: currentTheme.rawText }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold border transition-all ${currentTheme.cardBorder} ${currentTheme.text}`}
            style={{ borderColor: currentTheme.rawCardBorder }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
