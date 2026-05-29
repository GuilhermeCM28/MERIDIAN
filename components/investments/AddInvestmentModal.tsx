'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const investmentSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  type: z.string().min(1, 'O tipo é obrigatório'),
  invested_amount: z.number({ message: 'Valor inválido' }).min(0, 'O valor não pode ser negativo'),
  expected_return_percentage: z.number({ message: 'Valor inválido' }).optional(),
})

type InvestmentFormData = z.infer<typeof investmentSchema>

const inputCls = "bg-background-tertiary border border-border-primary rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition w-full"

interface AddInvestmentModalProps {
  onClose: () => void
}

export function AddInvestmentModal({ onClose }: AddInvestmentModalProps) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      invested_amount: 0,
      expected_return_percentage: undefined,
    }
  })

  async function onSubmit(data: InvestmentFormData) {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Não autenticado'); setLoading(false); return }

    const { error: err } = await supabase.from('investments').insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      invested_amount: data.invested_amount,
      expected_return_percentage: data.expected_return_percentage || null,
      yield_amount: 0,
    })

    if (err) { toast.error(err.message); setLoading(false); return }

    if (data.invested_amount > 0) {
      let categoryId = null
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Investimentos')
        .single()
      
      if (cat) {
        categoryId = cat.id
      } else {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({ user_id: user.id, name: 'Investimentos', color: '#8b5cf6' })
          .select('id')
          .single()
        if (newCat) categoryId = newCat.id
      }

      await supabase.from('transactions').insert({
        user_id: user.id,
        category_id: categoryId,
        description: `Aporte: ${data.name}`,
        amount: data.invested_amount,
        type: 'investment',
        date: new Date().toISOString().split('T')[0],
      })
    }

    toast.success('Investimento adicionado!')
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
        className="relative bg-background-secondary backdrop-blur-2xl border border-border-primary rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-text-primary">Novo Investimento</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Nome</span>
            <input {...register('name')} placeholder="Ex: Tesouro Selic, CDB Banco X" className={inputCls} />
            {errors.name && <span className="text-xs text-accent-rose">{errors.name.message}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Tipo de Ativo</span>
            <select {...register('type')} className={inputCls}>
              <option value="">Selecione...</option>
              <option value="Renda Fixa">Renda Fixa</option>
              <option value="Renda Variável">Renda Variável</option>
              <option value="Fundos Imobiliários">Fundos Imobiliários</option>
              <option value="Criptomoedas">Criptomoedas</option>
              <option value="Outros">Outros</option>
            </select>
            {errors.type && <span className="text-xs text-accent-rose">{errors.type.message}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Valor Investido (R$)</span>
            <input {...register('invested_amount', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0,00" className={inputCls} />
            {errors.invested_amount && <span className="text-xs text-accent-rose">{errors.invested_amount.message}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Expectativa de Retorno (% a.a.)</span>
            <input {...register('expected_return_percentage', { valueAsNumber: true })} type="number" step="0.1" placeholder="Ex: 10.5" className={inputCls} />
            <span className="text-[10px] text-text-secondary/70">Opcional. Apenas para seu acompanhamento visual.</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border-primary hover:bg-background-tertiary transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition">
              {loading ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
