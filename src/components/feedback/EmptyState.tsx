import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import './ErrorState.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? (
        <div className="empty-state__icon">{icon}</div>
      ) : (
        <div className="empty-state__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 9h6M9 13h4" />
          </svg>
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
