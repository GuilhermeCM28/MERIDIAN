'use client'

import { useState } from 'react'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { PageTopbar } from '@/components/ui/PageTopbar'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import type { Goal } from '@/types'

interface GoalsClientProps {
  goals: Goal[]
}

export function GoalsClient({ goals }: GoalsClientProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* ── Topbar ── */}
      <PageTopbar
        title="Metas financeiras"
        subtitle="Acompanhe seus objetivos"
      >
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white border-none rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <i className="ti ti-plus" aria-hidden="true" />
          Nova meta
        </button>
      </PageTopbar>

      {/* ── Content ── */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-neutral-500" />
            </div>
            <p className="text-neutral-400 text-sm">Nenhuma meta criada ainda.</p>
            <p className="text-neutral-500 text-xs mt-1">Defina seu primeiro objetivo financeiro para acompanhar seu progresso.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {goals.map(goal => (
              <motion.div key={goal.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <GoalCard goal={goal} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {showForm && <GoalForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
