export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  teamMemberIds: string[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  dueDate: string;
  teamMemberIds: string[];
}
