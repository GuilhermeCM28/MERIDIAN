import { createClient }       from '@/lib/supabase/server'
import { getMonthSummary, getChartDataBulk } from '@/lib/supabase/queries'
import { SpendingChart }      from '@/components/dashboard/SpendingChart'
import { TipsPanel }          from '@/components/ai/TipsPanel'
import { PageTopbar }         from '@/components/ui/PageTopbar'
import Link                   from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, Sparkles, ArrowRight } from 'lucide-react'

// ── Helper: variação % entre dois valores ──────────────────────────────────
function pctChange(current: number, previous: number): { value: number; up: boolean; neutral: boolean } {
  if (previous === 0) return { value: 0, up: true, neutral: true }
  const diff = ((current - previous) / Math.abs(previous)) * 100
  return { value: Math.abs(diff), up: diff >= 0, neutral: false }
}

function DeltaBadge({ current, previous, invertPositive = false }: { current: number; previous: number; invertPositive?: boolean }) {
  const delta = pctChange(current, previous)
  if (delta.neutral || delta.value < 0.5) return null

  // For expenses: going up is BAD (invertPositive=true)
  const isGood = invertPositive ? !delta.up : delta.up
  const color  = isGood ? '#10b981' : '#f43f5e'
  const arrow  = delta.up ? '↑' : '↓'

  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      color,
      background: isGood ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
      borderRadius: 6, padding: '2px 6px',
      display: 'inline-flex', alignItems: 'center', gap: 2,
    }}>
      {arrow} {delta.value.toFixed(1)}%
    </span>
  )
}

const CAT_COLORS: Record<string, string> = {
  moradia:    '#3b82f6', // blue
  alimentação:'#f59e0b', // amber
  transporte: '#8b5cf6', // violet
  lazer:      '#ec4899', // pink
  saúde:      '#10b981', // emerald
  outros:     '#71717a', // zinc
}

function catColor(name: string, i: number) {
  return CAT_COLORS[name.toLowerCase()] ?? ['#3b82f6','#f59e0b','#8b5cf6','#ec4899','#10b981','#06b6d4','#f97316','#71717a'][i % 8]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()

  // Mês anterior para comparativo
  const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevYear  = prevDate.getFullYear()
  const prevMonth = prevDate.getMonth() + 1

  const [summary, prevSummary, chart, profileResult, txResult] = await Promise.all([
    getMonthSummary(user.id, now.getFullYear(), now.getMonth() + 1, supabase),
    getMonthSummary(user.id, prevYear, prevMonth, supabase),
    getChartDataBulk(user.id, 5, supabase),
    supabase.from('profiles').select('name, monthly_budget').eq('id', user.id).single(),
    supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5),
  ])

  const profile   = profileResult.data
  const txs       = txResult.data ?? []
  const name      = profile?.name?.split(' ')[0] ?? 'Bem-vindo'
  const budget    = profile?.monthly_budget ?? 0
  const pct       = budget > 0 ? Math.min((summary.total_expenses / budget) * 100, 100) : 0
  const remaining = Math.max(budget - summary.total_expenses, 0)
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageTopbar
        title={<>Olá, {name} 👋</>}
        subtitle={monthName.charAt(0).toUpperCase() + monthName.slice(1)}
      >
        <Link href="/transactions/new" className="btn-primary group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova transação
        </Link>
      </PageTopbar>

      {/* ── Content ── */}
      <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receita */}
          <div className="glass-card p-5 group hover:-translate-y-1">
            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-emerald-subtle flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent-emerald" />
              </div>
              Receita
              <span className="ml-auto">
                <DeltaBadge current={summary.total_income} previous={prevSummary.total_income} />
              </span>
            </div>
            <div className="text-[28px] font-bold tracking-tight text-text-primary group-hover:text-accent-emerald transition-colors">
              {formatBRL(summary.total_income)}
            </div>
            <div className="text-[11px] text-text-tertiary mt-1.5">
              vs. mês anterior: {formatBRL(prevSummary.total_income)}
            </div>
          </div>

          {/* Gastos */}
          <div className="glass-card p-5 group hover:-translate-y-1">
            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-rose-subtle flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-accent-rose" />
              </div>
              Gastos
              <span className="ml-auto">
                <DeltaBadge current={summary.total_expenses} previous={prevSummary.total_expenses} invertPositive />
              </span>
            </div>
            <div className="text-[28px] font-bold tracking-tight text-text-primary group-hover:text-accent-rose transition-colors">
              {formatBRL(summary.total_expenses)}
            </div>
            <div className="text-[11px] text-text-tertiary mt-1.5">
              vs. mês anterior: {formatBRL(prevSummary.total_expenses)}
            </div>
          </div>

          {/* Saldo */}
          <div className="glass-card p-5 group hover:-translate-y-1 relative overflow-hidden">
            {summary.balance >= 0
              ? <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 bg-accent-emerald" />
              : <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 bg-accent-rose" />
            }

            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3 relative z-10">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                summary.balance >= 0
                  ? 'bg-accent-emerald-subtle border-accent-emerald/20'
                  : 'bg-accent-rose-subtle border-accent-rose/20'
              }`}>
                <Wallet className={`w-4 h-4 ${
                  summary.balance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
                }`} />
              </div>
              Saldo
              <span className="ml-auto relative z-10">
                <DeltaBadge current={summary.balance} previous={prevSummary.balance} />
              </span>
              {summary.balance < 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-rose">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-rose opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-rose" />
                  </span>
                  Negativo
                </span>
              )}
            </div>

            {summary.balance >= 0
              ? <div className="text-[28px] font-bold tracking-tight relative z-10 transition-colors text-accent-emerald">
                  {formatBRL(summary.balance)}
                </div>
              : <div className="text-[28px] font-bold tracking-tight relative z-10 transition-colors text-accent-rose">
                  {formatBRL(summary.balance)}
                </div>
            }
            <div className="text-[11px] text-text-tertiary mt-1.5 relative z-10">
              vs. mês anterior: {formatBRL(prevSummary.balance)}
            </div>
          </div>
        </div>

        {/* Budget card */}
        {budget > 0 && (
          <div className="glass-card p-6 border-l-4" style={{ borderLeftColor: pct >= 90 ? 'var(--color-accent-rose)' : pct >= 70 ? '#f59e0b' : 'var(--color-accent-emerald)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-semibold text-text-primary">Meta mensal de gastos</span>
              <span className="text-[13px] font-medium text-text-secondary">
                <span className="text-text-primary">{formatBRL(summary.total_expenses)}</span> / {formatBRL(budget)}
              </span>
            </div>
            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden my-3">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  background: pct >= 90 ? 'var(--color-accent-rose)' : pct >= 70 ? '#f59e0b' : 'var(--color-accent-emerald)', 
                  width: `${pct}%` 
                }} 
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-[12px] font-medium ${pct >= 90 ? 'text-accent-rose' : pct >= 70 ? 'text-amber-500' : 'text-accent-emerald'}`}>
                {pct.toFixed(0)}% utilizado
              </span>
              <span className="text-[12px] font-medium text-text-secondary">{formatBRL(remaining)} restantes</span>
            </div>
          </div>
        )}

        {/* Grid 3fr + 2fr — Chart | Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">

          {/* Chart */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-[15px] font-semibold tracking-tight text-text-primary mb-6">Evolução mensal</h3>
            <div className="flex-1 min-h-[250px]">
              <SpendingChart data={chart} />
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-[15px] font-semibold tracking-tight text-text-primary mb-6">Por categoria</h3>
            <div className="flex-1 flex flex-col gap-4">
              {summary.by_category.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[13px] text-text-tertiary">
                  Nenhum gasto registrado
                </div>
              ) : summary.by_category.map((c, i) => {
                const color = c.color || catColor(c.category, i)
                return (
                  <div key={c.category} className="flex flex-col gap-1.5 group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-150" style={{ background: color }} />
                      <span className="text-[13px] font-medium text-text-secondary min-w-[80px]">{c.category}</span>
                      <div className="flex-1 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ background: c.monthly_limit && c.amount > c.monthly_limit ? 'var(--color-accent-rose)' : color, width: c.monthly_limit ? `${Math.min((c.amount / c.monthly_limit) * 100, 100)}%` : `${c.pct}%` }} />
                      </div>
                      <span className="text-[13px] font-semibold text-text-primary min-w-[70px] text-right">
                        {formatBRL(c.amount)}
                      </span>
                    </div>
                    {c.monthly_limit && c.monthly_limit > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-text-tertiary pl-14">
                        <span>Limite: {formatBRL(c.monthly_limit)}</span>
                        <span className={c.amount >= c.monthly_limit ? 'text-accent-rose font-medium' : c.amount >= c.monthly_limit * 0.8 ? 'text-amber-500 font-medium' : ''}>
                          {Math.round((c.amount / c.monthly_limit) * 100)}% usado
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Grid 1fr + 1fr — Recent Transactions | AI Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Transactions */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-semibold tracking-tight text-text-primary">Transações recentes</h3>
              <Link href="/transactions" className="text-[13px] font-medium text-accent-blue hover:text-accent-blue-hover flex items-center gap-1 group transition-colors">
                Ver todas 
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="flex flex-col">
              {txs.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-text-tertiary">Nenhuma transação recente</div>
              ) : txs.map((tx, i) => (
                <div key={tx.id} className={`flex items-center gap-4 py-3 group ${i !== txs.length - 1 ? 'border-b border-border-primary/50' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${tx.type === 'income' ? 'bg-accent-emerald-subtle text-accent-emerald group-hover:bg-accent-emerald/20' : 'bg-background-tertiary border border-border-primary text-text-secondary group-hover:border-text-secondary'}`}>
                    {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-text-primary truncate">{tx.description}</div>
                    <div className="text-[12px] font-medium text-text-tertiary mt-0.5 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-background-tertiary rounded-md text-[10px] uppercase tracking-wider">{tx.category?.name ?? 'Outros'}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <div className={`text-[14px] font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-accent-emerald' : 'text-text-primary'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tips */}
          <div className="glass-card p-6 flex flex-col relative overflow-hidden">
            {/* Subtle AI background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-3xl rounded-full" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-semibold tracking-tight text-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                Dicas da IA
              </h3>
              <span className="badge badge-ai">Claude</span>
            </div>
            <div className="relative z-10 flex-1">
              <TipsPanel summary={summary} />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
