import { createClient } from '@/lib/supabase/server'
import { InvestmentsClient }  from '@/components/investments/InvestmentsClient'
import type { Investment }    from '@/types'

export const metadata = {
  title: 'Investimentos — Meridian',
  description: 'Acompanhe seus investimentos e rendimentos',
}

export default async function InvestmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <InvestmentsClient investments={(investments ?? []) as Investment[]} />
    </>
  )
}
