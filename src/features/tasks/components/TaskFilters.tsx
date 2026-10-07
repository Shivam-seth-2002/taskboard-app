import { Select, Button } from '../../../components/ui';
import { TEAM_MEMBERS } from '../../../api';
import { hasActiveFilters } from '../../../utils';
import type { TaskFilters, TaskStatus, TaskPriority, TaskSortField, SortDirection } from '../../../types';
import './TaskFilters.css';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (updates: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

export function TaskFilterBar({ filters, onFilterChange, onClearFilters, resultCount, totalCount }: TaskFiltersProps) {
  const isFiltered = hasActiveFilters(filters);

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...TEAM_MEMBERS.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <div className="task-filters" role="search" aria-label="Filter tasks">
      <div className="task-filters__bar">
        <div className="task-filters__search">
          <span className="task-filters__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            type="search"
            className="task-filters__search-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            aria-label="Search tasks by title"
            id="task-search"
          />
        </div>

        <div className="task-filters__selects">
          <Select
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as TaskStatus | 'all' })}
            id="filter-status"
          />
          <Select
            options={PRIORITY_OPTIONS}
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value as TaskPriority | 'all' })}
            id="filter-priority"
          />
          <Select
            options={assigneeOptions}
            value={filters.assigneeId}
            onChange={(e) => onFilterChange({ assigneeId: e.target.value })}
            id="filter-assignee"
          />
          <div className="task-filters__sort">
            <Select
              options={SORT_OPTIONS}
              value={filters.sortField}
              onChange={(e) => onFilterChange({ sortField: e.target.value as TaskSortField })}
              id="filter-sort"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFilterChange({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' as SortDirection })
              }
              aria-label={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              title={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortDirection === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      <div className="task-filters__info">
        <span className="task-filters__count">
          {isFiltered ? `${resultCount} of ${totalCount} tasks` : `${totalCount} tasks`}
        </span>

        {/* Active filter chips */}
        {isFiltered && (
          <div className="task-filters__chips">
            {filters.search && (
              <span className="task-filters__chip">
                Search: "{filters.search}"
                <button onClick={() => onFilterChange({ search: '' })} aria-label="Remove search filter">✕</button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="task-filters__chip">
                Status: {filters.status}
                <button onClick={() => onFilterChange({ status: 'all' })} aria-label="Remove status filter">✕</button>
              </span>
            )}
            {filters.priority !== 'all' && (
              <span className="task-filters__chip">
                Priority: {filters.priority}
                <button onClick={() => onFilterChange({ priority: 'all' })} aria-label="Remove priority filter">✕</button>
              </span>
            )}
            {filters.assigneeId !== 'all' && (
              <span className="task-filters__chip">
                Assignee: {TEAM_MEMBERS.find((m) => m.id === filters.assigneeId)?.name}
                <button onClick={() => onFilterChange({ assigneeId: 'all' })} aria-label="Remove assignee filter">✕</button>
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
