import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Project, ProjectFormData } from '../../../types';
import * as projectApi from '../../../api/project-api';

// --- State ---
interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// --- Actions ---
type ProjectAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Project[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CREATE'; payload: Project }
  | { type: 'UPDATE'; payload: Project }
  | { type: 'DELETE'; payload: string };

// --- Reducer ---
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { projects: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };
    default:
      return state;
  }
}

// --- Contexts (split for performance) ---
const ProjectStateContext = createContext<ProjectState | null>(null);
const ProjectActionsContext = createContext<ProjectActions | null>(null);

interface ProjectActions {
  loadProjects: () => Promise<void>;
  addProject: (data: ProjectFormData) => Promise<Project>;
  editProject: (id: string, data: Partial<ProjectFormData>) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const loadProjects = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const projects = await projectApi.fetchProjects();
      dispatch({ type: 'LOAD_SUCCESS', payload: projects });
    } catch (err) {
      dispatch({
        type: 'LOAD_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load projects',
      });
    }
  }, []);

  const addProject = useCallback(async (data: ProjectFormData): Promise<Project> => {
    const project = await projectApi.createProject(data);
    dispatch({ type: 'CREATE', payload: project });
    return project;
  }, []);

  const editProject = useCallback(async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
    const project = await projectApi.updateProject(id, data);
    dispatch({ type: 'UPDATE', payload: project });
    return project;
  }, []);

  const removeProject = useCallback(async (id: string): Promise<void> => {
    await projectApi.deleteProject(id);
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const actions: ProjectActions = { loadProjects, addProject, editProject, removeProject };

  return (
    <ProjectStateContext.Provider value={state}>
      <ProjectActionsContext.Provider value={actions}>
        {children}
      </ProjectActionsContext.Provider>
    </ProjectStateContext.Provider>
  );
}

export function useProjectState(): ProjectState {
  const context = useContext(ProjectStateContext);
  if (!context) {
    throw new Error('useProjectState must be used within a ProjectProvider');
  }
  return context;
}

export function useProjectActions(): ProjectActions {
  const context = useContext(ProjectActionsContext);
  if (!context) {
    throw new Error('useProjectActions must be used within a ProjectProvider');
  }
  return context;
}
