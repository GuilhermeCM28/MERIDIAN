'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Transaction } from '@/types'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.number({ message: 'Valor inválido' }).min(0.01, 'O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data é obrigatória'),
  category_id: z.string().nullable().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface Category {
  id: string
  name: string
}

interface TransactionEditModalProps {
  transaction: Transaction
  onClose: () => void
  onSaved: () => void
}

const inputCls = "bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition w-full"

export function TransactionEditModal({ transaction, onClose, onSaved }: TransactionEditModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category_id: transaction.category_id,
    }
  })

  const currentType = watch('type')

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [supabase])

  async function onSubmit(data: TransactionFormData) {
    setLoading(true)

    const { error: err } = await supabase
      .from('transactions')
      .update({
        description: data.description,
        amount:      data.amount,
        type:        data.type,
        date:        data.date,
        category_id: data.category_id || null,
      })
      .eq('id', transaction.id)

    if (err) {
      toast.error(err.message)
      setLoading(false)
      return
    }

    toast.success('Transação atualizada!')
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-white">Editar transação</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition border ${
                    currentType === t
                      ? t === 'income'
                        ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                        : 'bg-red-950/50 border-red-800 text-red-400'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {t === 'income' ? '↑ Receita' : '↓ Gasto'}
                </button>
              ))}
            </div>
            {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">Descrição</label>
            <input
              {...register('description')}
              className={inputCls}
            />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
          </div>

          {/* Valor */}
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', { valueAsNumber: true })}
              className={inputCls}
            />
            {errors.amount && <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Data */}
          <div>
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">Data</label>
            <input
              type="date"
              {...register('date')}
              className={inputCls}
            />
            {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>}
          </div>

          {/* Categoria */}
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">Categoria</label>
              <select
                {...register('category_id')}
                className={inputCls}
              >
                <option value="">Sem categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-sm font-medium py-2.5 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-xl transition"
            >
              {loading ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
