'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatBRL } from '@/lib/utils'
import { DailyDrilldown } from './DailyDrilldown'
import { ZoomIn } from 'lucide-react'

interface MonthData {
  month:    string
  income:   number
  expenses: number
  monthKey?: string
}

interface SpendingChartProps {
  data: MonthData[]
}

function fmt(value: number) {
  if (value === 0) return 'R$0'
  return `R$${(value / 1000).toFixed(1)}k`
}

const CustomTooltip = ({ active, payload, label }: any) => {
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
      <p className="text-text-secondary mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="mb-0.5 tabular-nums">
          {p.name === 'income' ? 'Receita' : 'Gastos'}:{' '}
          <span className="font-semibold">{formatBRL(Number(p.value))}</span>
        </p>
      ))}
      <p className="text-[11px] text-text-tertiary mt-2 flex items-center gap-1">
        <ZoomIn className="w-3 h-3" /> Clique para ver por dia
      </p>
    </div>
  )
}

export function SpendingChart({ data }: SpendingChartProps) {
  const [drillMonth, setDrillMonth] = useState<string | null>(null)

  const selectedEntry = data.find(d => d.monthKey === drillMonth)
  const monthLabel = selectedEntry
    ? (() => {
        const [y, m] = drillMonth!.split('-')
        return new Date(Number(y), Number(m) - 1, 1)
          .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      })()
    : ''

  const handleChartClick = (chartData: any) => {
    if (!chartData?.activePayload) return
    const idx = chartData.activeTooltipIndex ?? -1
    const entry = data[idx]
    if (entry?.monthKey) setDrillMonth(entry.monthKey)
  }

  return (
    <>
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <h3 className="text-sm font-medium text-text-primary">Evolução mensal</h3>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
            <ZoomIn className="w-3 h-3" />
            Clique em um mês para detalhar
          </span>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            onClick={handleChartClick}
            style={{ cursor: 'pointer' }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'var(--color-chart-tick)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fill: 'var(--color-chart-tick)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--color-border-secondary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)"   activeDot={{ r: 5, strokeWidth: 2, stroke: '#10b981', fill: 'var(--color-background-secondary)' }} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#ef4444', fill: 'var(--color-background-secondary)' }} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 mt-3 pl-1">
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receita
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Gastos
          </span>
        </div>
      </div>

      {drillMonth && (
        <DailyDrilldown
          monthKey={drillMonth}
          monthLabel={monthLabel}
          onClose={() => setDrillMonth(null)}
        />
      )}
    </>
  )
}