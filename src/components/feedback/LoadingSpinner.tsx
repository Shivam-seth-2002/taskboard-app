import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', message, fullPage = false }: LoadingSpinnerProps) {
  const content = (
    <div className={`spinner spinner--${size}`} role="status" aria-live="polite">
      <div className="spinner__ring" aria-hidden="true">
        <div className="spinner__circle" />
      </div>
      {message && <p className="spinner__message">{message}</p>}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );

  if (fullPage) {
    return <div className="spinner__fullpage">{content}</div>;
  }

  return content;
}
