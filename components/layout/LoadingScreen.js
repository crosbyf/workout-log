import { useThemeStore } from '../../stores/themeStore';

export default function LoadingScreen() {
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();

  const getLineColor = () => {
    const themeName = currentTheme.name || 'light';
    if (themeName === 'neon') return 'bg-green-400';
    if (themeName === 'forest') return 'bg-green-500';
    return 'bg-blue-400';
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center ${currentTheme.bg} ${currentTheme.text}`}
      style={{
        backgroundColor: currentTheme.rawBg,
        color: currentTheme.rawText,
      }}
    >
      <h1 className="text-6xl font-black tracking-tight mb-2">GORS</h1>
      <div className={`h-1 w-16 ${getLineColor()} rounded mb-6`}></div>
      <p className="text-sm tracking-widest uppercase opacity-75">Be About It</p>
    </div>
  );
}
