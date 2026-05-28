'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@/types'
import { formatBRL } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2, PiggyBank, ChevronDown, ChevronUp } from 'lucide-react'
import { GoalDepositModal } from './GoalDepositModal'

interface Contribution {
  id: string
  amount: number
  note: string | null
  date: string
}

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const router   = useRouter()
  const supabase = createClient()
  const [deleting,     setDeleting]     = useState(false)
  const [showDeposit,  setShowDeposit]  = useState(false)
  const [showHistory,  setShowHistory]  = useState(false)
  const [contributions, setContribs]   = useState<Contribution[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const pct  = Math.min(100, goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0)
  const done = pct >= 100

  // Load contribution history when expanded
  useEffect(() => {
    if (!showHistory) return
    setLoadingHistory(true)
    supabase
      .from('goal_contributions')
      .select('id, amount, note, date')
      .eq('goal_id', goal.id)
      .order('date', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setContribs((data ?? []) as Contribution[])
        setLoadingHistory(false)
      })
  }, [showHistory, goal.id, supabase])

  async function handleDelete() {
    if (!confirm('Deseja realmente excluir esta meta?')) return
    setDeleting(true)
    const { error } = await supabase.from('goals').delete().eq('id', goal.id)
    if (error) {
      toast.error('Erro ao excluir meta')
      setDeleting(false)
    } else {
      toast.success('Meta excluída')
      router.refresh()
    }
  }

  const deadlineStr = goal.deadline
    ? new Date(goal.deadline + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : null

  // Color based on goal color field
  const barColor = done ? '#10b981' : (goal.color ?? '#2563eb')

  return (
    <>
      <div className="goal-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div className="text-xs font-medium text-white flex items-center gap-1.5 mb-0.5">
              {goal.title}
              {done && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">✓ Concluída</span>}
            </div>
            {deadlineStr && (
              <div className="text-[11px] text-neutral-500">Prazo: {deadlineStr}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${done ? 'text-emerald-500' : 'text-blue-400'}`}>{pct}%</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-neutral-500 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
              title="Excluir meta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="goal-bar">
          <div className="goal-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>

        {/* Amounts row */}
        <div className="flex justify-between text-[11px] text-neutral-400 mt-2 mb-3">
          <span>{formatBRL(goal.current_amount)} de {formatBRL(goal.target_amount)}</span>
          {!done && <span className="text-neutral-500">Faltam {formatBRL(goal.target_amount - goal.current_amount)}</span>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!done && (
            <button
              onClick={() => setShowDeposit(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 500,
                color: '#10b981', cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            >
              <PiggyBank className="w-3.5 h-3.5" /> Depositar
            </button>
          )}

          <button
            onClick={() => setShowHistory(h => !h)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 500,
              color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Histórico
          </button>
        </div>

        {/* Contribution history */}
        {showHistory && (
          <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
            {loadingHistory ? (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0' }}>Carregando…</p>
            ) : contributions.length === 0 ? (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0' }}>Nenhum aporte registrado</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {contributions.map(c => {
                  const dateStr = new Date(c.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 60, flexShrink: 0 }}>{dateStr}</span>
                      <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.note || '—'}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', flexShrink: 0 }}>+{formatBRL(c.amount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deposit modal */}
      {showDeposit && <GoalDepositModal goal={goal} onClose={() => setShowDeposit(false)} />}
    </>
  )
}
