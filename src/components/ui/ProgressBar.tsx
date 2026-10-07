import './ProgressBar.css';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ProgressBar({ value, size = 'md', showLabel = true, variant }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const autoVariant = variant || (clampedValue >= 80 ? 'success' : clampedValue >= 40 ? 'default' : 'warning');

  return (
    <div className={`progress progress--${size}`}>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clampedValue}% complete`}
      >
        <div
          className={`progress__fill progress__fill--${autoVariant}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress__label">{Math.round(clampedValue)}%</span>
      )}
    </div>
  );
}
