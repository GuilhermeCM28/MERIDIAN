'use client'

import type { Transaction } from '@/types'

interface ExportCsvButtonProps {
  transactions: Transaction[]
  month: string
}

export function ExportCsvButton({ transactions, month }: ExportCsvButtonProps) {
  function handleExport() {
    if (transactions.length === 0) {
      alert('Não há transações neste mês para exportar.')
      return
    }

    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'Receita' : 'Gasto',
      t.category?.name ?? 'Sem categoria',
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `meridian_transacoes_${month}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} className="btn-primary">
      <i className="ti ti-download" aria-hidden="true" />
      Exportar CSV
    </button>
  )
}
