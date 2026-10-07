import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout';
import { ToastProvider } from './components/feedback';
import { ErrorBoundary } from './components/feedback';
import { SettingsProvider } from './features/settings/context/SettingsContext';
import { ProjectProvider } from './features/projects/context/ProjectContext';
import { TaskProvider } from './features/tasks/context/TaskContext';
import { AppRoutes } from './routes';
import { initializeProjectData } from './api/project-api';
import { initializeTaskData } from './api/task-api';

// Initialize seed data on app load
initializeProjectData();
initializeTaskData();

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <ToastProvider>
            <ProjectProvider>
              <TaskProvider>
                <AppShell>
                  <AppRoutes />
                </AppShell>
              </TaskProvider>
            </ProjectProvider>
          </ToastProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
