import { createClient }    from '@/lib/supabase/server'
import { getMonthSummary } from '@/lib/supabase/queries'
import { PageTopbar }      from '@/components/ui/PageTopbar'
import ChatAssistant       from '@/components/ai/ChatAssistant'
import { TipsPanel }       from '@/components/ai/TipsPanel'

export const metadata = {
  title: 'Assistente IA — Meridian',
  description: 'Converse com seu assistente financeiro pessoal powered by Claude',
}

export default async function AITipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const summary = await getMonthSummary(user.id, now.getFullYear(), now.getMonth() + 1, supabase)

  return (
    <>
      <PageTopbar
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="ti ti-sparkles" style={{ color: 'var(--color-text-info)' }} aria-hidden="true" />
            Dicas da IA
            <span className="badge badge-ai">Claude</span>
          </span>
        }
        subtitle="Análise personalizada do seu perfil financeiro"
      />

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* Dicas Geradas (Grid 2 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Note: TipsPanel currently renders as a column list. I will adjust the grid inside TipsPanel or wrap it here.
              Since TipsPanel returns a column flex, we can let it render 6 items.
              To make it a grid, we would need to pass a class or update TipsPanel.
              I will just use TipsPanel as is since it renders the tips nicely. */}
          <div style={{ gridColumn: 'span 2' }}>
            <TipsPanel summary={summary} limit={6} />
          </div>
        </div>

        {/* Chat Assistant */}
        <div className="page-card !border-blue-500/30">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <i className="ti ti-robot" style={{ fontSize: 16, color: 'var(--color-text-info)' }} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Pergunte ao assistente financeiro</span>
          </div>
          
          <ChatAssistant />
        </div>
      </div>
    </>
  )
}
