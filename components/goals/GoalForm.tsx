'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const goalSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  target_amount: z.number({ message: 'Valor inválido' }).min(1, 'O valor alvo deve ser no mínimo R$ 1,00'),
  current_amount: z.number({ message: 'Valor inválido' }).min(0, 'O valor não pode ser negativo'),
  deadline: z.string().optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

const COLORS = [
  { key: 'blue',    label: 'Azul',     cls: 'bg-blue-500'   },
  { key: 'emerald', label: 'Verde',    cls: 'bg-emerald-500' },
  { key: 'violet',  label: 'Violeta',  cls: 'bg-violet-500' },
  { key: 'amber',   label: 'Âmbar',   cls: 'bg-amber-500'  },
  { key: 'rose',    label: 'Rosa',     cls: 'bg-rose-500'   },
]

const inputCls = "bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition w-full"

interface GoalFormProps {
  onClose: () => void
}

export function GoalForm({ onClose }: GoalFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [color,   setColor]   = useState('blue')

  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      current_amount: 0,
    }
  })

  async function onSubmit(data: GoalFormData) {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Não autenticado'); setLoading(false); return }

    const { error: err } = await supabase.from('goals').insert({
      user_id:        user.id,
      title:          data.title,
      target_amount:  data.target_amount,
      current_amount: data.current_amount,
      deadline:       data.deadline || null,
      color,
    })

    if (err) { toast.error(err.message); setLoading(false); return }

    toast.success('Meta financeira criada!')
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
        className="relative bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">Nova meta</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Título</span>
            <input {...register('title')} placeholder="Ex: Reserva de emergência" className={inputCls} />
            {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
          </label>

          {/* Valor alvo */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Valor alvo (R$)</span>
            <input {...register('target_amount', { valueAsNumber: true })} type="number" step="0.01" min="1" placeholder="10.000,00" className={inputCls} />
            {errors.target_amount && <span className="text-xs text-red-400">{errors.target_amount.message}</span>}
          </label>

          {/* Valor atual */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Valor já acumulado (R$)</span>
            <input {...register('current_amount', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0,00" className={inputCls} />
            {errors.current_amount && <span className="text-xs text-red-400">{errors.current_amount.message}</span>}
          </label>

          {/* Prazo */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Prazo (opcional)</span>
            <input {...register('deadline')} type="date" className={inputCls} />
            {errors.deadline && <span className="text-xs text-red-400">{errors.deadline.message}</span>}
          </label>

          {/* Cor */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Cor</span>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.key)}
                  className={`w-8 h-8 rounded-full ${c.cls} transition-transform ${color === c.key ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:bg-neutral-800 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition">
              {loading ? 'Salvando…' : 'Criar meta'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
