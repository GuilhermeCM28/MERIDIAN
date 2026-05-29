'use client'

import { useState } from 'react'
import { PageTopbar } from '@/components/ui/PageTopbar'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, DollarSign, Wallet } from 'lucide-react'
import type { Investment } from '@/types'
import { AddInvestmentModal } from './AddInvestmentModal'
import { AddYieldModal } from './AddYieldModal'

interface InvestmentsClientProps {
  investments: Investment[]
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function InvestmentsClient({ investments }: InvestmentsClientProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedInvestmentForYield, setSelectedInvestmentForYield] = useState<Investment | null>(null)

  const totalInvested = investments.reduce((acc, curr) => acc + curr.invested_amount, 0)
  const totalYield = investments.reduce((acc, curr) => acc + curr.yield_amount, 0)
  const currentTotal = totalInvested + totalYield

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* ── Topbar ── */}
      <PageTopbar
        title="Investimentos"
        subtitle="Acompanhe a evolução do seu patrimônio"
      >
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white border-none rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo investimento
        </button>
      </PageTopbar>

      {/* ── Content ── */}
      <div className="flex-1 p-5 flex flex-col gap-6">
        
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background-secondary border border-border-primary rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Total Investido</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">{formatBRL(totalInvested)}</span>
          </div>

          <div className="bg-background-secondary border border-border-primary rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Total de Rendimentos</span>
            </div>
            <span className="text-2xl font-bold text-emerald-500">+{formatBRL(totalYield)}</span>
          </div>

          <div className="bg-background-secondary border border-border-primary rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <DollarSign className="w-24 h-24 text-accent-blue" />
            </div>
            <div className="flex items-center gap-2 text-text-secondary relative z-10">
              <DollarSign className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-medium">Montante Atual</span>
            </div>
            <span className="text-2xl font-bold text-accent-blue relative z-10">{formatBRL(currentTotal)}</span>
          </div>
        </div>

        {/* Lista */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Meus Ativos</h2>
          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border-primary rounded-xl">
              <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-text-secondary" />
              </div>
              <p className="text-text-secondary text-sm font-medium">Nenhum investimento registrado.</p>
              <p className="text-text-secondary/70 text-xs mt-1">Adicione seus investimentos para acompanhar os rendimentos.</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {investments.map(inv => {
                const total = inv.invested_amount + inv.yield_amount
                return (
                  <motion.div key={inv.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="bg-background-secondary border border-border-primary rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">{inv.name}</h3>
                        <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">{inv.type}</span>
                      </div>
                      {inv.expected_return_percentage !== null && (
                        <div className="bg-background-tertiary px-2 py-1 rounded-md text-xs font-semibold text-emerald-500">
                          {inv.expected_return_percentage}% a.a.
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Investido:</span>
                        <span className="font-medium text-text-primary">{formatBRL(inv.invested_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Rendimentos:</span>
                        <span className="font-medium text-emerald-500">+{formatBRL(inv.yield_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border-primary pt-2 mt-2">
                        <span className="text-text-secondary">Montante:</span>
                        <span className="font-bold text-text-primary">{formatBRL(total)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedInvestmentForYield(inv)}
                      className="w-full bg-background-tertiary hover:bg-emerald-500/10 text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg py-2 text-xs font-medium transition-colors"
                    >
                      Atualizar rendimento
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddForm && <AddInvestmentModal onClose={() => setShowAddForm(false)} />}
      {selectedInvestmentForYield && (
        <AddYieldModal 
          investment={selectedInvestmentForYield} 
          onClose={() => setSelectedInvestmentForYield(null)} 
        />
      )}
    </div>
  )
}
