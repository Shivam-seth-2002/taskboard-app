import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Settings, Theme, LayoutDensity, TaskDisplayMode } from '../../../types';
import { useLocalStorage } from '../../../hooks';
import { DEFAULT_SETTINGS } from '../../../types';

interface SettingsContextType {
  settings: Settings;
  setTheme: (theme: Theme) => void;
  setLayout: (layout: LayoutDensity) => void;
  setTaskDisplay: (display: TaskDisplayMode) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('taskboard_settings', DEFAULT_SETTINGS);

  // Apply theme and layout to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-layout', settings.layout);
  }, [settings.theme, settings.layout]);

  const setTheme = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setLayout = (layout: LayoutDensity) => {
    setSettings((prev) => ({ ...prev, layout }));
  };

  const setTaskDisplay = (display: TaskDisplayMode) => {
    setSettings((prev) => ({ ...prev, taskDisplay: display }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setTheme, setLayout, setTaskDisplay }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
