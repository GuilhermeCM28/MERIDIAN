import { createClient }        from '@/lib/supabase/server'
import { Suspense }            from 'react'
import { PageTopbar }          from '@/components/ui/PageTopbar'
import { MonthPicker }         from '@/components/reports/MonthPicker'
import { CategoryPieChart }    from '@/components/reports/CategoryPieChart'
import { ReportTable }         from '@/components/reports/ReportTable'
import { ExportCsvButton }     from '@/components/reports/ExportCsvButton'
import { lastDayOfMonth, formatBRL } from '@/lib/utils'
import type { CategoryItem, Transaction } from '@/types'

export const metadata = {
  title: 'Relatórios — Meridian',
  description: 'Resumo mensal e exportação de dados financeiros',
}

interface SearchParams {
  month?: string
}



async function ReportContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now   = new Date()
  const month = searchParams.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = month.split('-').map(Number)

  const from = `${year}-${String(mon).padStart(2, '0')}-01`
  const to   = lastDayOfMonth(year, mon)

  const { data: txs } = await supabase
    .from('transactions')
    .select('*, category:categories(id, name, color)')
    .eq('user_id', user.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('name, monthly_limit')
    .eq('user_id', user.id)

  // Build category limits map
  const categoryLimits: Record<string, number | null> = {}
  categoriesData?.forEach(c => { categoryLimits[c.name] = c.monthly_limit ?? null })

  const transactions = (txs ?? []) as Transaction[]
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Breakdown por categoria
  const catMap: Record<string, { amount: number; count: number }> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const name = t.category?.name ?? 'Outros'
    if (!catMap[name]) catMap[name] = { amount: 0, count: 0 }
    catMap[name].amount += t.amount
    catMap[name].count  += 1
  })
  
  const byCategory: CategoryItem[] = Object.entries(catMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      pct: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
    }))

  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageTopbar
        title="Relatórios"
        subtitle="Análise detalhada dos seus gastos"
        style={{ gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ height: 24, width: 1, background: 'var(--color-border-tertiary)' }} />
          <Suspense fallback={null}>
            <MonthPicker />
          </Suspense>
        </div>
        <ExportCsvButton transactions={transactions} month={month} />
      </PageTopbar>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">
          
          {/* Gráfico de pizza */}
          <div className="page-card">
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 12 }}>Gastos por categoria — {monthLabel}</div>
            <div style={{ height: 200, position: 'relative' }}>
              <CategoryPieChart data={byCategory} />
            </div>
            {/* Custom Legend to match HTML */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, fontSize: 11, color: 'var(--color-text-secondary)' }}>
               {/* Note: Colors are handled inside CategoryPieChart or we could export PALETTE. For now we trust CategoryPieChart colors */}
               {byCategory.map((c, i) => {
                 const PALETTE = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1']
                 return (
                   <span key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                     <span style={{ width: 9, height: 9, borderRadius: 2, background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
                     {c.category} {c.pct}%
                   </span>
                 )
               })}
            </div>
          </div>

          {/* Resumo comparativo / Detalhamento */}
          <div className="page-card">
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 12 }}>Resumo comparativo</div>
            <ReportTable data={byCategory} totalExpenses={expenses} categoryLimits={categoryLimits} />
          </div>
        </div>

        {/* Histórico de transações do mês */}
        {transactions.length > 0 && (
          <div className="page-card !p-0 overflow-hidden">
            <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Transações ({transactions.length})</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {transactions.map(tx => {
                const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 45, flexShrink: 0 }}>{dateStr}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{tx.category?.name ?? '—'}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 16, color: tx.type === 'income' ? 'var(--color-text-success)' : 'var(--color-text-primary)' }}>
                      {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  return (
    <Suspense fallback={
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
        Carregando relatório…
      </div>
    }>
      <ReportContent searchParams={sp} />
    </Suspense>
  )
}
