'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  /** Se true renderiza versão compacta (ícone + label) para o sidebar */
  sidebar?: boolean
}

export function ThemeToggle({ sidebar = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  if (sidebar) {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary transition-colors w-full group"
      >
        <span className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className="w-4 h-4 absolute transition-all duration-300"
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
            }}
          />
          <Moon
            className="w-4 h-4 absolute transition-all duration-300"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
            }}
          />
        </span>
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </button>
    )
  }

  // Versão compacta (pill toggle) — usada se quiser colocar fora do sidebar
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative w-14 h-7 rounded-full border border-border-primary bg-background-tertiary transition-colors hover:border-border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
    >
      {/* Track fill */}
      <span
        className="absolute inset-0.5 rounded-full transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)',
        }}
      />
      {/* Thumb */}
      <span
        className="absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center"
        style={{
          left: isDark ? 'calc(100% - 1.5rem)' : '0.25rem',
          background: isDark ? '#1e40af' : '#f59e0b',
        }}
      >
        {isDark
          ? <Moon  className="w-3 h-3 text-blue-200" />
          : <Sun   className="w-3 h-3 text-amber-100" />
        }
      </span>
    </button>
  )
}
