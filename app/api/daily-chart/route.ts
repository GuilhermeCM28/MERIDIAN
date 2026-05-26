import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { lastDayOfMonth } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year  = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to   = lastDayOfMonth(year, month)

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', user.id)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Número de dias do mês
  const daysInMonth = new Date(year, month, 0).getDate()

  // Agrupar por dia
  const byDay: Record<number, { income: number; expenses: number }> = {}
  data?.forEach(t => {
    const day = parseInt(t.date.slice(8, 10), 10)
    if (!byDay[day]) byDay[day] = { income: 0, expenses: 0 }
    if (t.type === 'income')  byDay[day].income   += t.amount
    if (t.type === 'expense') byDay[day].expenses += t.amount
  })

  // Retorna array com todos os dias do mês (mesmo sem transações)
  const result = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      day,
      income:   byDay[day]?.income   ?? 0,
      expenses: byDay[day]?.expenses ?? 0,
    }
  })

  return NextResponse.json(result)
}
