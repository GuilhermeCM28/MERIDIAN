import { createClient }         from '@/lib/supabase/server'
import { TransactionList }      from '@/components/transactions/TransactionList'
import { TransactionFilters }   from '@/components/transactions/TransactionFilters'
import { PageTopbar }           from '@/components/ui/PageTopbar'
import { Suspense }             from 'react'
import { lastDayOfMonth, formatBRL } from '@/lib/utils'
import type { Transaction }     from '@/types'
import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

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
        <Link href="/transactions/new" className="btn-primary group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova transação
        </Link>
      </PageTopbar>

      {/* ── Content ── */}
      <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        <TransactionFilters categories={categories ?? []} />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Receita */}
          <div className="glass-card p-5 group hover:-translate-y-1">
            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-emerald-subtle flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent-emerald" />
              </div>
              Receitas
            </div>
            <div className="text-[28px] font-bold tracking-tight text-text-primary group-hover:text-accent-emerald transition-colors">
              {formatBRL(income)}
            </div>
          </div>

          {/* Gastos */}
          <div className="glass-card p-5 group hover:-translate-y-1">
            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-rose-subtle flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-accent-rose" />
              </div>
              Gastos
            </div>
            <div className="text-[28px] font-bold tracking-tight text-text-primary group-hover:text-accent-rose transition-colors">
              {formatBRL(expenses)}
            </div>
          </div>

          {/* Saldo */}
          <div className="glass-card p-5 group hover:-translate-y-1 relative overflow-hidden">
            {balance >= 0
              ? <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 bg-accent-emerald" />
              : <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 bg-accent-rose" />
            }

            <div className="flex items-center gap-2.5 text-text-secondary font-medium text-[13px] mb-3 relative z-10">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                balance >= 0
                  ? 'bg-accent-emerald-subtle border-accent-emerald/20'
                  : 'bg-accent-rose-subtle border-accent-rose/20'
              }`}>
                <Wallet className={`w-4 h-4 ${
                  balance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
                }`} />
              </div>
              Saldo
            </div>

            <div className={`text-[28px] font-bold tracking-tight relative z-10 transition-colors ${
              balance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
            }`}>
              {formatBRL(balance)}
            </div>
          </div>
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
