import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectState, useProjectActions } from '../projects/context/ProjectContext';
import { useTaskState, useTaskActions } from '../tasks/context/TaskContext';
import { Badge, ProgressBar, Avatar } from '../../components/ui';
import { LoadingSpinner, ErrorState } from '../../components/feedback';
import { TEAM_MEMBERS } from '../../api';
import { formatRelativeTime } from '../../utils';
import type { Task } from '../../types';
import './DashboardPage.css';

export default function DashboardPage() {
  const { projects, loading: projLoading, error: projError } = useProjectState();
  const { loadProjects } = useProjectActions();
  const { tasks, loading: taskLoading, error: taskError } = useTaskState();
  const { loadAllTasks } = useTaskActions();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadAllTasks();
  }, [loadProjects, loadAllTasks]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
    const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;

    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);

    const projectStats = projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const completed = projectTasks.filter((t) => t.status === 'completed').length;
      const total = projectTasks.length;
      return {
        ...project,
        taskCount: total,
        completedCount: completed,
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return { totalTasks, completedTasks, pendingTasks, highPriority, recentTasks, projectStats };
  }, [tasks, projects]);

  const loading = projLoading || taskLoading;
  const error = projError || taskError;

  if (loading && tasks.length === 0) {
    return <LoadingSpinner fullPage message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => { loadProjects(); loadAllTasks(); }} />;
  }

  const getMemberName = (id: string | null) => TEAM_MEMBERS.find((m) => m.id === id)?.name || 'Unassigned';

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="dashboard__stats">
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          }
          label="Total Projects"
          value={projects.length}
          color="primary"
          delay={0}
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          }
          label="Total Tasks"
          value={stats.totalTasks}
          color="info"
          delay={1}
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
          label="Completed"
          value={stats.completedTasks}
          color="success"
          delay={2}
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
          label="Pending"
          value={stats.pendingTasks}
          color="warning"
          delay={3}
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          }
          label="High Priority"
          value={stats.highPriority}
          color="danger"
          delay={4}
        />
      </div>

      <div className="dashboard__grid">
        {/* Project Progress */}
        <section className="dashboard__section dashboard__section--projects">
          <h2 className="dashboard__section-title">Project Progress</h2>
          <div className="dashboard__project-list">
            {stats.projectStats.map((project) => (
              <button
                key={project.id}
                className="dashboard__project-item"
                onClick={() => navigate(`/projects/${project.id}`)}
                aria-label={`Open ${project.name}: ${project.completion}% complete`}
              >
                <div className="dashboard__project-info">
                  <span className="dashboard__project-name">{project.name}</span>
                  <span className="dashboard__project-meta">
                    {project.completedCount}/{project.taskCount} tasks
                  </span>
                </div>
                <ProgressBar value={project.completion} size="sm" />
              </button>
            ))}
            {stats.projectStats.length === 0 && (
              <p className="dashboard__empty-text">No projects yet</p>
            )}
          </div>
        </section>

        {/* Recent Tasks */}
        <section className="dashboard__section dashboard__section--recent">
          <h2 className="dashboard__section-title">Recently Updated Tasks</h2>
          <div className="dashboard__task-list">
            {stats.recentTasks.map((task: Task) => (
              <div key={task.id} className="dashboard__task-item">
                <div className="dashboard__task-left">
                  <span className="dashboard__task-title">{task.title}</span>
                  <div className="dashboard__task-meta">
                    <Badge variant="status" status={task.status} size="sm" />
                    <Badge variant="priority" priority={task.priority} size="sm" />
                    <span className="dashboard__task-assignee">
                      {task.assigneeId && <Avatar name={getMemberName(task.assigneeId)} size="sm" />}
                    </span>
                  </div>
                </div>
                <span className="dashboard__task-time">{formatRelativeTime(task.updatedAt)}</span>
              </div>
            ))}
            {stats.recentTasks.length === 0 && (
              <p className="dashboard__empty-text">No tasks yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* Stat card sub-component */
function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <div className={`stat-card stat-card--${color} animate-fade-in-up stagger-${delay + 1}`}>
      <div className="stat-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-card__content">
        <span className="stat-card__value animate-count-up">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
}
