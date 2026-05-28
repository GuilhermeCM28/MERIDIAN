'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatBRL, formatDate } from '@/lib/utils'
import { Calendar, CreditCard, TrendingUp, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Category {
  name: string
  color: string | null
}

interface RecurringTx {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: Category | Category[] | null
  recurrence_interval: string | null
  next_due_date: string | null
}

const INTERVAL_LABELS: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

export function RecurringList({ initialData }: { initialData: RecurringTx[] }) {
  const [data, setData] = useState(initialData)
  const supabase = createClient()
  const router = useRouter()

  async function cancelRecurrence(id: string) {
    if (!confirm('Deseja cancelar esta recorrência? O histórico de transações não será apagado, mas ela não será mais duplicada.')) return

    const { error } = await supabase
      .from('transactions')
      .update({ is_recurring: false, next_due_date: null })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao cancelar: ' + error.message)
    } else {
      toast.success('Recorrência cancelada')
      setData(prev => prev.filter(t => t.id !== id))
      router.refresh()
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-text-tertiary" />
        </div>
        <h3 className="text-sm font-medium text-text-primary mb-1">Nenhuma assinatura ativa</h3>
        <p className="text-xs text-text-tertiary">Suas despesas e receitas recorrentes aparecerão aqui.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4">
        {data.map((tx) => {
          const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category
          return (
            <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-background-tertiary/50 border border-border-primary rounded-xl hover:border-border-secondary transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'income' 
                    ? 'bg-emerald-900/30 text-emerald-500' 
                    : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                }`}>
                  {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{tx.description}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                    {cat && (
                      <>
                        <span 
                          className="px-1.5 py-0.5 rounded border"
                          style={cat.color ? { 
                            backgroundColor: `${cat.color}20`, 
                            color: cat.color,
                            borderColor: `${cat.color}40`
                          } : {
                            backgroundColor: 'var(--color-background-primary)',
                            borderColor: 'var(--color-border-primary)'
                          }}
                        >
                          {cat.name}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {tx.recurrence_interval ? INTERVAL_LABELS[tx.recurrence_interval] ?? tx.recurrence_interval : 'Fixo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                <div className="flex flex-col items-start sm:items-end">
                  <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                  </div>
                  <div className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    Próximo: {tx.next_due_date ? formatDate(tx.next_due_date) : '-'}
                  </div>
                </div>

                <button
                  onClick={() => cancelRecurrence(tx.id)}
                  title="Cancelar recorrência"
                  className="text-neutral-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/30 transition opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
