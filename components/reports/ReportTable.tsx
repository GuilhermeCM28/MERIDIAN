import type { CategoryItem } from '@/types'
import { formatBRL } from '@/lib/utils'

interface ReportTableProps {
  data: CategoryItem[]
  totalExpenses: number
}

const PALETTE = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
]

export function ReportTable({ data, totalExpenses }: ReportTableProps) {
  if (data.length === 0) {
    return (
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
        Nenhum dado disponível
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((item, i) => (
        <div key={item.category} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE[i % PALETTE.length] }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.category}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatBRL(item.amount)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.count} lançamentos</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.pct}%</div>
          </div>
        </div>
      ))}
      
      {/* Total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="ti ti-sum" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Total de gastos</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatBRL(totalExpenses)}</div>
        </div>
      </div>
    </div>
  )
}
