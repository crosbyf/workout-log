import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function BottomSheet({ isOpen, onClose, children, title }) {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const contentRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

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
    if (contentRef.current) {
      setScrollTop(contentRef.current.scrollTop);
    }
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    // Only allow dragging down if at top of scroll
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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] overflow-y-auto ${currentTheme.cardBg}`}
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
        <div className="flex justify-center pt-4 pb-2">
          <div className="h-1 w-10 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: currentTheme.rawHeaderBorder }}>
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-all"
              aria-label="Close sheet"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Safe area for bottom notch */}
        <div className="h-8" />
      </div>
    </div>
  );
}
