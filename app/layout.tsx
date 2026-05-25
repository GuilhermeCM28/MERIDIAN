import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import './globals.css'

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
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <head>
        {/* Tabler Icons — ícones usados em toda a app (fallback for some components if needed, though Lucide is preferred) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background-primary text-text-primary min-h-screen selection:bg-accent-blue/30 selection:text-white">
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{
          style: { background: '#121214', border: '1px solid #27272a', color: '#f4f4f5' }
        }} />
      </body>
    </html>
  )
}
