import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectState, useProjectActions } from './context/ProjectContext';
import { useTaskState, useTaskActions } from '../tasks/context/TaskContext';
import { Badge, Button, ProgressBar, Input, Select, Textarea } from '../../components/ui';
import { LoadingSpinner, ErrorState, EmptyState, useToast } from '../../components/feedback';
import { Modal, ConfirmDialog } from '../../components/modal';
import { formatDate, validateProjectForm } from '../../utils';
import type { Project, ProjectFormData } from '../../types';
import type { ValidationErrors } from '../../utils';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { projects, loading, error } = useProjectState();
  const { loadProjects, addProject, editProject, removeProject } = useProjectActions();
  const { tasks } = useTaskState();
  const { loadAllTasks } = useTaskActions();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
    loadAllTasks();
  }, [loadProjects, loadAllTasks]);

  const projectsWithStats = useMemo(() => {
    return projects.map((project) => {
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
  }, [projects, tasks]);

  const handleCreate = async (data: ProjectFormData) => {
    await addProject(data);
    setShowCreateModal(false);
    showToast('success', 'Project created successfully');
  };

  const handleEdit = async (data: ProjectFormData) => {
    if (!editingProject) return;
    await editProject(editingProject.id, data);
    setEditingProject(null);
    showToast('success', 'Project updated successfully');
  };

  const handleDelete = useCallback(async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await removeProject(deletingProject.id);
      setDeletingProject(null);
      showToast('success', 'Project deleted successfully');
    } catch {
      showToast('error', 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingProject, removeProject, showToast]);

  if (loading && projects.length === 0) {
    return <LoadingSpinner fullPage message="Loading projects..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProjects} />;
  }

  return (
    <div className="projects-page">
      <div className="projects-page__header">
        <p className="projects-page__subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + New Project
        </Button>
      </div>

      {projectsWithStats.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="Create your first project to start managing tasks."
          action={{ label: 'Create Project', onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <div className="projects-grid">
          {projectsWithStats.map((project, index) => (
            <article
              key={project.id}
              className={`project-card animate-fade-in-up stagger-${(index % 6) + 1}`}
            >
              <div className="project-card__header">
                <h3 className="project-card__name">{project.name}</h3>
                <Badge variant="project" projectStatus={project.status} />
              </div>
              <p className="project-card__description">{project.description}</p>
              <div className="project-card__stats">
                <div className="project-card__stat">
                  <span className="project-card__stat-label">Owner</span>
                  <span className="project-card__stat-value">{project.owner}</span>
                </div>
                <div className="project-card__stat">
                  <span className="project-card__stat-label">Due Date</span>
                  <span className="project-card__stat-value">{formatDate(project.dueDate)}</span>
                </div>
                <div className="project-card__stat">
                  <span className="project-card__stat-label">Tasks</span>
                  <span className="project-card__stat-value">{project.completedCount}/{project.taskCount}</span>
                </div>
              </div>
              <ProgressBar value={project.completion} size="sm" />
              <div className="project-card__actions">
                <Button variant="primary" size="sm" onClick={() => navigate(`/projects/${project.id}`)}>
                  Open
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingProject(project)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeletingProject(project)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Project" size="md">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={!!editingProject} onClose={() => setEditingProject(null)} title="Edit Project" size="md">
        {editingProject && (
          <ProjectForm project={editingProject} onSubmit={handleEdit} onCancel={() => setEditingProject(null)} />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}

/* --- Project Form Sub-component --- */
function ProjectForm({
  project,
  onSubmit,
  onCancel,
}: {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || '',
    description: project?.description || '',
    owner: project?.owner || '',
    status: project?.status || 'active',
    dueDate: project?.dueDate ? project.dueDate.split('T')[0] : '',
    teamMemberIds: project?.teamMemberIds || [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProjectForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, dueDate: new Date(formData.dueDate).toISOString() });
    } catch {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
  ];

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <Input label="Project Name" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} id="project-name" />
      <Textarea label="Description" required value={formData.description} onChange={(e) => handleChange('description', e.target.value)} error={errors.description} rows={3} id="project-description" />
      <div className="task-form__row">
        <Input label="Owner" required value={formData.owner} onChange={(e) => handleChange('owner', e.target.value)} error={errors.owner} id="project-owner" />
        <Select label="Status" options={statusOptions} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} id="project-status" />
      </div>
      <Input label="Due Date" required type="date" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} error={errors.dueDate} id="project-due-date" />
      <div className="task-form__actions">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>{project ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
