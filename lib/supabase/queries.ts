import { cache } from 'react'
import { createClient } from './server'
import { lastDayOfMonth } from '@/lib/utils'
import type { MonthSummary } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

type CategoryJoin = { name: string, monthly_limit?: number, color?: string | null } | { name: string, monthly_limit?: number, color?: string | null }[] | null

/**
 * Calcula o resumo financeiro de um mês para um usuário.
 *
 * @param supabase - Client Supabase já instanciado (evita criar múltiplas conexões).
 *                  Se omitido, cria um novo client automaticamente.
 */
export const getMonthSummary = cache(async (
  userId: string,
  year: number,
  month: number,
  supabase?: SupabaseClient
): Promise<MonthSummary> => {
  const client = supabase ?? (await createClient())

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to   = lastDayOfMonth(year, month)

  const { data } = await client
    .from('transactions')
    .select('amount, type, category:categories(name, monthly_limit, color)')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)

  const income   = data?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) ?? 0
  const expenses = data?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0
  const investments = data?.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0) ?? 0

  const byCat: Record<string, { amount: number, monthly_limit: number | null, color: string | null }> = {}
  data?.filter(t => t.type === 'expense' || t.type === 'investment').forEach(t => {
    const cat = t.category as CategoryJoin
    const name = (Array.isArray(cat) ? cat[0]?.name : cat?.name) ?? 'Outros'
    const limit = (Array.isArray(cat) ? cat[0]?.monthly_limit : cat?.monthly_limit) ?? null
    const color = (Array.isArray(cat) ? cat[0]?.color : cat?.color) ?? null
    
    if (!byCat[name]) {
      byCat[name] = { amount: 0, monthly_limit: limit, color }
    }
    byCat[name].amount += t.amount
  })

  // Total for percentage calculations should include both expenses and investments
  const totalOut = expenses + investments

  return {
    total_income: income,
    total_expenses: expenses,
    total_investments: investments,
    balance: income - totalOut,
    by_category: Object.entries(byCat).map(([category, val]) => ({
      category,
      amount: val.amount,
      pct: totalOut > 0 ? Math.round((val.amount / totalOut) * 100) : 0,
      monthly_limit: val.monthly_limit,
      color: val.color,
    })),
  }
})

// ─────────────────────────────────────────────────────────────────────────────

export interface ChartMonthData {
  month:    string  // ex: "mai."
  monthKey: string  // ex: "2026-05" — usado para drill-down diário
  income:   number
  expenses: number
  investments: number
}

/**
 * Retorna os dados dos últimos N meses para o gráfico de barras em UMA única query.
 *
 * Antes: N queries paralelas (uma por mês).
 * Agora: 1 query filtrando por range de datas, agrupamento feito em JS.
 *
 * @param userId     - ID do usuário autenticado
 * @param months     - Número de meses a retornar (default: 5)
 * @param supabase   - Client Supabase compartilhado (opcional)
 */
export const getChartDataBulk = cache(async (
  userId: string,
  months = 5,
  supabase?: SupabaseClient
): Promise<ChartMonthData[]> => {
  const client = supabase ?? (await createClient())

  const now       = new Date()
  // Primeiro dia do mês mais antigo que queremos
  const rangeFrom = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const from      = `${rangeFrom.getFullYear()}-${String(rangeFrom.getMonth() + 1).padStart(2, '0')}-01`
  const to        = lastDayOfMonth(now.getFullYear(), now.getMonth() + 1)

  const { data } = await client
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)

  // Agrupa por "YYYY-MM" em JS
  const byMonth: Record<string, { income: number; expenses: number; investments: number }> = {}

  data?.forEach(t => {
    const key = t.date.slice(0, 7)  // "YYYY-MM"
    if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0, investments: 0 }
    if (t.type === 'income')  byMonth[key].income   += t.amount
    if (t.type === 'expense') byMonth[key].expenses += t.amount
    if (t.type === 'investment') byMonth[key].investments += t.amount
  })

  // Garante que todos os N meses estejam presentes, mesmo os sem transações
  return Array.from({ length: months }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month:    d.toLocaleDateString('pt-BR', { month: 'short' }),
      monthKey: key,
      income:   byMonth[key]?.income   ?? 0,
      expenses: byMonth[key]?.expenses ?? 0,
      investments: byMonth[key]?.investments ?? 0,
    }
  })
})