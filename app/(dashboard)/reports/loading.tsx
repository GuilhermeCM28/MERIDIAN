// Skeleton de Relatórios

const pulse: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-background-secondary) 25%, var(--color-background-primary) 50%, var(--color-background-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: 6,
}

export default function ReportsLoading() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ ...pulse, width: 90, height: 15, marginBottom: 6 }} />
            <div style={{ ...pulse, width: 180, height: 11 }} />
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--color-border-tertiary)' }} />
          <div style={{ ...pulse, width: 120, height: 30, borderRadius: 8 }} />
        </div>
        <div style={{ ...pulse, width: 110, height: 30, borderRadius: 8 }} />
      </div>

      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Pie + Table grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">

          {/* Pie chart card */}
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ ...pulse, width: 160, height: 13, marginBottom: 14 }} />
            {/* Circle */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ ...pulse, width: 180, height: 180, borderRadius: '50%' }} />
            </div>
            {/* Legend pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {[70, 90, 60, 80, 55].map(w => (
                <div key={w} style={{ ...pulse, width: w, height: 16, borderRadius: 99 }} />
              ))}
            </div>
          </div>

          {/* Category table card */}
          <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ ...pulse, width: 120, height: 13, marginBottom: 14 }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <div style={{ ...pulse, width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...pulse, width: '60%', height: 11, marginBottom: 4 }} />
                  <div style={{ ...pulse, width: '40%', height: 12 }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...pulse, width: 50, height: 11, marginBottom: 4 }} />
                  <div style={{ ...pulse, width: 30, height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction list card */}
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ ...pulse, width: 120, height: 13 }} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              <div style={{ ...pulse, width: 45, height: 12, flexShrink: 0 }} />
              <div style={{ ...pulse, flex: 1, height: 12 }} />
              <div style={{ ...pulse, width: 70, height: 11 }} />
              <div style={{ ...pulse, width: 80, height: 12, marginLeft: 16 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
