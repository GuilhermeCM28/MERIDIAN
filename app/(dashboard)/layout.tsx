'use client'

import { useState } from 'react'
import Link      from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, LayoutDashboard, ArrowRightLeft, Target, BarChart3, Sparkles, Settings, LogOut, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/',             icon: LayoutDashboard, label: 'Visão geral'  },
  { href: '/transactions', icon: ArrowRightLeft,  label: 'Transações'   },
  { href: '/goals',        icon: Target,            label: 'Metas'         },
  { href: '/reports',      icon: BarChart3,         label: 'Relatórios'   },
  { href: '/ai-tips',      icon: Sparkles,          label: 'Dicas da IA'  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background-tertiary)]">
      
      {/* ── Mobile Topbar ── */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
           <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
             <Globe className="w-3.5 h-3.5 text-white" strokeWidth={2} />
           </div>
           <span className="text-sm font-medium text-white">Meridian</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-neutral-400 p-1">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Sidebar Overlay (Mobile) ── */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-[220px] flex-shrink-0 
        bg-[var(--color-background-primary)] border-r border-[var(--color-border-tertiary)] flex flex-col p-4
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Globe className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-medium text-white">Meridian</span>
        </div>

        {/* Close Button (Mobile) */}
        <div className="md:hidden flex justify-end mb-4">
           <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400 p-1 rounded-lg hover:bg-[#252525]">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1">
           {navItems.map(item => {
             const active = pathname === item.href
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setMobileMenuOpen(false)}
                 className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors
                   ${active 
                     ? 'bg-[var(--color-background-info)] text-[var(--color-text-info)] font-medium' 
                     : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-white'
                   }
                 `}
               >
                 <item.icon className="w-4 h-4" aria-hidden="true" />
                 {item.label}
               </Link>
             )
           })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-[var(--color-border-tertiary)] pt-3 flex flex-col gap-1">
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            Configurações
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-[var(--color-text-danger)] hover:bg-[var(--color-background-danger)] text-left w-full transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:pt-0 pt-[60px]">
        {children}
      </main>

    </div>
  )
}
