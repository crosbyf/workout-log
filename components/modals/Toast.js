import { useUIStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';

export default function Toast() {
  const toastMessage = useUIStore((state) => state.toastMessage);
  const showToast = useUIStore((state) => state.showToast);
  const theme = useThemeStore((state) => state.getCurrentTheme());

  if (!showToast) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }

        .toast-notification {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      <div
        className="toast-notification fixed bottom-24 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-medium"
        style={{
          backgroundColor: '#4b5563',
          color: '#ffffff',
          transform: 'translateX(-50%)',
        }}
      >
        {toastMessage}
      </div>
    </>
  );
}
