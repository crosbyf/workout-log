import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

export default function Toast() {
  const { showToast, toastMessage, showToastMessage } = useUIStore();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        showToastMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, showToastMessage]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-sm mx-auto text-center">
        {toastMessage}
      </div>
    </div>
  );
}
