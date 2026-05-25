import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número como moeda BRL (ex: R$ 1.234,56)
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Formata uma string de data ISO (YYYY-MM-DD) como data pt-BR curta (ex: 21 mai)
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

/**
 * Formata uma string de data ISO (YYYY-MM-DD) como data pt-BR longa (ex: 21 mai. 2025)
 */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Retorna o último dia real de um mês (ex: Fev → 28/29, Abr → 30)
 */
export function lastDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 0) // dia 0 do próximo mês = último dia do mês atual
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

