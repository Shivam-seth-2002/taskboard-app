import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../../../components/feedback';
import type { Task } from '../../../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
  isFiltered: boolean;
  displayMode?: 'list' | 'grid';
}

/**
 * Virtualized task list using @tanstack/react-virtual.
 * Only renders visible items (~20 at a time) even with 1,000+ tasks.
 * This is the primary performance optimization for §10.
 */
export function TaskList({ tasks, onEdit, onDelete, onStatusChange, isFiltered, displayMode = 'list' }: TaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (displayMode === 'grid' ? 200 : 140),
    overscan: 5,
  });

  if (tasks.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          title="No matching tasks"
          message="No tasks match your current filters. Try adjusting your search or filter criteria."
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          }
        />
      );
    }
    return (
      <EmptyState
        title="No tasks yet"
        message="Create your first task to get started with your project."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M12 11v6M9 14h6" />
          </svg>
        }
      />
    );
  }

  return (
    <div
      ref={parentRef}
      className={`task-list task-list--${displayMode}`}
      role="list"
      aria-label={`Task list, ${tasks.length} items`}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const task = tasks[virtualItem.index];
          return (
            <div
              key={task.id}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div style={{ padding: '4px 0' }}>
                <TaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
