'use client'

import { useState } from 'react'
import Link      from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, LayoutDashboard, ArrowRightLeft, Target, BarChart3, Sparkles, Settings, LogOut, Menu, X, RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/',             icon: LayoutDashboard, label: 'Visão geral'  },
  { href: '/transactions', icon: ArrowRightLeft,  label: 'Transações'   },
  { href: '/goals',        icon: Target,            label: 'Metas'         },
  { href: '/reports',      icon: BarChart3,         label: 'Relatórios'   },
  { href: '/recurring',    icon: RefreshCw,         label: 'Assinaturas'  },
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
    <div className="flex min-h-screen bg-background-primary text-text-primary">
      
      {/* ── Mobile Topbar ── */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border-primary bg-background-secondary/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-accent-blue flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-blue/20">
             <Globe className="w-4 h-4 text-white" strokeWidth={2} />
           </div>
           <span className="text-[15px] font-semibold tracking-tight text-text-primary">Meridian</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-background-tertiary transition-colors">
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
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-[260px] flex-shrink-0 
        bg-background-secondary border-r border-border-primary flex flex-col p-5
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-3 mb-8 mt-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-blue to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-blue/30">
            <Globe className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-text-primary">Meridian</span>
        </div>

        {/* Close Button (Mobile) */}
        <div className="md:hidden flex justify-end mb-6">
           <button onClick={() => setMobileMenuOpen(false)} className="text-text-secondary p-2 rounded-lg hover:bg-background-tertiary transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1.5">
           {navItems.map(item => {
             const active = pathname === item.href
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setMobileMenuOpen(false)}
                 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200
                   ${active 
                     ? 'bg-accent-blue-subtle text-accent-blue' 
                     : 'text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary'
                   }
                 `}
               >
                 <item.icon className={`w-4 h-4 ${active ? 'text-accent-blue' : 'text-text-secondary'}`} aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                 {item.label}
               </Link>
             )
           })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border-primary pt-4 mt-4 flex flex-col gap-1.5">
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary transition-colors"
          >
            <Settings className="w-4 h-4 text-text-secondary" aria-hidden="true" />
            Configurações
          </Link>
          <ThemeToggle sidebar />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-accent-rose hover:bg-accent-rose-subtle text-left w-full transition-colors"
          >
            <LogOut className="w-4 h-4 text-accent-rose" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:pt-0 pt-[72px]">
        {children}
      </main>

    </div>
  )
}
