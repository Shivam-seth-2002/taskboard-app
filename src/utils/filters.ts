import type { Task, TaskFilters, TaskPriority } from '../types';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Apply all filters, search, and sorting to a list of tasks.
 * This function is designed to be called within useMemo for performance.
 */
export function filterAndSortTasks(tasks: Task[], filters: TaskFilters): Task[] {
  let result = tasks;

  // Search by title (case-insensitive)
  if (filters.search.trim()) {
    const searchLower = filters.search.trim().toLowerCase();
    result = result.filter((task) =>
      task.title.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status
  if (filters.status !== 'all') {
    result = result.filter((task) => task.status === filters.status);
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    result = result.filter((task) => task.priority === filters.priority);
  }

  // Filter by assignee
  if (filters.assigneeId !== 'all') {
    result = result.filter((task) => task.assigneeId === filters.assigneeId);
  }

  // Sort
  result = [...result].sort((a, b) => {
    let comparison = 0;

    switch (filters.sortField) {
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return filters.sortDirection === 'asc' ? comparison : -comparison;
  });

  return result;
}

/**
 * Check if any filters are active (not in default state).
 */
export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assigneeId !== 'all'
  );
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
