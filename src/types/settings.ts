export type Theme = 'light' | 'dark';
export type LayoutDensity = 'compact' | 'comfortable';
export type TaskDisplayMode = 'list' | 'grid';

export interface Settings {
  theme: Theme;
  layout: LayoutDensity;
  taskDisplay: TaskDisplayMode;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  layout: 'comfortable',
  taskDisplay: 'list',
};
