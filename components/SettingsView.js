import React from 'react';
import { Icons } from './Icons.js';

export const SettingsView = ({ 
  theme, 
  setTheme, 
  themes, 
  importWorkouts, 
  setShowClear, 
  showDataDeletion, 
  setShowDataDeletion,
  darkMode 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Settings
      </h2>

      {/* Theme Selection */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Icons.Settings className="w-4 h-4" /> Theme
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                theme === key 
                  ? 'ring-2 ring-blue-500 bg-blue-500/10 text-blue-400' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data Import */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="font-bold mb-2">Import Data</h3>
        <p className="text-xs text-gray-400 mb-4">Upload your exported CSV file.</p>
        <input 
          type="file" 
          onChange={importWorkouts} 
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
        />
      </div>

      {/* Data Deletion (The section from your line 4091) */}
      <div className={`rounded-xl shadow-md border-2 ${darkMode ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-200'} overflow-hidden`}>
        <button
          onClick={() => setShowDataDeletion(!showDataDeletion)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="font-bold flex items-center gap-2 text-red-400">
            <span className="text-lg">⚠️</span> Data Deletion
          </h3>
          <div className={`transform transition-transform ${showDataDeletion ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </div>
        </button>
        
        {showDataDeletion && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 mt-2`}>
              Permanently delete all workout data. This action cannot be undone.
            </p>
            <button 
              onClick={() => setShowClear(true)} 
              className="w-full bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all"
            >
              Delete All Workouts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
