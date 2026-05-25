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
      className="flex items-center justify-between px-6 py-5 border-b border-border-primary shrink-0 bg-background-primary/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm"
      style={style}
    >
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] font-medium text-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}
