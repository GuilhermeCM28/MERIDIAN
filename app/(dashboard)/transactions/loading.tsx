// Skeleton de Transações

const pulse: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-background-secondary) 25%, var(--color-background-primary) 50%, var(--color-background-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: 6,
}

export default function TransactionsLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>

      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)', flexShrink: 0,
      }}>
        <div>
          <div style={{ ...pulse, width: 100, height: 15, marginBottom: 6 }} />
          <div style={{ ...pulse, width: 140, height: 11 }} />
        </div>
        <div style={{ ...pulse, width: 120, height: 30, borderRadius: 8 }} />
      </div>

      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Filters skeleton */}
        <div style={{ ...pulse, height: 36, width: '100%', maxWidth: 400, borderRadius: 8 }} />

        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ ...pulse, width: 80, height: 11, marginBottom: 8 }} />
              <div style={{ ...pulse, width: 100, height: 20 }} />
            </div>
          ))}
        </div>

        {/* Card containing Table */}
        <div className="page-card !p-0 overflow-x-auto">
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px,3fr) minmax(100px,1fr) minmax(80px,1fr) minmax(80px,1fr) minmax(80px,1fr) 60px', gap: 12, padding: '8px 12px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            {['Descrição', 'Categoria', 'Data', 'Tipo', 'Valor', ''].map(h => (
              <div key={h} style={{ ...pulse, height: 11, width: h ? '60%' : 20 }} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px,3fr) minmax(100px,1fr) minmax(80px,1fr) minmax(80px,1fr) minmax(80px,1fr) 60px', gap: 12, padding: '10px 12px', borderBottom: '0.5px solid var(--color-border-tertiary)', alignItems: 'center' }}>
              <div style={{ ...pulse, height: 12, width: '80%' }} />
              <div style={{ ...pulse, height: 20, width: 70, borderRadius: 8 }} />
              <div style={{ ...pulse, height: 12, width: 50 }} />
              <div style={{ ...pulse, height: 20, width: 55, borderRadius: 8 }} />
              <div style={{ ...pulse, height: 12, width: 70, marginLeft: 'auto' }} />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <div style={{ ...pulse, width: 18, height: 18 }} />
                <div style={{ ...pulse, width: 18, height: 18 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
