import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function BottomSheet({ isOpen, onClose, children, title }) {
  const currentTheme = useThemeStore((state) => state.getCurrentTheme());
  const contentRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (contentRef.current && contentRef.current.scrollTop === 0 && diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      />
      <div
        className="animate-slide-up fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: currentTheme.rawCardBg,
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={contentRef}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div
            className="h-1 w-10 rounded-full"
            style={{ backgroundColor: '#4b5563' }}
          />
        </div>

        {/* Title Row */}
        {title && (
          <div
            className="px-6 pb-4 flex justify-between items-center"
            style={{ color: currentTheme.rawText }}
          >
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
              aria-label="Close sheet"
              style={{ color: currentTheme.rawText }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6" style={{ color: currentTheme.rawText }}>
          {children}
        </div>

        {/* Safe area for bottom notch */}
        <div className="h-8" />
      </div>
    </>
  );
}
