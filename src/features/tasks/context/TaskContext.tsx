import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Task, TaskFormData } from '../../../types';
import * as taskApi from '../../../api/task-api';

// --- State ---
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// --- Actions ---
type TaskAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Task[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CREATE'; payload: Task }
  | { type: 'UPDATE'; payload: Task }
  | { type: 'DELETE'; payload: string };

// --- Reducer ---
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { tasks: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// --- Contexts (split for performance) ---
const TaskStateContext = createContext<TaskState | null>(null);
const TaskActionsContext = createContext<TaskActions | null>(null);

interface TaskActions {
  loadTasks: (projectId?: string) => Promise<void>;
  loadAllTasks: () => Promise<void>;
  addTask: (data: TaskFormData) => Promise<Task>;
  editTask: (id: string, data: Partial<TaskFormData>) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const loadTasks = useCallback(async (projectId?: string) => {
    dispatch({ type: 'LOAD_START' });
    try {
      const tasks = await taskApi.fetchTasks(projectId);
      dispatch({ type: 'LOAD_SUCCESS', payload: tasks });
    } catch (err) {
      dispatch({
        type: 'LOAD_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load tasks',
      });
    }
  }, []);

  const loadAllTasks = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const tasks = await taskApi.fetchTasks();
      dispatch({ type: 'LOAD_SUCCESS', payload: tasks });
    } catch (err) {
      dispatch({
        type: 'LOAD_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load tasks',
      });
    }
  }, []);

  const addTask = useCallback(async (data: TaskFormData): Promise<Task> => {
    const task = await taskApi.createTask(data);
    dispatch({ type: 'CREATE', payload: task });
    return task;
  }, []);

  const editTask = useCallback(async (id: string, data: Partial<TaskFormData>): Promise<Task> => {
    const task = await taskApi.updateTask(id, data);
    dispatch({ type: 'UPDATE', payload: task });
    return task;
  }, []);

  const removeTask = useCallback(async (id: string): Promise<void> => {
    await taskApi.deleteTask(id);
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const actions: TaskActions = { loadTasks, loadAllTasks, addTask, editTask, removeTask };

  return (
    <TaskStateContext.Provider value={state}>
      <TaskActionsContext.Provider value={actions}>
        {children}
      </TaskActionsContext.Provider>
    </TaskStateContext.Provider>
  );
}

export function useTaskState(): TaskState {
  const context = useContext(TaskStateContext);
  if (!context) {
    throw new Error('useTaskState must be used within a TaskProvider');
  }
  return context;
}

export function useTaskActions(): TaskActions {
  const context = useContext(TaskActionsContext);
  if (!context) {
    throw new Error('useTaskActions must be used within a TaskProvider');
  }
  return context;
}
