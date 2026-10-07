import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectState, useProjectActions } from '../projects/context/ProjectContext';
import { useTaskState, useTaskActions } from '../tasks/context/TaskContext';
import { useSettings } from '../settings/context/SettingsContext';
import { useDebounce } from '../../hooks';
import { Badge, Button, ProgressBar, Avatar } from '../../components/ui';
import { LoadingSpinner, ErrorState, useToast } from '../../components/feedback';
import { Modal, ConfirmDialog } from '../../components/modal';
import { TaskFilterBar } from '../tasks/components/TaskFilters';
import { TaskList } from '../tasks/components/TaskList';
import { TaskForm } from '../tasks/components/TaskForm';
import { TEAM_MEMBERS } from '../../api';
import { filterAndSortTasks, hasActiveFilters, formatDate } from '../../utils';
import type { Task, TaskFormData, TaskFilters } from '../../types';
import { DEFAULT_TASK_FILTERS } from '../../types';
import './ProjectDetailPage.css';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { settings } = useSettings();

  const { projects, loading: projLoading } = useProjectState();
  const { loadProjects } = useProjectActions();
  const { tasks, loading: taskLoading, error: taskError } = useTaskState();
  const { loadTasks, addTask, editTask, removeTask } = useTaskActions();

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, [projects.length, loadProjects]);

  useEffect(() => {
    if (id) loadTasks(id);
  }, [id, loadTasks]);

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);
  const teamMembers = useMemo(
    () => TEAM_MEMBERS.filter((m) => project?.teamMemberIds.includes(m.id)),
    [project]
  );

  // Memoized filtering with debounced search — critical for 1,000+ tasks
  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, effectiveFilters),
    [tasks, effectiveFilters]
  );

  const isFiltered = hasActiveFilters(effectiveFilters);

  const taskStats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    completion: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) : 0,
  }), [tasks]);

  const handleFilterChange = useCallback((updates: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_TASK_FILTERS);
  }, []);

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

  if (projLoading && !project) {
    return <LoadingSpinner fullPage message="Loading project..." />;
  }

  if (!project) {
    return (
      <ErrorState
        title="Project not found"
        message={`No project found with ID "${id}". It may have been deleted.`}
        onRetry={() => navigate('/projects')}
      />
    );
  }

  return (
    <div className="project-detail">
      {/* Project Header */}
      <div className="project-detail__header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </Button>
        <div className="project-detail__info">
          <div className="project-detail__title-row">
            <h2 className="project-detail__name">{project.name}</h2>
            <Badge variant="project" projectStatus={project.status} size="md" />
          </div>
          <p className="project-detail__description">{project.description}</p>
          <div className="project-detail__meta">
            <span>Owner: <strong>{project.owner}</strong></span>
            <span>Due: <strong>{formatDate(project.dueDate)}</strong></span>
          </div>
        </div>
      </div>

      {/* Stats + Team + Progress */}
      <div className="project-detail__overview">
        <div className="project-detail__stats-grid">
          <div className="mini-stat mini-stat--todo">
            <span className="mini-stat__value">{taskStats.todo}</span>
            <span className="mini-stat__label">To Do</span>
          </div>
          <div className="mini-stat mini-stat--inprogress">
            <span className="mini-stat__value">{taskStats.inProgress}</span>
            <span className="mini-stat__label">In Progress</span>
          </div>
          <div className="mini-stat mini-stat--completed">
            <span className="mini-stat__value">{taskStats.completed}</span>
            <span className="mini-stat__label">Completed</span>
          </div>
          <div className="mini-stat mini-stat--total">
            <span className="mini-stat__value">{taskStats.total}</span>
            <span className="mini-stat__label">Total</span>
          </div>
        </div>

        <div className="project-detail__progress">
          <ProgressBar value={taskStats.completion} size="lg" />
        </div>

        {teamMembers.length > 0 && (
          <div className="project-detail__team">
            <h3 className="project-detail__section-title">Team Members</h3>
            <div className="project-detail__team-list">
              {teamMembers.map((member) => (
                <div key={member.id} className="project-detail__team-member" title={`${member.name} — ${member.role}`}>
                  <Avatar name={member.name} size="md" />
                  <div className="project-detail__member-info">
                    <span className="project-detail__member-name">{member.name}</span>
                    <span className="project-detail__member-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Management */}
      <div className="project-detail__tasks">
        <div className="project-detail__tasks-header">
          <h3 className="project-detail__section-title">Tasks</h3>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
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

        {taskLoading && tasks.length === 0 ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : taskError ? (
          <ErrorState message={taskError} onRetry={() => id && loadTasks(id)} />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
            isFiltered={isFiltered}
            displayMode={settings.taskDisplay}
          />
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task" size="md">
        <TaskForm projectId={id!} onSubmit={handleCreateTask} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task" size="md">
        {editingTask && (
          <TaskForm projectId={id!} task={editingTask} onSubmit={handleEditTask} onCancel={() => setEditingTask(null)} />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
