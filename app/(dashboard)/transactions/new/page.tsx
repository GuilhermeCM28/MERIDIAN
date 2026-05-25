'use client'

import { useRouter } from 'next/navigation'
import { useState }  from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  type: z.enum(['expense', 'income']),
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.number({ message: 'Valor inválido' }).positive('O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data é obrigatória'),
})

type TransactionFormData = z.infer<typeof schema>

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  )
}

const inputCls = "bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
const inputErrorCls = "border-red-500 focus:border-red-500 focus:ring-red-500/30"

export default function NewTransactionPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
    }
  })

  async function onSubmit(data: TransactionFormData) {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Não autenticado'); setLoading(false); return }

    const { error: err } = await supabase.from('transactions').insert({
      user_id:     user.id,
      description: data.description,
      amount:      data.amount,
      type:        data.type,
      date:        data.date,
    })

    if (err) { toast.error(err.message); setLoading(false); return }

    toast.success('Transação criada!')
    router.push('/transactions')
    router.refresh()
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Voltar
        </button>
        <h1 className="text-xl font-semibold text-white">Nova transação</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Registre uma receita ou gasto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        {/* Tipo */}
        <Field label="Tipo" error={errors.type?.message}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => field.onChange(t)}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${
                      field.value === t
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
            )}
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição" error={errors.description?.message}>
          <input
            {...register('description')}
            placeholder="Ex: Supermercado, Salário…"
            className={`${inputCls} ${errors.description ? inputErrorCls : ''}`}
          />
        </Field>

        {/* Valor */}
        <Field label="Valor (R$)" error={errors.amount?.message}>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0,00"
            className={`${inputCls} ${errors.amount ? inputErrorCls : ''}`}
          />
        </Field>

        {/* Data */}
        <Field label="Data" error={errors.date?.message}>
          <input
            {...register('date')}
            type="date"
            className={`${inputCls} ${errors.date ? inputErrorCls : ''}`}
          />
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition"
        >
          {loading ? 'Salvando…' : 'Salvar transação'}
        </button>
      </form>
    </div>
  )
}
