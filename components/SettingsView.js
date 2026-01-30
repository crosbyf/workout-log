import React from 'react';
import { Icons } from './Icons.js';

export const SettingsView = ({ 
  darkMode,
  workouts,
  presets,
  exercises,
  weightEntries,
  proteinEntries,
  setWorkouts,
  setPresets,
  setExercises,
  setWeightEntries,
  setProteinEntries,
  setTheme,
  theme,
  setShowHomeV1,
  showHomeV1,
  exportCSV,
  importWorkouts,
  setShowClear
}) => {
  const [showDataDeletion, setShowDataDeletion] = React.useState(false);
  const [showExerciseManager, setShowExerciseManager] = React.useState(false);
  const [newExerciseName, setNewExerciseName] = React.useState('');
  
  // Theme definitions (same as in index.js)
  const themes = {
    light: { name: 'Light' },
    dark: { name: 'Dark' },
    neon: { name: 'Neon' },
    forest: { name: 'Forest' }
  };

  // Helper function to save data
  const save = (data, key, setter) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
    setter(data);
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Settings
      </h2>
      
      {/* Theme Selection */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎨 Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                localStorage.setItem('theme', key);
              }}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                theme === key 
                  ? 'ring-2 ring-blue-500 bg-blue-500/20 text-blue-400' 
                  : darkMode 
                    ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Home V1 Toggle */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📱 Show Home V1 Tab
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Enable the classic home layout as a separate tab
            </p>
          </div>
          <button
            onClick={() => {
              const newValue = !showHomeV1;
              setShowHomeV1(newValue);
              localStorage.setItem('showHomeV1', JSON.stringify(newValue));
            }}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              showHomeV1 ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              showHomeV1 ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Exercise Library Manager */}
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} overflow-hidden`}>
        <button
          onClick={() => setShowExerciseManager(!showExerciseManager)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💪 Exercise Library
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {exercises.length} exercises
            </p>
          </div>
          <div className={`transform transition-transform ${showExerciseManager ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </div>
        </button>
        
        {showExerciseManager && (
          <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Add new exercise */}
            <div className="flex gap-2 mt-3 mb-3">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="New exercise name..."
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border`}
              />
              <button
                onClick={() => {
                  if (newExerciseName.trim() && !exercises.includes(newExerciseName.trim())) {
                    const updated = [...exercises, newExerciseName.trim()].sort();
                    save(updated, 'exercises', setExercises);
                    setNewExerciseName('');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              >
                Add
              </button>
            </div>
            
            {/* Exercise list */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {exercises.sort().map((exercise, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {exercise}
                  </span>
                  <button
                    onClick={() => {
                      const updated = exercises.filter((_, idx) => idx !== i);
                      save(updated, 'exercises', setExercises);
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Data Export */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📤 Export Data
        </h3>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
          Download all your workout data as a CSV file.
        </p>
        <button
          onClick={() => exportCSV()}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-sm font-bold text-white transition-colors"
        >
          Export to CSV
        </button>
      </div>

      {/* Data Import */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📥 Import Data
        </h3>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
          Upload a previously exported CSV file.
        </p>
        <input 
          type="file" 
          accept=".csv"
          onChange={importWorkouts} 
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
        />
      </div>

      {/* Stats Summary */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Data Summary
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {workouts.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Workouts
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {presets.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Presets
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {weightEntries.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Weight Entries
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {proteinEntries.length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Protein Entries
            </div>
          </div>
        </div>
      </div>

      {/* Data Deletion - Danger Zone */}
      <div className={`rounded-xl shadow-md border-2 ${darkMode ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-200'} overflow-hidden`}>
        <button
          onClick={() => setShowDataDeletion(!showDataDeletion)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="font-bold flex items-center gap-2 text-red-400">
            <span className="text-lg">⚠️</span> Danger Zone
          </h3>
          <div className={`transform transition-transform ${showDataDeletion ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </div>
        </button>
        
        {showDataDeletion && (
          <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 mt-3`}>
              Permanently delete all workout data. This action cannot be undone.
            </p>
            <button 
              onClick={() => setShowClear(true)} 
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all"
            >
              Delete All Workouts
            </button>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} text-center`}>
        <div className="text-2xl mb-2">💪</div>
        <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>GORS LOG</div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Be About It</div>
      </div>
    </div>
  );
};
