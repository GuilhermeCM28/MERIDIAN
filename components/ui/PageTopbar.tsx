/**
 * PageTopbar — Barra de topo padrão das páginas do dashboard.
 *
 * Elimina o padrão copy-paste que existia em todas as páginas:
 *   - dashboard/page.tsx
 *   - transactions/page.tsx
 *   - reports/page.tsx
 *   - ai-tips/page.tsx
 *   - settings/page.tsx
 *
 * @example
 * <PageTopbar
 *   title="Transações"
 *   subtitle="48 registros · maio 2026"
 * >
 *   <Link href="/transactions/new" className="btn-primary">+ Nova</Link>
 * </PageTopbar>
 */

import type { ReactNode, CSSProperties } from 'react'

interface PageTopbarProps {
  /** Título principal (negrito, tamanho 15) */
  title: ReactNode
  /** Subtítulo opcional abaixo do título */
  subtitle?: ReactNode
  /** Elementos no lado direito (botões, links, selects…) */
  children?: ReactNode
  /** Overrides de estilo para o container */
  style?: CSSProperties
}

export function PageTopbar({ title, subtitle, children, style }: PageTopbarProps) {
  return (
    <div 
      className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/60 shrink-0 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10"
      style={style}
    >
      <div>
        <div className="text-[15px] font-medium text-white">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-neutral-400 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
