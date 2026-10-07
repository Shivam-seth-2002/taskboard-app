import { useSettings } from './context/SettingsContext';
import { Button } from '../../components/ui';
import type { Theme, LayoutDensity, TaskDisplayMode } from '../../types';
import './SettingsPage.css';

export default function SettingsPage() {
  const { settings, setTheme, setLayout, setTaskDisplay } = useSettings();

  return (
    <div className="settings-page">
      <p className="settings-page__subtitle">Customize your experience. Preferences are saved automatically.</p>

      <div className="settings-page__sections">
        {/* Theme */}
        <section className="settings-section">
          <h2 className="settings-section__title">Appearance</h2>
          <div className="settings-option">
            <div className="settings-option__info">
              <h3 className="settings-option__label">Theme</h3>
              <p className="settings-option__description">Choose between light and dark mode</p>
            </div>
            <div className="settings-option__controls">
              {(['light', 'dark'] as Theme[]).map((theme) => (
                <Button
                  key={theme}
                  variant={settings.theme === theme ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme(theme)}
                  aria-pressed={settings.theme === theme}
                >
                  {theme === 'light' ? '☀ Light' : '🌙 Dark'}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Layout Density */}
        <section className="settings-section">
          <h2 className="settings-section__title">Layout</h2>
          <div className="settings-option">
            <div className="settings-option__info">
              <h3 className="settings-option__label">Density</h3>
              <p className="settings-option__description">Adjust spacing and padding throughout the app</p>
            </div>
            <div className="settings-option__controls">
              {(['comfortable', 'compact'] as LayoutDensity[]).map((layout) => (
                <Button
                  key={layout}
                  variant={settings.layout === layout ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLayout(layout)}
                  aria-pressed={settings.layout === layout}
                >
                  {layout === 'comfortable' ? '▣ Comfortable' : '▤ Compact'}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Task Display */}
        <section className="settings-section">
          <h2 className="settings-section__title">Tasks</h2>
          <div className="settings-option">
            <div className="settings-option__info">
              <h3 className="settings-option__label">Display Mode</h3>
              <p className="settings-option__description">Choose how tasks are displayed in lists</p>
            </div>
            <div className="settings-option__controls">
              {(['list', 'grid'] as TaskDisplayMode[]).map((display) => (
                <Button
                  key={display}
                  variant={settings.taskDisplay === display ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTaskDisplay(display)}
                  aria-pressed={settings.taskDisplay === display}
                >
                  {display === 'list' ? '☰ List' : '▦ Grid'}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
