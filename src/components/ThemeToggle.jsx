import { Icon } from './Icon.jsx'

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="topbar-action theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      <Icon name={isDark ? 'Sun' : 'Moon'} size={20} />
    </button>
  )
}

export function TopBarActions({ theme, onToggleTheme, children }) {
  return (
    <div className="topbar-actions">
      {onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
      {children}
    </div>
  )
}
