import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/recurring/process
 *
 * Finds all overdue recurring transactions (next_due_date <= today)
 * for the authenticated user and duplicates them, advancing next_due_date.
 *
 * Returns: { processed: number, transactions: string[] }
 */
export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)

  // Fetch all overdue recurring transactions for this user
  const { data: due, error: fetchError } = await supabase
    .from('transactions')
    .select('id, description, amount, type, category_id, is_recurring, recurrence_interval, next_due_date')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .lte('next_due_date', today)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ processed: 0, transactions: [] })
  }

  const processed: string[] = []

  for (const tx of due) {
    const dueDate = tx.next_due_date!
    const interval = tx.recurrence_interval!

    // Compute new next_due_date
    const d = new Date(dueDate + 'T00:00:00')
    if (interval === 'daily')   d.setDate(d.getDate() + 1)
    if (interval === 'weekly')  d.setDate(d.getDate() + 7)
    if (interval === 'monthly') d.setMonth(d.getMonth() + 1)
    if (interval === 'yearly')  d.setFullYear(d.getFullYear() + 1)
    const newNextDue = d.toISOString().slice(0, 10)

    // Insert the duplicate transaction for the due date
    const { error: insertError } = await supabase.from('transactions').insert({
      user_id:             user.id,
      description:         tx.description,
      amount:              tx.amount,
      type:                tx.type,
      date:                dueDate,
      category_id:         tx.category_id,
      is_recurring:        false,          // The copy is a one-off
      recurrence_interval: null,
      next_due_date:       null,
    })

    if (insertError) continue

    // Advance next_due_date on the original recurring transaction
    await supabase
      .from('transactions')
      .update({ next_due_date: newNextDue })
      .eq('id', tx.id)

    processed.push(tx.description)
  }

  return NextResponse.json({ processed: processed.length, transactions: processed })
}
