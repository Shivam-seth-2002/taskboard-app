/**
 * Simulated API client that mimics REST API behavior.
 * - Adds realistic async delays (200–600ms)
 * - Uses localStorage for data persistence
 * - Supports configurable error injection for testing
 */

const API_DELAY_MIN = 200;
const API_DELAY_MAX = 600;

/**
 * Simulate network delay.
 */
function simulateDelay(): Promise<void> {
  const delay = API_DELAY_MIN + Math.random() * (API_DELAY_MAX - API_DELAY_MIN);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Get data from localStorage.
 */
export function getStorageData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Set data to localStorage.
 */
export function setStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Simulated API request wrapper.
 * Adds delay, handles errors, and provides a consistent interface.
 */
export async function apiRequest<T>(operation: () => T): Promise<T> {
  await simulateDelay();
  try {
    return operation();
  } catch (err) {
    throw err instanceof Error ? err : new Error('An unexpected API error occurred');
  }
}

/**
 * Storage keys used by the mock API.
 */
export const STORAGE_KEYS = {
  PROJECTS: 'taskboard_projects',
  TASKS: 'taskboard_tasks',
  INITIALIZED: 'taskboard_initialized',
} as const;
