import type { TaskStatus, TaskPriority, ProjectStatus } from '../../types';
import './Badge.css';

type BadgeVariant = 'status' | 'priority' | 'project' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectStatus?: ProjectStatus;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string }> = {
  'todo': { label: 'To Do', icon: '○' },
  'in-progress': { label: 'In Progress', icon: '◐' },
  'completed': { label: 'Completed', icon: '●' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: string }> = {
  low: { label: 'Low', icon: '↓' },
  medium: { label: 'Medium', icon: '→' },
  high: { label: 'High', icon: '↑' },
};

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string }> = {
  active: { label: 'Active' },
  completed: { label: 'Completed' },
  'on-hold': { label: 'On Hold' },
};

export function Badge({ variant = 'default', status, priority, projectStatus, label, size = 'sm' }: BadgeProps) {
  let badgeClass = 'badge';
  let displayLabel = label || '';
  let icon = '';

  if (variant === 'status' && status) {
    const config = STATUS_CONFIG[status];
    badgeClass += ` badge--status-${status}`;
    displayLabel = config.label;
    icon = config.icon;
  } else if (variant === 'priority' && priority) {
    const config = PRIORITY_CONFIG[priority];
    badgeClass += ` badge--priority-${priority}`;
    displayLabel = config.label;
    icon = config.icon;
  } else if (variant === 'project' && projectStatus) {
    const config = PROJECT_STATUS_CONFIG[projectStatus];
    badgeClass += ` badge--project-${projectStatus}`;
    displayLabel = config.label;
  } else {
    badgeClass += ' badge--default';
  }

  badgeClass += ` badge--${size}`;

  return (
    <span className={badgeClass} role="status">
      {icon && <span className="badge__icon" aria-hidden="true">{icon}</span>}
      <span className="badge__label">{displayLabel}</span>
    </span>
  );
}
