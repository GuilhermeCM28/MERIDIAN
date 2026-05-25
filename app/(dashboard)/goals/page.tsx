import { createClient } from '@/lib/supabase/server'
import { GoalsClient }  from '@/components/goals/GoalsClient'
import type { Goal }    from '@/types'

export const metadata = {
  title: 'Metas — Meridian',
  description: 'Crie e acompanhe seus objetivos financeiros',
}

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <GoalsClient goals={(goals ?? []) as Goal[]} />
    </>
  )
}
