'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { X, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { formatBRL } from '@/lib/utils'

interface DayData {
  day: number
  income: number
  expenses: number
  investments: number
}

interface Props {
  monthKey: string | null
  monthLabel: string
  onClose: () => void
}

function fmt(value: number) {
  if (value === 0) return 'R$0'
  return `R$${(value / 1000).toFixed(1)}k`
}

const DailyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="backdrop-blur-xl rounded-xl px-4 py-3 text-sm shadow-2xl border"
      style={{
        background: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      <p className="text-text-secondary mb-2 font-medium">Dia {label}</p>
      {payload.map((p: any) => (
        p.value > 0 && (
          <p key={p.dataKey} style={{ color: p.fill }} className="mb-0.5 tabular-nums">
            {p.dataKey === 'income' ? 'Receita' : p.dataKey === 'expenses' ? 'Gastos' : 'Investimento'}:{' '}
            <span className="font-semibold">{formatBRL(Number(p.value))}</span>
          </p>
        )
      ))}
    </div>
  )
}

export function DailyDrilldown({ monthKey, monthLabel, onClose }: Props) {
  const [data, setData]       = useState<DayData[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 250)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose])

  useEffect(() => {
    if (!monthKey) return
    setData([])
    setLoading(true)
    setVisible(false)

    const [year, month] = monthKey.split('-')

    fetch(`/api/daily-chart?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((d: DayData[]) => {
        setData(d)
        setLoading(false)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setLoading(false))
  }, [monthKey])

  if (!monthKey) return null

  const totalIncome   = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const peakDay       = data.reduce((best, d) => d.expenses > best.expenses ? d : best, { day: 0, expenses: 0 })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        transition: 'opacity 250ms ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          background: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border-primary)',
          transition: 'transform 250ms cubic-bezier(.4,0,.2,1), opacity 250ms ease',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4 border-b"
          style={{ borderColor: 'var(--color-border-primary)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald-subtle flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent-emerald" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-text-primary capitalize">{monthLabel}</h2>
              <p className="text-[12px] text-text-tertiary mt-0.5">Detalhamento diário</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors group border"
            style={{
              background: 'var(--color-background-tertiary)',
              borderColor: 'var(--color-border-primary)',
            }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
          </button>
        </div>

        {/* Quick stats */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-3 px-6 pt-4">
            {/* Receita */}
            <div
              className="rounded-xl p-3 border"
              style={{ background: 'var(--color-background-tertiary)', borderColor: 'var(--color-border-primary)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />
                <span className="text-[11px] text-text-tertiary font-medium">Receita</span>
              </div>
              <p className="text-[15px] font-bold text-accent-emerald tabular-nums">{formatBRL(totalIncome)}</p>
            </div>
            {/* Gastos */}
            <div
              className="rounded-xl p-3 border"
              style={{ background: 'var(--color-background-tertiary)', borderColor: 'var(--color-border-primary)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-accent-rose" />
                <span className="text-[11px] text-text-tertiary font-medium">Gastos</span>
              </div>
              <p className="text-[15px] font-bold text-accent-rose tabular-nums">{formatBRL(totalExpenses)}</p>
            </div>
            {/* Pico */}
            <div
              className="rounded-xl p-3 border"
              style={{ background: 'var(--color-background-tertiary)', borderColor: 'var(--color-border-primary)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] text-text-tertiary font-medium">📅 Pico de gasto</span>
              </div>
              <p className="text-[15px] font-bold text-text-primary tabular-nums">
                {peakDay.expenses > 0 ? `Dia ${peakDay.day}` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Chart area */}
        <div className="px-6 pt-5 pb-6">
          {loading ? (
            <div className="h-52 flex items-end gap-1 animate-pulse">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                    background: 'var(--color-background-tertiary)',
                  }}
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-[13px] text-text-tertiary">
              Nenhuma transação encontrada neste mês.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--color-chart-tick)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    interval={data.length > 20 ? 4 : 2}
                  />
                  <YAxis
                    tickFormatter={fmt}
                    tick={{ fill: 'var(--color-chart-tick)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip
                    content={<DailyTooltip />}
                    cursor={{ fill: 'var(--color-border-primary)', opacity: 0.4 }}
                  />
                  <Bar dataKey="income" radius={[3, 3, 0, 0]} maxBarSize={14}>
                    {data.map((entry) => (
                      <Cell
                        key={`income-${entry.day}`}
                        fill={entry.income > 0 ? '#10b981' : 'transparent'}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="expenses" radius={[3, 3, 0, 0]} maxBarSize={14}>
                    {data.map((entry) => (
                      <Cell
                        key={`expenses-${entry.day}`}
                        fill={
                          entry.expenses > 0
                            ? entry.day === peakDay.day
                              ? '#f87171'
                              : '#ef4444'
                            : 'transparent'
                        }
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="investments" radius={[3, 3, 0, 0]} maxBarSize={14}>
                    {data.map((entry) => (
                      <Cell
                        key={`investments-${entry.day}`}
                        fill={entry.investments > 0 ? '#8b5cf6' : 'transparent'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-2 pl-1">
                <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receita
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Gastos
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />Investimentos
                </span>
                {peakDay.expenses > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />Dia de maior gasto
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
