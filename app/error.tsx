'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error boundary caught:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background-tertiary)] p-4">
      <div className="page-card max-w-md w-full flex flex-col items-center text-center py-10 px-6 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Oops, algo deu errado!
        </h2>
        
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-8 max-w-xs leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página. Nossa equipe já foi notificada.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
