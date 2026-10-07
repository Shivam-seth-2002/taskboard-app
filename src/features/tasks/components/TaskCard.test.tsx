import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '../../../types';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'high',
  projectId: 'p1',
  assigneeId: null,
  dueDate: '2025-12-31T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TaskCard', () => {
  it('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument(); // Priority badge
    expect(screen.getByText('To Do')).toBeInTheDocument(); // Status badge
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onEdit={handleEdit}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    const editButton = screen.getByLabelText('Edit task');
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onEdit={vi.fn()}
        onDelete={handleDelete}
        onStatusChange={vi.fn()}
      />
    );

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(mockTask);
  });

  it('calls onStatusChange with next status when status button is clicked', () => {
    const handleStatusChange = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={handleStatusChange}
      />
    );

    // Initial status is 'todo', next should be 'in-progress'
    const statusButton = screen.getByLabelText('Mark as in-progress');
    fireEvent.click(statusButton);
    expect(handleStatusChange).toHaveBeenCalledWith(mockTask, 'in-progress');
  });
});
