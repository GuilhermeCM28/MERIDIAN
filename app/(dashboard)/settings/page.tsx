'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageTopbar } from '@/components/ui/PageTopbar'

interface Category {
  id: string
  name: string
  color: string | null
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#EF4444',
]

export default function SettingsPage() {
  const supabase = createClient()
  const router   = useRouter()

  // Perfil
  const [name,          setName]          = useState('')
  const [budget,        setBudget]        = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg,    setProfileMsg]    = useState<{ ok: boolean; text: string } | null>(null)

  // Categorias
  const [categories,    setCategories]    = useState<Category[]>([])
  const [newCatName,    setNewCatName]    = useState('')
  const [newCatColor,   setNewCatColor]   = useState(PRESET_COLORS[0])
  const [catSaving,     setCatSaving]     = useState(false)
  const [catMsg,        setCatMsg]        = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, catsRes] = await Promise.all([
        supabase.from('profiles').select('name, monthly_budget').eq('id', user.id).single(),
        supabase.from('categories').select('id, name, color').order('name'),
      ])

      if (profileRes.data) {
        setName(profileRes.data.name ?? '')
        setBudget(profileRes.data.monthly_budget?.toString() ?? '')
      }
      setCategories(catsRes.data ?? [])
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setProfileSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({ name, monthly_budget: parseFloat(budget) || 0 })
      .eq('id', user.id)

    setProfileMsg(error
      ? { ok: false, text: 'Erro ao salvar: ' + error.message }
      : { ok: true,  text: 'Perfil atualizado com sucesso!' }
    )
    setProfileSaving(false)
    router.refresh()
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    setCatSaving(true)
    setCatMsg(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCatSaving(false); return }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCatName.trim(), color: newCatColor, user_id: user.id })
      .select('id, name, color')
      .single()

    if (error) {
      setCatMsg({ ok: false, text: 'Erro ao criar: ' + error.message })
    } else if (data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCatName('')
      setCatMsg({ ok: true, text: `Categoria "${data.name}" criada!` })
    }
    setCatSaving(false)
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const inputStyle = {
    background: 'var(--color-background-tertiary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 6
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
      {/* ── Topbar ── */}
      <PageTopbar
        title="Configurações"
        subtitle="Gerencie seu perfil e categorias"
      />

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* ── Perfil ─────────────────────────────────────────── */}
          <section style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Perfil
            </h2>

            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-border-info)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Orçamento mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-border-info)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'}
                />
              </div>

              {profileMsg && (
                <div style={{
                  fontSize: 12, padding: '10px 12px', borderRadius: 'var(--border-radius-md)',
                  border: `0.5px solid ${profileMsg.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)'}`,
                  background: profileMsg.ok ? 'var(--color-background-success)' : 'var(--color-background-danger)',
                  color: profileMsg.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)'
                }}>
                  {profileMsg.text}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    background: '#2563eb', color: '#fff', border: 'none',
                    borderRadius: 'var(--border-radius-md)', padding: '8px 16px',
                    fontSize: 13, fontWeight: 500, cursor: profileSaving ? 'not-allowed' : 'pointer',
                    opacity: profileSaving ? 0.6 : 1, transition: '0.2s'
                  }}
                >
                  {profileSaving ? 'Salvando…' : 'Salvar perfil'}
                </button>
              </div>
            </form>
          </section>

          {/* ── Categorias ─────────────────────────────────────── */}
          <section style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            border: '0.5px solid var(--color-border-tertiary)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Categorias
            </h2>

            {/* Nova categoria */}
            <form onSubmit={addCategory} style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Nova categoria</label>
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Ex: Alimentação"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-border-info)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Cor</label>
                <div style={{ display: 'flex', gap: 6, paddingBottom: 2 }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: '6px', cursor: 'pointer',
                        border: newCatColor === c ? '2px solid #fff' : '2px solid transparent',
                        backgroundColor: c, transition: '0.2s',
                        transform: newCatColor === c ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={catSaving || !newCatName.trim()}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 'var(--border-radius-md)', padding: '8px 16px',
                  fontSize: 13, fontWeight: 500, cursor: (catSaving || !newCatName.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (catSaving || !newCatName.trim()) ? 0.6 : 1, transition: '0.2s', flexShrink: 0,
                  height: 35
                }}
              >
                {catSaving ? '…' : 'Adicionar'}
              </button>
            </form>

            {catMsg && (
              <div style={{
                fontSize: 12, padding: '10px 12px', borderRadius: 'var(--border-radius-md)', marginBottom: 16,
                border: `0.5px solid ${catMsg.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)'}`,
                background: catMsg.ok ? 'var(--color-background-success)' : 'var(--color-background-danger)',
                color: catMsg.ok ? 'var(--color-text-success)' : 'var(--color-text-danger)'
              }}>
                {catMsg.text}
              </div>
            )}

            {/* Lista de categorias */}
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)', fontSize: 12 }}>
                Nenhuma categoria criada ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-tertiary)',
                      border: '0.5px solid var(--color-border-tertiary)'
                    }}
                  >
                    <span
                      style={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: cat.color ?? '#6B7280'
                      }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--color-text-primary)', flex: 1 }}>{cat.name}</span>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-secondary)', borderRadius: 4
                      }}
                      onMouseOver={e => { e.currentTarget.style.color = 'var(--color-text-danger)'; e.currentTarget.style.background = 'var(--color-background-danger)'; }}
                      onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                      title="Deletar categoria"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
