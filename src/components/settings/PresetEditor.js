'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, ChevronRight, Archive, ArchiveRestore } from 'lucide-react';
import { PRESET_COLORS, COLOR_NAMES } from '@/hooks/usePresets';

function PresetForm({ preset, exercises, onSave, onCancel }) {
  const [name, setName] = useState(preset ? preset.name : '');
  const [color, setColor] = useState(preset ? preset.color : 'blue');
  const [selectedExercises, setSelectedExercises] = useState(preset ? preset.exercises : []);
  const [search, setSearch] = useState('');

  const filteredExercises = exercises.filter(
    e => e.toLowerCase().includes(search.toLowerCase()) && !selectedExercises.includes(e)
  );

  const handleToggleExercise = (name) => {
    if (selectedExercises.includes(name)) {
      setSelectedExercises(selectedExercises.filter(e => e !== name));
    } else {
      setSelectedExercises([...selectedExercises, name]);
    }
  };

  const handleRemoveExercise = (name) => {
    setSelectedExercises(selectedExercises.filter(e => e !== name));
  };

  const handleMoveExercise = (idx, direction) => {
    const newList = [...selectedExercises];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    setSelectedExercises(newList);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, exercises: selectedExercises });
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
          Preset Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Garage A"
          className="w-full text-sm px-3 py-2 rounded-lg bg-transparent border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      {/* Color picker */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
          Color
        </label>
        <div className="flex gap-2">
          {COLOR_NAMES.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: PRESET_COLORS[c],
                borderColor: color === c ? '#ffffff' : 'transparent',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected exercises */}
      <div>
        <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}>
          Exercises ({selectedExercises.length})
        </label>
        {selectedExercises.length > 0 && (
          <div className="space-y-1 mb-2">
            {selectedExercises.map((ex, idx) => (
              <div
                key={ex}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ backgroundColor: 'var(--color-surface-hover)' }}
              >
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{idx + 1}.</span>
                <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{ex}</span>
                <button onClick={() => handleMoveExercise(idx, -1)} className="p-0.5" disabled={idx === 0}>
                  <ChevronUp size={12} style={{ color: idx === 0 ? 'var(--color-border)' : 'var(--color-text-dim)' }} />
                </button>
                <button onClick={() => handleMoveExercise(idx, 1)} className="p-0.5" disabled={idx === selectedExercises.length - 1}>
                  <ChevronDown size={12} style={{ color: idx === selectedExercises.length - 1 ? 'var(--color-border)' : 'var(--color-text-dim)' }} />
                </button>
                <button onClick={() => handleRemoveExercise(ex)} className="p-0.5">
                  <X size={12} style={{ color: 'var(--color-red)' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add exercises from library */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises to add..."
          className="w-full text-xs px-3 py-2 rounded-lg bg-transparent border mb-1"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
        <div className="max-h-32 overflow-y-auto">
          {filteredExercises.slice(0, 15).map(ex => (
            <button
              key={ex}
              onClick={() => handleToggleExercise(ex)}
              className="w-full text-left text-xs px-3 py-1.5 rounded hover:opacity-80"
              style={{ color: 'var(--color-text-muted)' }}
            >
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-2 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: name.trim() ? 'var(--color-accent)' : 'var(--color-surface-hover)',
            color: name.trim() ? '#ffffff' : 'var(--color-text-dim)',
          }}
        >
          {preset ? 'Update' : 'Create'} Preset
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function VisibilityToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-9 h-5 rounded-full relative transition-colors shrink-0"
      style={{ backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-surface-hover)' }}
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? 'Visible in menu' : 'Hidden from menu'}
    >
      <div
        className="w-4 h-4 rounded-full absolute transition-all"
        style={{
          backgroundColor: '#ffffff',
          top: '2px',
          left: enabled ? 'calc(100% - 18px)' : '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function DeleteConfirmRow({ name, onConfirm, onCancel }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface-hover)' }}
    >
      <span className="text-xs flex-1" style={{ color: 'var(--color-red)' }}>
        Delete {name}?
      </span>
      <button
        onClick={onConfirm}
        className="text-xs px-2 py-1 rounded font-bold"
        style={{ backgroundColor: 'var(--color-red)', color: '#ffffff' }}
      >
        Delete
      </button>
      <button
        onClick={onCancel}
        className="text-xs px-2 py-1 rounded"
        style={{ color: 'var(--color-text-dim)' }}
      >
        Cancel
      </button>
    </div>
  );
}

export default function PresetEditor({
  presets,
  exercises,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  settings = {},
  onUpdateSetting,
}) {
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const archivedIds = settings.archivedPresetIds || [];
  const activePresets = presets.filter(p => !p.isDayOff && !archivedIds.includes(p.id));
  const archivedPresets = presets.filter(p => !p.isDayOff && archivedIds.includes(p.id));

  const handleArchive = (id) => {
    if (onUpdateSetting) onUpdateSetting('archivedPresetIds', [...archivedIds, id]);
  };

  const handleUnarchive = (id) => {
    if (onUpdateSetting) onUpdateSetting('archivedPresetIds', archivedIds.filter(x => x !== id));
  };

  const handleDelete = (id) => {
    onDelete(id);
    // Clean up the archive list if an archived preset is deleted
    if (archivedIds.includes(id) && onUpdateSetting) {
      onUpdateSetting('archivedPresetIds', archivedIds.filter(x => x !== id));
    }
    setDeleteConfirm(null);
  };

  const handleSaveNew = (data) => {
    onAdd(data);
    setShowCreate(false);
  };

  const handleSaveEdit = (data) => {
    onUpdate(editingId, data);
    setEditingId(null);
  };

  if (showCreate) {
    return (
      <PresetForm
        exercises={exercises}
        onSave={handleSaveNew}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editingId) {
    const preset = presets.find(p => p.id === editingId);
    if (preset) {
      return (
        <PresetForm
          preset={preset}
          exercises={exercises}
          onSave={handleSaveEdit}
          onCancel={() => setEditingId(null)}
        />
      );
    }
  }

  return (
    <div>
      {/* Preset list */}
      <div className="space-y-1 mb-3">
        {activePresets.map((preset, idx) => (
          <div key={preset.id}>
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: PRESET_COLORS[preset.color] || 'var(--color-accent)' }}
                />
                <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {preset.name}
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)' }}>
                  ({preset.exercises.length})
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onReorder(preset.id, 'up')}
                  disabled={idx === 0}
                  className="w-8 h-8 flex items-center justify-center rounded"
                  style={{ opacity: idx === 0 ? 0.3 : 1 }}
                  aria-label={`Move ${preset.name} up`}
                >
                  <ChevronUp size={14} style={{ color: 'var(--color-text-dim)' }} />
                </button>
                <button
                  onClick={() => onReorder(preset.id, 'down')}
                  disabled={idx === activePresets.length - 1}
                  className="w-8 h-8 flex items-center justify-center rounded"
                  style={{ opacity: idx === activePresets.length - 1 ? 0.3 : 1 }}
                  aria-label={`Move ${preset.name} down`}
                >
                  <ChevronDown size={14} style={{ color: 'var(--color-text-dim)' }} />
                </button>
                <VisibilityToggle
                  enabled={!preset.hidden}
                  onToggle={() => onUpdate(preset.id, { hidden: !preset.hidden })}
                />
                <button
                  onClick={() => handleArchive(preset.id)}
                  className="w-8 h-8 flex items-center justify-center rounded"
                  aria-label={`Archive ${preset.name}`}
                >
                  <Archive size={13} style={{ color: 'var(--color-text-dim)' }} />
                </button>
                <button
                  onClick={() => setEditingId(preset.id)}
                  className="w-8 h-8 flex items-center justify-center rounded"
                  aria-label={`Edit ${preset.name}`}
                >
                  <Pencil size={12} style={{ color: 'var(--color-text-dim)' }} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(preset.id)}
                  className="w-8 h-8 flex items-center justify-center rounded"
                  aria-label={`Delete ${preset.name}`}
                >
                  <Trash2 size={12} style={{ color: 'var(--color-red)' }} />
                </button>
              </div>
            </div>

            {/* Delete confirmation inline */}
            {deleteConfirm === preset.id && (
              <DeleteConfirmRow
                name={preset.name}
                onConfirm={() => handleDelete(preset.id)}
                onCancel={() => setDeleteConfirm(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add new preset button */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm"
        style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-accent)', fontWeight: 700 }}
      >
        <Plus size={14} /> New Preset
      </button>

      {/* Archived presets — collapsed by default */}
      {archivedPresets.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center gap-1.5 py-2"
            aria-expanded={showArchived}
          >
            {showArchived
              ? <ChevronDown size={12} style={{ color: 'var(--color-text-dim)' }} />
              : <ChevronRight size={12} style={{ color: 'var(--color-text-dim)' }} />
            }
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--color-text-dim)', fontWeight: 700 }}
            >
              Archived ({archivedPresets.length})
            </span>
          </button>
          {showArchived && (
            <div className="space-y-1">
              {archivedPresets.map(preset => (
                <div key={preset.id}>
                  <div className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0" style={{ opacity: 0.6 }}>
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PRESET_COLORS[preset.color] || 'var(--color-accent)' }}
                      />
                      <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {preset.name}
                      </span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)' }}>
                        ({preset.exercises.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleUnarchive(preset.id)}
                        className="w-8 h-8 flex items-center justify-center rounded"
                        aria-label={`Unarchive ${preset.name}`}
                      >
                        <ArchiveRestore size={13} style={{ color: 'var(--color-accent)' }} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(preset.id)}
                        className="w-8 h-8 flex items-center justify-center rounded"
                        aria-label={`Delete ${preset.name}`}
                      >
                        <Trash2 size={12} style={{ color: 'var(--color-red)' }} />
                      </button>
                    </div>
                  </div>

                  {deleteConfirm === preset.id && (
                    <DeleteConfirmRow
                      name={preset.name}
                      onConfirm={() => handleDelete(preset.id)}
                      onCancel={() => setDeleteConfirm(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
