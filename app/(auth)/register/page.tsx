'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name,            setName]            = useState('')
  const [username,        setUsername]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState('')
  const [usernameError,   setUsernameError]   = useState('')
  const [passwordError,   setPasswordError]   = useState('')
  const [loading,         setLoading]         = useState(false)

  // Valida e formata o username enquanto o usuário digita
  function handleUsernameChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(clean)
    if (clean.length > 0 && clean.length < 3) {
      setUsernameError('Mínimo 3 caracteres')
    } else if (clean.length > 20) {
      setUsernameError('Máximo 20 caracteres')
    } else {
      setUsernameError('')
    }
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value)
    if (value && value !== password) {
      setPasswordError('As senhas não coincidem')
    } else {
      setPasswordError('')
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('As senhas não coincidem')
    } else {
      setPasswordError('')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (usernameError || username.length < 3) {
      setUsernameError('Nome de usuário inválido')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }

    setLoading(true)
    setError('')

    // Verifica se o username já está em uso
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      setError('Este nome de usuário já está em uso. Escolha outro.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Garante que o perfil exista com username (fallback caso o trigger não rode)
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        username,
      })
      if (profileError) {
        setError('Erro ao salvar perfil: ' + profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/')
  }

  const inputCls = "w-full bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
  const inputErrCls = "border-red-700 focus:border-red-500 focus:ring-red-500"

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-neutral-950 to-neutral-950 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Meridian</h1>
          <p className="text-sm text-neutral-500 mt-1">Seu ponto de referência financeiro</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h2 className="text-lg font-medium text-white mb-6">Criar conta</h2>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Nome */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                className={inputCls}
              />
            </div>

            {/* Nome de usuário */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Nome de usuário</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 select-none pointer-events-none">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  placeholder="seu_usuario"
                  required
                  maxLength={20}
                  className={`${inputCls} pl-8 ${usernameError ? inputErrCls : ''}`}
                />
              </div>
              {usernameError
                ? <p className="text-xs text-red-400 mt-1">{usernameError}</p>
                : <p className="text-xs text-neutral-600 mt-1">Apenas letras minúsculas, números e _ (mín. 3 caracteres)</p>
              }
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className={inputCls}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => handlePasswordChange(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className={`${inputCls} ${passwordError ? inputErrCls : ''}`}
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => handleConfirmPasswordChange(e.target.value)}
                placeholder="Repita a senha"
                minLength={8}
                required
                className={`${inputCls} ${passwordError ? inputErrCls : ''}`}
              />
              {passwordError && (
                <p className="text-xs text-red-400 mt-1">{passwordError}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !!usernameError || !!passwordError}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-2.5 text-sm transition mt-2"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-sm text-neutral-500 text-center mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
