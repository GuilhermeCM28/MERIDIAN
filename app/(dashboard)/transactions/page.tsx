import { createClient }         from '@/lib/supabase/server'
import { TransactionList }      from '@/components/transactions/TransactionList'
import { TransactionFilters }   from '@/components/transactions/TransactionFilters'
import { PageTopbar }           from '@/components/ui/PageTopbar'
import { Suspense }             from 'react'
import { lastDayOfMonth, formatBRL } from '@/lib/utils'
import type { Transaction }     from '@/types'
import Link from 'next/link'

interface SearchParams {
  month?:    string
  type?:     string
  category?: string
}

export const metadata = {
  title: 'Transações — Meridian',
  description: 'Histórico completo de receitas e gastos',
}

async function TransactionsContent({ searchParams, categories }: { searchParams: SearchParams, categories: { id: string; name: string }[] }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now   = new Date()
  const month = searchParams.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = month.split('-').map(Number)

  const from = `${year}-${String(mon).padStart(2, '0')}-01`
  const to   = lastDayOfMonth(year, mon)

  let query = supabase
    .from('transactions')
    .select('*, category:categories(id, name, color)')
    .eq('user_id', user.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })

  if (searchParams.type)     query = query.eq('type', searchParams.type)
  if (searchParams.category) query = query.eq('category_id', searchParams.category)

  const { data: transactions } = await query
  const txs = (transactions ?? []) as Transaction[]

  // Calcular totais do mês filtrado
  const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance  = income - expenses

  const monthName = new Date(year, mon - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <>
      <PageTopbar
        title="Transações"
        subtitle={`${txs.length} registros · ${monthName}`}
      >
        <Link
          href="/transactions/new"
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 'var(--border-radius-md)', padding: '7px 14px',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none'
          }}
        >
          <i className="ti ti-plus" aria-hidden="true" />
          Nova transação
        </Link>
      </PageTopbar>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        <TransactionFilters categories={categories ?? []} />

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Total receitas', value: formatBRL(income),   color: 'var(--color-text-success)' },
            { label: 'Total gastos',   value: formatBRL(expenses), color: 'var(--color-text-danger)' },
            { label: 'Saldo',          value: formatBRL(balance),  color: balance >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 5 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Card containing Table */}
        <div className="page-card !p-0 overflow-x-auto">
          <TransactionList transactions={txs} />
        </div>
      </div>
    </>
  )
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: categories } = await supabase.from('categories').select('id, name')

  return (
    <Suspense fallback={
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
        Carregando transações…
      </div>
    }>
      <TransactionsContent searchParams={sp} categories={categories ?? []} />
    </Suspense>
  )
}
