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
}

interface Props {
  /** "YYYY-MM" ou null para fechar */
  monthKey: string | null
  /** Label legível do mês, ex: "maio 2026" */
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
    <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-neutral-400 mb-2 font-medium">Dia {label}</p>
      {payload.map((p: any) => (
        p.value > 0 && (
          <p key={p.dataKey} style={{ color: p.fill }} className="mb-0.5 tabular-nums">
            {p.dataKey === 'income' ? 'Receita' : 'Gastos'}:{' '}
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
    setTimeout(onClose, 250) // aguarda animação de saída
  }, [onClose])

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose])

  // Carrega dados e anima entrada
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

  // Resumos rápidos
  const totalIncome   = data.reduce((s, d) => s + d.income, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const peakDay       = data.reduce((best, d) => d.expenses > best.expenses ? d : best, { day: 0, expenses: 0 })

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        transition: 'opacity 250ms ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-neutral-800/70 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #111111 0%, #0d0d0d 100%)',
          transition: 'transform 250ms cubic-bezier(.4,0,.2,1), opacity 250ms ease',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-neutral-100 capitalize">{monthLabel}</h2>
              <p className="text-[12px] text-neutral-500 mt-0.5">Detalhamento diário</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-700/80 flex items-center justify-center transition-colors group"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 transition-colors" />
          </button>
        </div>

        {/* Quick stats */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-3 px-6 pt-4">
            <div className="bg-neutral-800/40 border border-neutral-800/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-neutral-500 font-medium">Receita</span>
              </div>
              <p className="text-[15px] font-bold text-emerald-400 tabular-nums">{formatBRL(totalIncome)}</p>
            </div>
            <div className="bg-neutral-800/40 border border-neutral-800/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] text-neutral-500 font-medium">Gastos</span>
              </div>
              <p className="text-[15px] font-bold text-red-400 tabular-nums">{formatBRL(totalExpenses)}</p>
            </div>
            <div className="bg-neutral-800/40 border border-neutral-800/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[11px] text-neutral-500 font-medium">📅 Pico de gasto</span>
              </div>
              <p className="text-[15px] font-bold text-neutral-200 tabular-nums">
                {peakDay.expenses > 0 ? `Dia ${peakDay.day}` : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Chart area */}
        <div className="px-6 pt-5 pb-6">
          {loading ? (
            /* Skeleton */
            <div className="h-52 flex items-end gap-1 animate-pulse">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-neutral-800/60"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-[13px] text-neutral-500">
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
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
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
                              ? '#f87171'   // destaque no dia pico
                              : '#ef4444'
                            : 'transparent'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-2 pl-1">
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receita
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Gastos
                </span>
                {peakDay.expenses > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
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
