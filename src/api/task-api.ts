import type { Task, TaskFormData } from '../types';
import { apiRequest, getStorageData, setStorageData, STORAGE_KEYS } from './api-client';
import { generateSeedTasks } from './seed-data';
import { generateId } from '../utils/filters';

function getTasks(): Task[] {
  return getStorageData<Task[]>(STORAGE_KEYS.TASKS) ?? [];
}

function saveTasks(tasks: Task[]): void {
  setStorageData(STORAGE_KEYS.TASKS, tasks);
}

/**
 * Fetch all tasks, optionally filtered by projectId.
 */
export async function fetchTasks(projectId?: string): Promise<Task[]> {
  return apiRequest(() => {
    const tasks = getTasks();
    if (projectId) {
      return tasks.filter((t) => t.projectId === projectId);
    }
    return tasks;
  });
}

/**
 * Fetch a single task by ID.
 */
export async function fetchTask(id: string): Promise<Task> {
  return apiRequest(() => {
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task with ID "${id}" not found`);
    }
    return task;
  });
}

/**
 * Create a new task.
 */
export async function createTask(data: TaskFormData): Promise<Task> {
  return apiRequest(() => {
    const tasks = getTasks();
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${generateId()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  });
}

/**
 * Update an existing task.
 */
export async function updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
  return apiRequest(() => {
    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" not found`);
    }
    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveTasks(tasks);
    return tasks[index];
  });
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: string): Promise<void> {
  return apiRequest(() => {
    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" not found`);
    }
    tasks.splice(index, 1);
    saveTasks(tasks);
  });
}

/**
 * Initialize seed task data if not already present.
 */
export function initializeTaskData(): void {
  const initialized = getStorageData<boolean>(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    const seedTasks = generateSeedTasks();
    saveTasks(seedTasks);
    setStorageData(STORAGE_KEYS.INITIALIZED, true);
  }
}
