import { NextResponse } from 'next/server'
import { z } from 'zod'
import { anthropic } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, AI_RATE_LIMIT } from '@/lib/rate-limit'

// ── Schema de validação ───────────────────────────────────────────────────────

const CategoryItemSchema = z.object({
  category: z.string(),
  amount:   z.number().nonnegative(),
  pct:      z.number().min(0).max(100),
  count:    z.number().nonnegative().optional(),
})

const MonthSummarySchema = z.object({
  total_income:   z.number().nonnegative(),
  total_expenses: z.number().nonnegative(),
  balance:        z.number(),
  by_category:    z.array(CategoryItemSchema),
})

const RequestSchema = z.object({
  summary: MonthSummarySchema,
})

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Verificar autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  // 2. Rate limiting por usuário
  const rl = checkRateLimit(`tips:${user.id}`, AI_RATE_LIMIT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(AI_RATE_LIMIT.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(Math.ceil(rl.resetAt / 1000)),
          'Retry-After':           String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  // 3. Validar body
  const raw = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos.', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { summary } = parsed.data

  try {
    const categoriesText = summary.by_category
      .map(c => `  - ${c.category}: R$ ${c.amount.toFixed(2)} (${c.pct}%)`)
      .join('\n')

    const prompt = `
Você é um assistente especialista em finanças pessoais brasileiro.
Analise o resumo financeiro do mês do usuário e forneça exatamente 3 dicas práticas, 
personalizadas e acionáveis em português.

Resumo do mês:
- Receita total: R$ ${summary.total_income.toFixed(2)}
- Gastos totais: R$ ${summary.total_expenses.toFixed(2)}
- Saldo: R$ ${summary.balance.toFixed(2)}
- Gastos por categoria:
${categoriesText || '  - Nenhum gasto registrado'}

Retorne APENAS um JSON válido, sem texto adicional, sem markdown, no formato:
{
  "tips": [
    { "id": 1, "title": "Título curto e direto", "description": "Dica detalhada e acionável com base nos dados acima" },
    { "id": 2, "title": "...", "description": "..." },
    { "id": 3, "title": "...", "description": "..." }
  ]
}
`

    const message = await anthropic.messages.create({
      model:      'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    })

    const text   = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean  = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result, {
      headers: { 'X-RateLimit-Remaining': String(rl.remaining) },
    })
  } catch (error) {
    console.error('Erro na API de dicas:', error)
    return NextResponse.json(
      { error: 'Não foi possível gerar as dicas.' },
      { status: 500 }
    )
  }
}