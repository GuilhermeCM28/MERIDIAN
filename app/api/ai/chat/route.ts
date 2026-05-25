import { NextResponse } from 'next/server'
import { z } from 'zod'
import { anthropic } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { getMonthSummary } from '@/lib/supabase/queries'
import { checkRateLimit, AI_RATE_LIMIT } from '@/lib/rate-limit'

// ── Schema de validação ───────────────────────────────────────────────────────

const MessageSchema = z.object({
  role:    z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

const RequestSchema = z.object({
  // Limita histórico a 20 mensagens para evitar payloads gigantes
  messages: z.array(MessageSchema).min(1).max(20),
})

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Verificar autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  // 2. Rate limiting por usuário (janela compartilhada com /api/ai/tips)
  const rl = checkRateLimit(`chat:${user.id}`, AI_RATE_LIMIT)
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

  const { messages } = parsed.data

  try {
    // Buscar contexto financeiro do usuário (reutiliza client já instanciado)
    const now     = new Date()
    const summary = await getMonthSummary(user.id, now.getFullYear(), now.getMonth() + 1, supabase)

    const categoriesText = summary.by_category
      .map(c => `  - ${c.category}: R$ ${c.amount.toFixed(2)} (${c.pct}%)`)
      .join('\n')

    const systemPrompt = `Você é o assistente financeiro pessoal do app Meridian, especialista em finanças pessoais brasileiras.
Você tem acesso ao resumo financeiro atual do usuário e deve responder de forma amigável, direta e personalizada em português.

📊 Situação financeira atual (${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}):
- Receita total: R$ ${summary.total_income.toFixed(2)}
- Gastos totais: R$ ${summary.total_expenses.toFixed(2)}
- Saldo: R$ ${summary.balance.toFixed(2)}
- Gastos por categoria:
${categoriesText || '  - Nenhum gasto registrado este mês'}

Seja conciso, prático e use emojis com moderação. Evite respostas genéricas — use os dados acima para personalizar seus conselhos.`

    const response = await anthropic.messages.create({
      model:      'claude-3-haiku-20240307',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ reply }, {
      headers: { 'X-RateLimit-Remaining': String(rl.remaining) },
    })
  } catch (error) {
    console.error('Erro no chat de IA:', error)
    return NextResponse.json(
      { error: 'Não foi possível processar sua mensagem.' },
      { status: 500 }
    )
  }
}
