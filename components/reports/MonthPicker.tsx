'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function MonthPicker() {
  const router = useRouter()
  const params = useSearchParams()

  const now = new Date()
  const currentYear = now.getFullYear()
  
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const value = `${currentYear}-${String(month).padStart(2, '0')}`
    const label = new Date(currentYear, i).toLocaleString('default', { month: 'long', year: 'numeric' })
    return { value, label }
  })

  const selectedMonth = params.get('month') || `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 focus-within:border-blue-500 transition-colors">
      <i className="ti ti-calendar text-neutral-500 text-sm" />
      <select
        value={selectedMonth}
        onChange={e => {
          const m = e.target.value
          const newParams = new URLSearchParams(params.toString())
          newParams.set('month', m)
          router.push(`?${newParams.toString()}`)
        }}
        className="bg-transparent border-none text-white text-xs outline-none cursor-pointer"
      >
        {months.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  )
}
