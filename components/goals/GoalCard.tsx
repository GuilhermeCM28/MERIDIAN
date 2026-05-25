'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@/types'
import { formatBRL } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)

  const pct = Math.min(100, goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0)
  const done = pct >= 100

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

  return (
    <div className="goal-card">
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
          <span className={`text-xs font-medium ${done ? 'text-emerald-500' : 'text-blue-400'}`}>
            {pct}%
          </span>
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
      
      <div className="goal-bar">
        <div className="goal-fill" style={{ width: `${pct}%`, background: done ? '#10b981' : undefined }} />
      </div>
      
      <div className="flex justify-between text-[11px] text-neutral-400 mt-2">
        <span>{formatBRL(goal.current_amount)} de {formatBRL(goal.target_amount)}</span>
        {!done && (
          <span className="text-neutral-500">Faltam {formatBRL(goal.target_amount - goal.current_amount)}</span>
        )}
      </div>
    </div>
  )
}
