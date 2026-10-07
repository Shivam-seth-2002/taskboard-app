import type { TaskFormData } from '../types';

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate task form data. Returns an object of field -> error message.
 * Empty object means validation passed.
 */
export function validateTaskForm(data: TaskFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title.trim()) {
    errors.title = 'Task title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Task title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Task title must be under 100 characters';
  }

  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  }

  if (!data.projectId) {
    errors.projectId = 'Project is required';
  }

  return errors;
}

/**
 * Validate project form data.
 */
export function validateProjectForm(data: { name: string; description: string; owner: string; dueDate: string }): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Project name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Project name must be at least 3 characters';
  }

  if (!data.description.trim()) {
    errors.description = 'Project description is required';
  }

  if (!data.owner.trim()) {
    errors.owner = 'Project owner is required';
  }

  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  }

  return errors;
}
