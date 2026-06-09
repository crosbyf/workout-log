'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, ChevronRight, X, Trash2, Pencil, Check } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function ProteinTracker({ todayTotal, entriesByDate, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [grams, setGrams] = useState('');
  const [food, setFood] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editGrams, setEditGrams] = useState('');
  const [editFood, setEditFood] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleSubmit = () => {
    const g = parseInt(grams, 10);
    if (!g || g <= 0) return;
    onAdd({ grams: g, food: food.trim() });
    setGrams('');
    setFood('');
    setShowForm(false);
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry.id);
    setEditGrams(String(entry.grams));
    setEditFood(entry.food || '');
  };

  const handleSaveEdit = () => {
    const g = parseInt(editGrams, 10);
    if (!g || g <= 0) return;
    onUpdate(editingId, { grams: g, food: editFood.trim() });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const toggleDay = (date) => {
    setExpandedDay(prev => prev === date ? null : date);
  };

  // Today's entries are always shown expanded; past days are in the history section
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDate = entriesByDate.length > 0 && entriesByDate[0].date === todayStr
    ? entriesByDate[0]
    : null;
  const pastDays = todayDate ? entriesByDate.slice(1) : entriesByDate;
  const displayPastDays = showHistory ? pastDays : pastDays.slice(0, 5);

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
            Protein Today
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>
            {todayTotal}g
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-green)', color: '#ffffff' }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="Grams"
              className="w-20 text-sm px-3 py-2 rounded-lg bg-transparent border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              inputMode="numeric"
            />
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Food (e.g., Protein shake)"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-transparent border"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!grams || parseInt(grams, 10) <= 0}
            className="w-full mt-2 py-2 rounded-lg text-sm font-bold"
            style={{
              backgroundColor: !grams || parseInt(grams, 10) <= 0
                ? 'var(--color-surface-hover)'
                : 'var(--color-green)',
              color: !grams || parseInt(grams, 10) <= 0
                ? 'var(--color-text-dim)'
                : '#ffffff',
            }}
          >
            Add Protein
          </button>
        </div>
      )}

      {/* Today's entries (always expanded) */}
      {todayDate && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Today
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--color-green)' }}>
                {todayDate.total}g
              </span>
            </div>
            {todayDate.entries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between pl-2 py-1">
                {editingId === entry.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      value={editGrams}
                      onChange={(e) => setEditGrams(e.target.value)}
                      className="w-14 text-xs px-1.5 py-1 rounded bg-transparent border"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      inputMode="numeric"
                    />
                    <input
                      type="text"
                      value={editFood}
                      onChange={(e) => setEditFood(e.target.value)}
                      className="flex-1 text-xs px-1.5 py-1 rounded bg-transparent border"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <button onClick={handleSaveEdit} className="p-1">
                      <Check size={14} style={{ color: 'var(--color-green)' }} />
                    </button>
                    <button onClick={handleCancelEdit} className="p-1">
                      <X size={14} style={{ color: 'var(--color-text-dim)' }} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                        {entry.food || 'Protein'} — {entry.grams}g
                      </span>
                      {entry.timestamp && (
                        <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-text-dim)', opacity: 0.6 }}>
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEdit(entry)} className="p-1 opacity-50">
                        <Pencil size={10} style={{ color: 'var(--color-accent)' }} />
                      </button>
                      {deleteConfirmId === entry.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { onDelete(entry.id); setDeleteConfirmId(null); }}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(entry.id)} className="p-1 opacity-50">
                          <Trash2 size={10} style={{ color: 'var(--color-red)' }} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past days as collapsible tiles */}
      {pastDays.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {displayPastDays.map(day => (
            <div key={day.date}>
              {/* Collapsed tile — tap to expand */}
              <button
                onClick={() => toggleDay(day.date)}
                className="w-full flex items-center justify-between px-4 py-2"
                style={{ borderBottom: expandedDay === day.date ? 'none' : '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2">
                  {expandedDay === day.date
                    ? <ChevronDown size={12} style={{ color: 'var(--color-text-dim)' }} />
                    : <ChevronRight size={12} style={{ color: 'var(--color-text-dim)' }} />
                  }
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {formatDate(day.date)}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-green)' }}>
                  {day.total}g
                </span>
              </button>

              {/* Expanded entries */}
              {expandedDay === day.date && (
                <div className="px-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {day.entries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between pl-5 py-1">
                      {editingId === entry.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="number"
                            value={editGrams}
                            onChange={(e) => setEditGrams(e.target.value)}
                            className="w-14 text-xs px-1.5 py-1 rounded bg-transparent border"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                            inputMode="numeric"
                          />
                          <input
                            type="text"
                            value={editFood}
                            onChange={(e) => setEditFood(e.target.value)}
                            className="flex-1 text-xs px-1.5 py-1 rounded bg-transparent border"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                          />
                          <button onClick={handleSaveEdit} className="p-1">
                            <Check size={14} style={{ color: 'var(--color-green)' }} />
                          </button>
                          <button onClick={handleCancelEdit} className="p-1">
                            <X size={14} style={{ color: 'var(--color-text-dim)' }} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                              {entry.food || 'Protein'} — {entry.grams}g
                            </span>
                            {entry.timestamp && (
                              <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-text-dim)', opacity: 0.6 }}>
                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleStartEdit(entry)} className="p-1 opacity-50">
                              <Pencil size={10} style={{ color: 'var(--color-accent)' }} />
                            </button>
                            <button onClick={() => onDelete(entry.id)} className="p-1 opacity-50">
                              <Trash2 size={10} style={{ color: 'var(--color-red)' }} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Show more/less */}
          {pastDays.length > 5 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-2 flex items-center justify-center gap-1 text-xs"
              style={{ color: 'var(--color-text-dim)' }}
            >
              {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showHistory ? 'Show less' : `Show all ${pastDays.length} days`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
