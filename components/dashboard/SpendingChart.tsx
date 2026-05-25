'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatBRL } from '@/lib/utils'

interface MonthData {
  month:    string
  income:   number
  expenses: number
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
    <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-neutral-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="mb-0.5 tabular-nums">
          {p.name === 'income' ? 'Receita' : 'Gastos'}:{' '}
          <span className="font-semibold">
            {formatBRL(Number(p.value))}
          </span>
        </p>
      ))}
    </div>
  )
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#a3a3a3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <h3 className="text-sm font-medium text-neutral-200">Evolução mensal</h3>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#262626" strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#737373', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: '#737373', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pl-1">
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receita
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Gastos
        </span>
      </div>
    </div>
  )
}