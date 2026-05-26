'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  // Sincroniza com o que o script inline já aplicou no <html>
  useEffect(() => {
    const stored = localStorage.getItem('meridian-theme') as Theme | null
    const initial = stored ?? 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('meridian-theme', next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Script inline injetado no <head> para aplicar o tema ANTES da primeira
 * pintura — evita o flash branco/preto na carga inicial.
 */
export function ThemeScript() {
  const script = `
    (function(){
      try {
        var t = localStorage.getItem('meridian-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', t);
      } catch(e){}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
