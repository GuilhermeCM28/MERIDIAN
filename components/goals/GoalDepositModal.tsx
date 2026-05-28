'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { PiggyBank, X } from 'lucide-react'
import { formatBRL } from '@/lib/utils'
import type { Goal } from '@/types'

const depositSchema = z.object({
  amount: z.number({ message: 'Valor inválido' }).positive('O valor deve ser maior que zero'),
  note:   z.string().optional(),
  date:   z.string().min(1, 'A data é obrigatória'),
})

type DepositFormData = z.infer<typeof depositSchema>

const inputCls = "bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition w-full"

interface GoalDepositModalProps {
  goal: Goal
  onClose: () => void
}

export function GoalDepositModal({ goal, onClose }: GoalDepositModalProps) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const remaining = Math.max(goal.target_amount - goal.current_amount, 0)

  const { register, handleSubmit, formState: { errors } } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
    }
  })

  async function onSubmit(data: DepositFormData) {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Não autenticado'); setLoading(false); return }

    // Insert contribution record
    const { error: contribError } = await supabase.from('goal_contributions').insert({
      goal_id: goal.id,
      user_id: user.id,
      amount:  data.amount,
      note:    data.note?.trim() || null,
      date:    data.date,
    })

    if (contribError) { toast.error(contribError.message); setLoading(false); return }

    // Update goal current_amount
    const newAmount = Math.min(goal.current_amount + data.amount, goal.target_amount)
    const { error: goalError } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goal.id)

    if (goalError) { toast.error(goalError.message); setLoading(false); return }

    const reached = newAmount >= goal.target_amount
    toast.success(reached ? '🎉 Meta concluída!' : `Aporte de ${formatBRL(data.amount)} registrado!`)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">Depositar</h2>
              <p className="text-[11px] text-neutral-500 leading-tight truncate max-w-[160px]">{goal.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition bg-transparent border-none cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress snapshot */}
        <div className="mb-5 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
          <div className="flex justify-between text-[11px] text-neutral-400 mb-2">
            <span>{formatBRL(goal.current_amount)} acumulado</span>
            <span>Meta: {formatBRL(goal.target_amount)}</span>
          </div>
          <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
            />
          </div>
          {remaining > 0 && (
            <p className="text-[10px] text-neutral-500 mt-1.5 text-right">Faltam {formatBRL(remaining)}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Valor */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Valor do aporte (R$)</span>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              max={remaining || undefined}
              placeholder="0,00"
              className={inputCls}
            />
            {errors.amount && <span className="text-xs text-red-400">{errors.amount.message}</span>}
          </label>

          {/* Nota */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Observação (opcional)</span>
            <input
              {...register('note')}
              placeholder="Ex: Salário de maio…"
              className={inputCls}
            />
          </label>

          {/* Data */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Data</span>
            <input {...register('date')} type="date" className={inputCls} />
            {errors.date && <span className="text-xs text-red-400">{errors.date.message}</span>}
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:bg-neutral-800 transition bg-transparent cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition cursor-pointer border-none"
            >
              {loading ? 'Salvando…' : 'Confirmar aporte'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
