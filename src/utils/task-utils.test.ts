import { describe, it, expect } from 'vitest';
import { filterAndSortTasks } from './filters';
import type { Task, TaskFilters } from '../types';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Alpha Task',
    description: 'First task',
    status: 'todo',
    priority: 'low',
    projectId: 'p1',
    assigneeId: 'a1',
    dueDate: '2025-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Beta Task',
    description: 'Second task',
    status: 'in-progress',
    priority: 'high',
    projectId: 'p1',
    assigneeId: 'a2',
    dueDate: '2025-02-01T00:00:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Gamma Task',
    description: 'Third task',
    status: 'completed',
    priority: 'medium',
    projectId: 'p2',
    assigneeId: 'a1',
    dueDate: '2025-03-01T00:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  sortField: 'createdAt',
  sortDirection: 'desc',
};

describe('filterAndSortTasks', () => {
  it('returns all tasks when no filters are applied', () => {
    const result = filterAndSortTasks(mockTasks, defaultFilters);
    expect(result).toHaveLength(3);
  });

  it('filters tasks by search string (title)', () => {
    const result = filterAndSortTasks(mockTasks, { ...defaultFilters, search: 'beta' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters tasks by status', () => {
    const result = filterAndSortTasks(mockTasks, { ...defaultFilters, status: 'in-progress' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters tasks by multiple criteria', () => {
    const result = filterAndSortTasks(mockTasks, {
      ...defaultFilters,
      priority: 'low',
      assigneeId: 'a1',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('sorts tasks by title ascending', () => {
    const result = filterAndSortTasks(mockTasks, {
      ...defaultFilters,
      sortField: 'title',
      sortDirection: 'asc',
    });
    expect(result[0].title).toBe('Alpha Task');
    expect(result[1].title).toBe('Beta Task');
    expect(result[2].title).toBe('Gamma Task');
  });

  it('sorts tasks by priority descending (high -> medium -> low)', () => {
    const result = filterAndSortTasks(mockTasks, {
      ...defaultFilters,
      sortField: 'priority',
      sortDirection: 'desc',
    });
    expect(result[0].priority).toBe('high');
    expect(result[1].priority).toBe('medium');
    expect(result[2].priority).toBe('low');
  });
});
