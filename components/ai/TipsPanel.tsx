'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MonthSummary } from '@/types'

interface Tip {
  id:          number
  title:       string
  description: string
}

interface TipsPanelProps {
  summary:   MonthSummary
  /** Se true, mostra botão CTA "Pedir análise personalizada" */
  showCTA?:  boolean
  /** Quantas dicas mostrar (default: 2 no dashboard, 6 na página de dicas) */
  limit?:    number
}

export function TipsPanel({ summary, showCTA = false, limit = 2 }: TipsPanelProps) {
  const [tips,    setTips]    = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!summary) return
    setLoading(true)
    setError(false)

    fetch('/api/ai/tips', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ summary }),
    })
      .then(r  => r.json())
      .then(d  => setTips(d.tips ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary.total_income, summary.total_expenses, summary.balance])

  const visibleTips = tips.slice(0, limit)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: limit > 2 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
      gap: 10
    }}>

      {/* Loading */}
      {loading && [1, 2].map(i => (
        <div key={i} style={{ background:'var(--color-background-secondary)', borderRadius:'var(--border-radius-md)', padding:'10px 12px', marginBottom:8, animation:'pulse 1.5s infinite' }}>
          <div style={{ height:10, background:'var(--color-background-primary)', borderRadius:4, width:'60%', marginBottom:6 }} />
          <div style={{ height:8, background:'var(--color-background-primary)', borderRadius:4, width:'100%', marginBottom:3 }} />
          <div style={{ height:8, background:'var(--color-background-primary)', borderRadius:4, width:'80%' }} />
        </div>
      ))}

      {/* Error */}
      {error && (
        <p style={{ fontSize:12, color:'var(--color-text-tertiary)', textAlign:'center', padding:'12px 0' }}>
          Não foi possível carregar as dicas.
        </p>
      )}

      {/* Tips */}
      {!loading && !error && visibleTips.map((tip, i) => (
        <div key={tip.id} style={{ background:'var(--color-background-secondary)', borderRadius:'var(--border-radius-md)', padding:'10px 12px' }}>
          <div style={{ fontSize:10, fontWeight:500, color:'var(--color-text-info)', marginBottom:3 }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--color-text-primary)', marginBottom:2 }}>{tip.title}</div>
          <div style={{ fontSize:11, color:'var(--color-text-secondary)', lineHeight:1.5 }}>{tip.description}</div>
        </div>
      ))}

      {/* CTA */}
      {showCTA && !loading && (
        <div style={{ gridColumn: '1 / -1' }}>
          <button
            onClick={() => router.push('/ai-tips')}
            style={{
              width:'100%', padding:'10px',
              borderRadius:'var(--border-radius-md)',
              border:'0.5px solid var(--color-border-secondary)',
              background:'var(--color-background-primary)',
              color:'var(--color-text-secondary)',
              fontSize:12, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}
          >
            <i className="ti ti-message-circle" aria-hidden="true" />
            Pedir análise personalizada ↗
          </button>
        </div>
      )}
    </div>
  )
}