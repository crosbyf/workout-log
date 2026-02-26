'use client';

export default function EmptyState({ icon: Icon, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="mb-4 opacity-30">
          <Icon size={48} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )}
      <p
        className="text-base mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
