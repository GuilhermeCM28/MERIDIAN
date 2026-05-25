import { createClient }       from '@/lib/supabase/server'
import { getMonthSummary, getChartDataBulk } from '@/lib/supabase/queries'
import { SpendingChart }      from '@/components/dashboard/SpendingChart'
import { TipsPanel }          from '@/components/ai/TipsPanel'
import { PageTopbar }         from '@/components/ui/PageTopbar'
import Link                   from 'next/link'
import { formatBRL, formatDate } from '@/lib/utils'

const CAT_COLORS: Record<string, string> = {
  moradia:    '#2563eb',
  alimentação:'#f59e0b',
  transporte: '#8b5cf6',
  lazer:      '#ec4899',
  saúde:      '#10b981',
  outros:     '#73726c',
}
function catColor(name: string, i: number) {
  return CAT_COLORS[name.toLowerCase()] ?? ['#2563eb','#f59e0b','#8b5cf6','#ec4899','#10b981','#06b6d4','#f97316','#73726c'][i % 8]
}




export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()

  const [summary, chart, profileResult, txResult] = await Promise.all([
    getMonthSummary(user.id, now.getFullYear(), now.getMonth() + 1, supabase),
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
        subtitle={monthName}
      >
        <Link
          href="/transactions/new"
          style={{
            background:'#2563eb', color:'#fff', border:'none',
            borderRadius:'var(--border-radius-md)', padding:'7px 14px',
            fontSize:12, fontWeight:500, cursor:'pointer',
            display:'flex', alignItems:'center', gap:5, textDecoration:'none',
          }}
        >
          <i className="ti ti-plus" aria-hidden="true" />
          Novo gasto
        </Link>
      </PageTopbar>

      {/* ── Content ── */}
      <div style={{ flex:1, padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label:'Receita',  value: formatBRL(summary.total_income),   icon:'ti-trending-up',   color:'var(--color-text-success)' },
            { label:'Gastos',   value: formatBRL(summary.total_expenses),  icon:'ti-trending-down', color:'var(--color-text-danger)'  },
            { label:'Saldo',    value: formatBRL(summary.balance),          icon:'ti-wallet',        color: summary.balance >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)' },
          ].map(m => (
            <div key={m.label} style={{ background:'var(--color-background-secondary)', borderRadius:'var(--border-radius-md)', padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'var(--color-text-secondary)', marginBottom:5, display:'flex', alignItems:'center', gap:5 }}>
                <i className={`ti ${m.icon}`} style={{ color: m.color }} aria-hidden="true" />
                {m.label}
              </div>
              <div style={{ fontSize:20, fontWeight:500, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Budget card */}
        {budget > 0 && (
          <div className="page-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:12, fontWeight:500, color:'var(--color-text-primary)' }}>Meta mensal de gastos</span>
              <span style={{ fontSize:11, color:'var(--color-text-secondary)' }}>
                {formatBRL(summary.total_expenses)} / {formatBRL(budget)}
              </span>
            </div>
            <div style={{ height:7, background:'var(--color-background-secondary)', borderRadius:4, overflow:'hidden', margin:'8px 0 5px' }}>
              <div style={{ height:7, borderRadius:4, background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981', width:`${pct.toFixed(1)}%` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color: pct >= 90 ? 'var(--color-text-danger)' : pct >= 70 ? '#f59e0b' : 'var(--color-text-success)' }}>
                {pct.toFixed(0)}% utilizado
              </span>
              <span style={{ fontSize:11, color:'var(--color-text-secondary)' }}>{formatBRL(remaining)} restantes</span>
            </div>
          </div>
        )}

        {/* Grid 3fr + 2fr — Chart | Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">

          {/* Chart */}
          <div className="page-card">
            <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', marginBottom:12 }}>Evolução mensal</div>
            <SpendingChart data={chart} />
          </div>

          {/* Categories */}
          <div className="page-card flex flex-col">
            <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', marginBottom:12 }}>Por categoria</div>
            <div>
              {summary.by_category.length === 0 ? (
                <p style={{ fontSize:12, color:'var(--color-text-tertiary)', textAlign:'center', padding:'16px 0' }}>
                  Nenhum gasto registrado
                </p>
              ) : summary.by_category.map((c, i) => {
                const color = catColor(c.category, i)
                return (
                  <div key={c.category} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                    <span style={{ fontSize:11, color:'var(--color-text-secondary)', minWidth:72 }}>{c.category}</span>
                    <div style={{ flex:1, height:4, background:'var(--color-background-secondary)', borderRadius:2 }}>
                      <div style={{ height:4, borderRadius:2, background:color, width:`${c.pct}%` }} />
                    </div>
                    <span style={{ fontSize:11, color:'var(--color-text-primary)', minWidth:62, textAlign:'right' }}>
                      {formatBRL(c.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Grid 1fr + 1fr — Recent Transactions | AI Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Recent Transactions */}
          <div className="page-card">
            <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              Transações recentes
              <Link href="/transactions" style={{ fontSize:11, fontWeight:400, color:'var(--color-text-info)', textDecoration:'none' }}>Ver todas →</Link>
            </div>
            {txs.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--color-text-tertiary)', textAlign:'center', padding:'16px 0' }}>Nenhuma transação</p>
            ) : txs.map(tx => (
              <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 0', borderBottom:'0.5px solid var(--color-border-tertiary)' }}>
                <div style={{ width:30, height:30, borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14, color:'var(--color-text-secondary)' }}>
                  <i className={`ti ${tx.type === 'income' ? 'ti-trending-up' : 'ti-credit-card'}`} aria-hidden="true" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'var(--color-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.description}</div>
                  <div style={{ fontSize:11, color:'var(--color-text-tertiary)', marginTop:1 }}>
                    {tx.category?.name ?? '—'} · {formatDate(tx.date)}
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:500, marginLeft:'auto', whiteSpace:'nowrap', color: tx.type === 'income' ? 'var(--color-text-success)' : 'var(--color-text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* AI Tips */}
          <div className="page-card">
            <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text-primary)', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <i className="ti ti-sparkles" style={{ color:'var(--color-text-info)' }} aria-hidden="true" />
                Dicas da IA
              </span>
              <span style={{ fontSize:10, padding:'2px 7px', borderRadius:'var(--border-radius-md)', fontWeight:500, background:'var(--color-background-info)', color:'var(--color-text-info)' }}>
                Claude
              </span>
            </div>
            <TipsPanel summary={summary} />
          </div>

        </div>
      </div>
    </>
  )
}
