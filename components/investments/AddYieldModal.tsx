'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Investment } from '@/types'

const yieldSchema = z.object({
  added_yield: z.number({ message: 'Valor inválido' }).min(0.01, 'O valor não pode ser zero ou negativo'),
})

type YieldFormData = z.infer<typeof yieldSchema>

const inputCls = "bg-background-tertiary border border-border-primary rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition w-full"

interface AddYieldModalProps {
  investment: Investment
  onClose: () => void
}

export function AddYieldModal({ investment, onClose }: AddYieldModalProps) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<YieldFormData>({
    resolver: zodResolver(yieldSchema),
    defaultValues: {
      added_yield: undefined,
    }
  })

  async function onSubmit(data: YieldFormData) {
    setLoading(true)

    const newYieldAmount = investment.yield_amount + data.added_yield

    const { error: err } = await supabase
      .from('investments')
      .update({ yield_amount: newYieldAmount })
      .eq('id', investment.id)

    if (err) { toast.error(err.message); setLoading(false); return }

    toast.success('Rendimento atualizado!')
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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-background-secondary backdrop-blur-2xl border border-border-primary rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Adicionar Rendimento</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        
        <p className="text-sm text-text-secondary mb-6">
          Você está adicionando rendimentos para <strong className="text-text-primary">{investment.name}</strong>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Valor Ganho (R$)</span>
            <input {...register('added_yield', { valueAsNumber: true })} type="number" step="0.01" min="0.01" placeholder="Ex: 50,00" className={inputCls} />
            {errors.added_yield && <span className="text-xs text-accent-rose">{errors.added_yield.message}</span>}
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border-primary hover:bg-background-tertiary transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition">
              {loading ? 'Salvando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
