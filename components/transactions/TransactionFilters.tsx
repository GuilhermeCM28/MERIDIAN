'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TransactionFiltersProps {
  categories: { id: string; name: string }[]
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.push(`/transactions?${p.toString()}`)
  }

  const currentType  = params.get('type')  ?? ''
  const currentMonth = params.get('month') ?? ''
  const type = params.get('type') ?? 'all'
  const month = params.get('month') ?? 'all'
  const category = params.get('category') ?? 'all'

  const selectCls = "bg-transparent border border-neutral-700 rounded-lg text-xs text-white px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Filtro de mês */}
      <div className="flex items-center gap-1.5 border border-neutral-700 rounded-lg px-2 py-1 focus-within:border-blue-500">
        <i className="ti ti-calendar text-neutral-500 text-sm" />
        <select
          value={month}
          onChange={(e) => update('month', e.target.value)}
          className="bg-transparent border-none text-white text-xs outline-none cursor-pointer"
        >
          <option value="all">Todo o período</option>
          <option value={new Date().toISOString().slice(0, 7)}>Mês atual</option>
        </select>
      </div>

      {/* Filtro de tipo */}
      <select
        value={type}
        onChange={(e) => update('type', e.target.value)}
        className={selectCls}
      >
        <option value="all">Todas transações</option>
        <option value="income">Receitas</option>
        <option value="expense">Gastos</option>
      </select>

      {/* Filtro de categoria */}
      {categories.length > 0 && (
        <select
          value={category}
          onChange={(e) => update('category', e.target.value)}
          className={selectCls}
        >
          <option value="all">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
    </div>
  )
}
