// components/Modals.js
// Reusable modal components for confirmations and data entry

import React from 'react';
import { Icons } from './Icons.js';

// Base modal wrapper
export const Modal = ({ children, onClose, darkMode }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div 
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

// Confirmation modal (for delete actions, etc.)
export const ConfirmModal = ({ 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel, 
  darkMode,
  danger = false 
}) => (
  <Modal onClose={onCancel} darkMode={darkMode}>
    <h3 className={`text-xl font-bold mb-4 ${danger ? 'text-red-400' : ''}`}>
      {danger && '⚠️ '}{title}
    </h3>
    <p className="mb-6">{message}</p>
    <div className="flex gap-3">
      <button
        onClick={onConfirm}
        className={`flex-1 ${
          danger 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } py-3 rounded-lg font-semibold text-white`}
      >
        {confirmText}
      </button>
      <button
        onClick={onCancel}
        className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-3 rounded-lg font-semibold`}
      >
        {cancelText}
      </button>
    </div>
  </Modal>
);

// Toast notification
export const Toast = ({ message, show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

// Preset selector modal
export const PresetSelectorModal = ({ 
  presets, 
  onSelect, 
  onClose, 
  onCreateNew,
  darkMode,
  presetColors 
}) => {
  const getColor = (preset) => {
    if (preset.color) {
      return presetColors.find(c => c.name === preset.color) || presetColors[0];
    }
    return presetColors[0];
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div 
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl w-full max-h-[70vh] overflow-y-auto pb-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className={`w-10 h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`}></div>
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4">Start Workout</h3>
          
          <div className="space-y-2">
            {presets.filter(p => p.includeInMenu !== false).map((preset, i) => {
              const color = getColor(preset);
              return (
                <button
                  key={i}
                  onClick={() => onSelect(preset)}
                  className={`w-full p-4 rounded-xl border-l-4 ${color.border} ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  } text-left transition-colors`}
                >
                  <div className="font-bold">{preset.name}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {preset.exercises.length > 0 
                      ? preset.exercises.slice(0, 3).join(', ') + (preset.exercises.length > 3 ? '...' : '')
                      : 'Custom workout'
                    }
                  </div>
                </button>
              );
            })}
          </div>
          
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              + Create New Preset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Protein Modal
export const AddProteinModal = ({ 
  onSave, 
  onClose, 
  darkMode,
  initialDate = null 
}) => {
  const [grams, setGrams] = React.useState('');
  const [food, setFood] = React.useState('');
  
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!grams || parseFloat(grams) <= 0) return;
    
    onSave({
      date: initialDate || getTodayDate(),
      grams: parseFloat(grams),
      food: food.trim() || 'Protein',
      timestamp: Date.now()
    });
    
    setGrams('');
    setFood('');
    onClose();
  };

  return (
    <Modal onClose={onClose} darkMode={darkMode}>
      <h3 className="text-xl font-bold mb-4">Add Protein</h3>
      
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Protein (grams)
          </label>
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="45"
            className={`w-full px-3 py-3 rounded-lg text-lg ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border`}
            autoFocus
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Food (optional)
          </label>
          <input
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="Chicken breast, protein shake, etc."
            className={`w-full px-3 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border`}
          />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={!grams || parseFloat(grams) <= 0}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-white"
        >
          Add Protein
        </button>
        <button
          onClick={onClose}
          className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} py-3 rounded-lg font-semibold`}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
