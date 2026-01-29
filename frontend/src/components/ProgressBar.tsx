interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Farbe basierend auf Fortschritt
  const getColor = () => {
    if (clampedProgress === 100) return 'bg-green-500';
    if (clampedProgress >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Fortschritt</span>
        <span className="text-sm font-medium text-gray-900">{clampedProgress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-in-out`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
