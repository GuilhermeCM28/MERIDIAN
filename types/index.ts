import type { Database } from './database.types'

// ─── Base Supabase Types ─────────────────────────────────────────────────────

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type TransactionRow = Database['public']['Tables']['transactions']['Row']
export type GoalRow = Database['public']['Tables']['goals']['Row']
export type InvestmentRow = Database['public']['Tables']['investments']['Row']

// ─── Categoria ───────────────────────────────────────────────────────────────

export interface Category extends CategoryRow {}

// ─── Transação ───────────────────────────────────────────────────────────────

export interface Transaction extends TransactionRow {
  category?: Category | null
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface CategoryItem {
  category: string
  amount: number
  pct: number
  count?: number
  monthly_limit?: number | null
  color?: string | null
}

export interface MonthSummary {
  total_income: number
  total_expenses: number
  balance: number
  by_category: CategoryItem[]
}

// ─── Metas ───────────────────────────────────────────────────────────────────

export interface Goal extends GoalRow {}

// ─── Investimentos ─────────────────────────────────────────────────────────────

export interface Investment extends InvestmentRow {}

// ─── Relatórios ──────────────────────────────────────────────────────────────

export interface MonthlyReport {
  month: string        // "2025-05"
  label: string        // "Mai 2025"
  total_income: number
  total_expenses: number
  balance: number
  by_category: CategoryItem[]
  transactions: Transaction[]
}
