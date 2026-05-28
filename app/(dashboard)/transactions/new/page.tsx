'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect }  from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  type:                z.enum(['expense', 'income']),
  description:         z.string().min(1, 'A descrição é obrigatória'),
  amount:              z.number({ message: 'Valor inválido' }).positive('O valor deve ser maior que zero'),
  date:                z.string().min(1, 'A data é obrigatória'),
  category_id:         z.string().optional(),
  is_recurring:        z.boolean(),
  recurrence_interval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
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

const inputCls = "bg-background-tertiary border border-border-primary rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 transition"
const inputErrorCls = "border-accent-rose focus:border-accent-rose focus:ring-accent-rose/30"

const INTERVAL_LABELS: Record<string, string> = {
  daily:   'Diária',
  weekly:  'Semanal',
  monthly: 'Mensal',
  yearly:  'Anual',
}

/** Calculates the next_due_date based on a reference date and interval */
function computeNextDue(date: string, interval: string): string {
  const d = new Date(date + 'T00:00:00')
  if (interval === 'daily')   d.setDate(d.getDate() + 1)
  if (interval === 'weekly')  d.setDate(d.getDate() + 7)
  if (interval === 'monthly') d.setMonth(d.getMonth() + 1)
  if (interval === 'yearly')  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

interface Category { id: string; name: string; color: string | null }

export default function NewTransactionPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,    setLoading]    = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Load user categories
  useEffect(() => {
    supabase.from('categories').select('id, name, color').order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [supabase])

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:         'expense',
      date:         new Date().toISOString().slice(0, 10),
      is_recurring: false,
    }
  })

  const isRecurring = watch('is_recurring')

  async function onSubmit(data: TransactionFormData) {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Não autenticado'); setLoading(false); return }

    const nextDue = data.is_recurring && data.recurrence_interval
      ? computeNextDue(data.date, data.recurrence_interval)
      : null

    const { error: err } = await supabase.from('transactions').insert({
      user_id:             user.id,
      description:         data.description,
      amount:              data.amount,
      type:                data.type,
      date:                data.date,
      category_id:         data.category_id || null,
      is_recurring:        data.is_recurring,
      recurrence_interval: data.is_recurring ? (data.recurrence_interval ?? null) : null,
      next_due_date:       nextDue,
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
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Voltar
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Nova transação</h1>
        <p className="text-sm text-text-secondary mt-0.5">Registre uma receita ou gasto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-background-secondary border border-border-primary rounded-2xl p-6 space-y-5">
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
                          ? 'bg-accent-emerald-subtle border-accent-emerald/50 text-accent-emerald'
                          : 'bg-accent-rose-subtle border-accent-rose/50 text-accent-rose'
                        : 'bg-background-tertiary border-border-primary text-text-secondary hover:text-text-primary'
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

        {/* Categoria */}
        {categories.length > 0 && (
          <Field label="Categoria (opcional)">
            <select
              {...register('category_id')}
              className={`${inputCls} appearance-none`}
            >
              <option value="">— Sem categoria —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Data */}
        <Field label="Data" error={errors.date?.message}>
          <input
            {...register('date')}
            type="date"
            className={`${inputCls} ${errors.date ? inputErrorCls : ''}`}
          />
        </Field>

        {/* Recorrência */}
        <div className="space-y-3">
          <Controller
            name="is_recurring"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div
                  onClick={() => field.onChange(!field.value)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${field.value ? 'bg-accent-blue' : 'bg-background-tertiary border border-border-primary'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Transação recorrente
                </span>
              </label>
            )}
          />

          {isRecurring && (
            <Field label="Frequência" error={errors.recurrence_interval?.message}>
              <select
                {...register('recurrence_interval')}
                className={`${inputCls} appearance-none`}
              >
                <option value="">Selecione…</option>
                {Object.entries(INTERVAL_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-blue hover:bg-accent-blue-hover disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition"
        >
          {loading ? 'Salvando…' : 'Salvar transação'}
        </button>
      </form>
    </div>
  )
}
