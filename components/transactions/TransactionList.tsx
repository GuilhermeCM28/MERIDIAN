'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatBRL } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Inbox, RefreshCw } from 'lucide-react'
import { TransactionEditModal } from './TransactionEditModal'
import type { Transaction } from '@/types'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir transação')
    } else {
      toast.success('Transação excluída')
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
    router.refresh()
  }, [supabase, router])

  useEffect(() => {
    const channel = supabase.channel('public:transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          // Quando qualquer alteração ocorrer no banco, refazemos o fetch do Server Component automaticamente
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
          <Inbox className="w-6 h-6 text-neutral-500" />
        </div>
        <p className="text-neutral-400 text-sm">Nenhuma transação encontrada.</p>
        <p className="text-neutral-500 text-xs mt-1">Tente ajustar os filtros ou crie um novo registro.</p>
      </div>
    )
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Tipo</th>
            <th className="text-right">Valor</th>
            <th className="text-right w-16">Ações</th>
          </tr>
        </thead>
        <motion.tbody
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {transactions.map((tx) => {
            const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            return (
              <motion.tr variants={itemVariants} key={tx.id}>
                <td>{tx.description}</td>
                <td>
                  <span 
                    className="text-[11px] px-2 py-0.5 rounded-md"
                    style={tx.category?.color ? { 
                      backgroundColor: `${tx.category.color}25`, 
                      color: tx.category.color,
                      border: `1px solid ${tx.category.color}40`
                    } : {
                      backgroundColor: 'var(--color-background-tertiary)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {tx.category?.name ?? '—'}
                  </span>
                </td>
                <td className="text-neutral-400">{dateStr}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.type === 'income' ? 'Receita' : 'Gasto'}
                    </span>
                    {(tx as any).is_recurring && (
                      <span title="Recorrente" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 10, color: '#60a5fa',
                        background: 'rgba(96,165,250,0.1)', borderRadius: 4,
                        padding: '1px 5px', fontWeight: 500
                      }}>
                        <RefreshCw style={{ width: 9, height: 9 }} />
                        Recorrente
                      </span>
                    )}
                  </div>
                </td>
                <td className={`text-right font-medium ${tx.type === 'income' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatBRL(tx.amount)}
                </td>
                <td className="text-right">
                  {confirmDeleteId === tx.id ? (
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      className="text-[10px] bg-red-600 text-white border-none rounded px-1.5 py-0.5 cursor-pointer hover:bg-red-500 disabled:opacity-50"
                    >
                      {deletingId === tx.id ? '…' : 'Conf'}
                    </button>
                  ) : (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditingTx(tx)} className="bg-transparent border-none text-neutral-500 cursor-pointer hover:text-white transition">
                        <i className="ti ti-edit" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(tx.id)} className="bg-transparent border-none text-red-500/80 cursor-pointer hover:text-red-500 transition">
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            )
          })}
        </motion.tbody>
      </table>

      {/* Modal de edição */}
      {editingTx && (
        <TransactionEditModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSaved={() => {
            setEditingTx(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
