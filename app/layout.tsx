import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider, ThemeScript } from '@/components/ui/ThemeProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Meridian — Controle financeiro pessoal',
  description: 'Seu ponto de referência financeiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Aplica tema ANTES da primeira pintura — evita flash */}
        <ThemeScript />
        {/* Tabler Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background-primary text-text-primary min-h-screen selection:bg-accent-blue/30 selection:text-white">
        <ThemeProvider>
          {children}
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-primary)',
                color: 'var(--color-text-primary)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
