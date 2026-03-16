'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function ExerciseLibrary({ exercises, onAdd, onDelete }) {
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const success = onAdd(trimmed);
    if (success) setNewName('');
  };

  return (
    <div>
      {/* Add exercise input — always visible */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new exercise..."
          className="flex-1 text-sm px-3 py-2 rounded-lg bg-transparent border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: newName.trim() ? 'var(--color-accent)' : 'var(--color-surface-hover)',
            color: newName.trim() ? '#ffffff' : 'var(--color-text-dim)',
          }}
        >
          Add
        </button>
      </div>

      {/* Count */}
      <div className="text-xs mb-2 px-1" style={{ color: 'var(--color-text-dim)' }}>
        {exercises.length} exercises
      </div>

      {/* Exercise list */}
      <div className="max-h-64 overflow-y-auto space-y-0.5">
        {exercises.map(name => (
          <div key={name}>
            <div className="flex items-center justify-between py-1.5 px-1">
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{name}</span>
              {deleteConfirm === name ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { onDelete(name); setDeleteConfirm(null); }}
                    className="text-[10px] px-2 py-0.5 rounded font-bold"
                    style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ color: 'var(--color-text-dim)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(name)}
                  className="p-1"
                >
                  <Trash2 size={12} style={{ color: 'var(--color-red)', opacity: 0.6 }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
