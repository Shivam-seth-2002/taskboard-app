import { useState, useRef, useEffect } from 'react';
import { Button, Input, Select, Textarea } from '../../../components/ui';
import { TEAM_MEMBERS } from '../../../api';
import { validateTaskForm } from '../../../utils';
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '../../../types';
import type { ValidationErrors } from '../../../utils';
import './TaskForm.css';

interface TaskFormProps {
  projectId: string;
  task?: Task | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ projectId, task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    assigneeId: task?.assigneeId || null,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    projectId: task?.projectId || projectId,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...TEAM_MEMBERS.map((m) => ({ value: m.id, label: m.name })),
  ];

  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value || (field === 'assigneeId' ? null : '') }));
    // Clear field error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateTaskForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        assigneeId: formData.assigneeId || null,
      });
    } catch (err) {
      // Preserve entered data on failure
      setSubmitError(err instanceof Error ? err.message : 'Failed to save task. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="task-form__error-banner" role="alert">
          <span className="task-form__error-icon">⚠</span>
          {submitError}
        </div>
      )}

      <Input
        ref={titleRef}
        label="Title"
        required
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        id="task-title"
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Enter task description (optional)"
        rows={3}
        id="task-description"
      />

      <div className="task-form__row">
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
          id="task-status"
        />
        <Select
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
          id="task-priority"
        />
      </div>

      <div className="task-form__row">
        <Select
          label="Assignee"
          options={assigneeOptions}
          value={formData.assigneeId || ''}
          onChange={(e) => handleChange('assigneeId', e.target.value)}
          id="task-assignee"
        />
        <Input
          label="Due Date"
          required
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          error={errors.dueDate}
          id="task-due-date"
        />
      </div>

      <div className="task-form__actions">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
