import type { Project, ProjectFormData } from '../types';
import { apiRequest, getStorageData, setStorageData, STORAGE_KEYS } from './api-client';
import { generateSeedProjects } from './seed-data';
import { generateId } from '../utils/filters';

function getProjects(): Project[] {
  return getStorageData<Project[]>(STORAGE_KEYS.PROJECTS) ?? [];
}

function saveProjects(projects: Project[]): void {
  setStorageData(STORAGE_KEYS.PROJECTS, projects);
}

/**
 * Fetch all projects.
 */
export async function fetchProjects(): Promise<Project[]> {
  return apiRequest(() => getProjects());
}

/**
 * Fetch a single project by ID.
 */
export async function fetchProject(id: string): Promise<Project> {
  return apiRequest(() => {
    const projects = getProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) {
      throw new Error(`Project with ID "${id}" not found`);
    }
    return project;
  });
}

/**
 * Create a new project.
 */
export async function createProject(data: ProjectFormData): Promise<Project> {
  return apiRequest(() => {
    const projects = getProjects();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj-${generateId()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    projects.push(newProject);
    saveProjects(projects);
    return newProject;
  });
}

/**
 * Update an existing project.
 */
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
  return apiRequest(() => {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Project with ID "${id}" not found`);
    }
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveProjects(projects);
    return projects[index];
  });
}

/**
 * Delete a project by ID.
 */
export async function deleteProject(id: string): Promise<void> {
  return apiRequest(() => {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Project with ID "${id}" not found`);
    }
    projects.splice(index, 1);
    saveProjects(projects);
  });
}

/**
 * Initialize seed data if not already present.
 */
export function initializeProjectData(): void {
  const initialized = getStorageData<boolean>(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    const seedProjects = generateSeedProjects();
    saveProjects(seedProjects);
  }
}
