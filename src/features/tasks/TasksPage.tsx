import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTaskState, useTaskActions } from './context/TaskContext';
import { useProjectState, useProjectActions } from '../projects/context/ProjectContext';
import { useSettings } from '../settings/context/SettingsContext';
import { useDebounce } from '../../hooks';
import { Button } from '../../components/ui';
import { LoadingSpinner, ErrorState, useToast } from '../../components/feedback';
import { Modal, ConfirmDialog } from '../../components/modal';
import { TaskFilterBar } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { filterAndSortTasks, hasActiveFilters } from '../../utils';
import type { Task, TaskFormData, TaskFilters } from '../../types';
import { DEFAULT_TASK_FILTERS } from '../../types';
import './TasksPage.css';

export default function TasksPage() {
  const { tasks, loading, error } = useTaskState();
  const { loadAllTasks, addTask, editTask, removeTask } = useTaskActions();
  const { projects } = useProjectState();
  const { loadProjects } = useProjectActions();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    loadAllTasks();
    if (projects.length === 0) loadProjects();
  }, [loadAllTasks, loadProjects, projects.length]);

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, effectiveFilters),
    [tasks, effectiveFilters]
  );

  const isFiltered = hasActiveFilters(effectiveFilters);

  const handleFilterChange = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_TASK_FILTERS);
  }, []);

  // Default to first project for task creation
  const defaultProjectId = projects.length > 0 ? projects[0].id : '';

  const handleCreateTask = async (data: TaskFormData) => {
    await addTask(data);
    setShowCreateModal(false);
    showToast('success', 'Task created successfully');
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    await editTask(editingTask.id, data);
    setEditingTask(null);
    showToast('success', 'Task updated successfully');
  };

  const handleStatusChange = useCallback(async (task: Task, status: Task['status']) => {
    await editTask(task.id, { status });
    showToast('success', `Task marked as ${status}`);
  }, [editTask, showToast]);

  const handleDelete = useCallback(async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await removeTask(deletingTask.id);
      setDeletingTask(null);
      showToast('success', 'Task deleted successfully');
    } catch {
      showToast('error', 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingTask, removeTask, showToast]);

  if (loading && tasks.length === 0) {
    return <LoadingSpinner fullPage message="Loading tasks..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAllTasks} />;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-page__header">
        <p className="tasks-page__subtitle">All tasks across projects</p>
        <Button variant="primary" onClick={() => setShowCreateModal(true)} disabled={projects.length === 0}>
          + New Task
        </Button>
      </div>

      <TaskFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <TaskList
        tasks={filteredTasks}
        onEdit={setEditingTask}
        onDelete={setDeletingTask}
        onStatusChange={handleStatusChange}
        isFiltered={isFiltered}
        displayMode={settings.taskDisplay}
      />

      {/* Create */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task" size="md">
        <TaskForm projectId={defaultProjectId} onSubmit={handleCreateTask} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task" size="md">
        {editingTask && (
          <TaskForm projectId={editingTask.projectId} task={editingTask} onSubmit={handleEditTask} onCancel={() => setEditingTask(null)} />
        )}
      </Modal>

      {/* Delete */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
