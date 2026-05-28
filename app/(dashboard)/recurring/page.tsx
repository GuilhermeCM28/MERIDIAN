import { createClient } from '@/lib/supabase/server'
import { PageTopbar } from '@/components/ui/PageTopbar'
import { RecurringList } from '@/components/recurring/RecurringList'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch only transactions that are active recurrences
  const { data: recurringTxs } = await supabase
    .from('transactions')
    .select('*, category:categories(name, color)')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .order('next_due_date', { ascending: true })

  return (
    <>
      <PageTopbar
        title="Assinaturas e Recorrentes"
        subtitle="Gerencie seus gastos e recebimentos fixos"
      >
        <Link href="/transactions/new" className="btn-primary group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          Nova transação
        </Link>
      </PageTopbar>

      <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="glass-card p-6">
          <RecurringList initialData={recurringTxs ?? []} />
        </div>
      </div>
    </>
  )
}
