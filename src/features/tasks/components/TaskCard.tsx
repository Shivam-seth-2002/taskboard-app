import { memo } from 'react';
import { Badge, Avatar, Button } from '../../../components/ui';
import { TEAM_MEMBERS } from '../../../api';
import { formatDate, isOverdue } from '../../../utils';
import type { Task } from '../../../types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

/**
 * TaskCard is wrapped in React.memo to prevent unnecessary re-renders
 * when used inside a virtualized list with 1,000+ tasks.
 */
export const TaskCard = memo(function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const assignee = TEAM_MEMBERS.find((m) => m.id === task.assigneeId);
  const overdue = task.status !== 'completed' && isOverdue(task.dueDate);

  const nextStatus: Record<string, Task['status']> = {
    'todo': 'in-progress',
    'in-progress': 'completed',
    'completed': 'todo',
  };

  return (
    <article className={`task-card ${overdue ? 'task-card--overdue' : ''}`} aria-label={`Task: ${task.title}`}>
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <div className="task-card__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(task, nextStatus[task.status])}
            aria-label={`Mark as ${nextStatus[task.status]}`}
            title={`Mark as ${nextStatus[task.status]}`}
          >
            {task.status === 'completed' ? '↩' : '✓'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} aria-label="Edit task">
            ✎
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task)} aria-label="Delete task">
            🗑
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      <div className="task-card__footer">
        <div className="task-card__badges">
          <Badge variant="status" status={task.status} />
          <Badge variant="priority" priority={task.priority} />
        </div>
        <div className="task-card__meta">
          {assignee && (
            <div className="task-card__assignee" title={assignee.name}>
              <Avatar name={assignee.name} size="sm" />
              <span className="task-card__assignee-name">{assignee.name}</span>
            </div>
          )}
          <span className={`task-card__date ${overdue ? 'task-card__date--overdue' : ''}`}>
            {overdue && <span aria-hidden="true">⚠ </span>}
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </article>
  );
});
