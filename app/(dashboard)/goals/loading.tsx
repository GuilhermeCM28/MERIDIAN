// Skeleton de Metas

const pulse: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-background-secondary) 25%, var(--color-background-primary) 50%, var(--color-background-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: 6,
}

export default function GoalsLoading() {
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
          <div style={{ ...pulse, width: 130, height: 15, marginBottom: 6 }} />
          <div style={{ ...pulse, width: 170, height: 11 }} />
        </div>
        <div style={{ ...pulse, width: 100, height: 30, borderRadius: 8 }} />
      </div>

      {/* Goals grid */}
      <div style={{ flex: 1, padding: '16px 20px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="goal-card">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ ...pulse, width: 130, height: 13, marginBottom: 6 }} />
                  <div style={{ ...pulse, width: 90, height: 11 }} />
                </div>
                <div style={{ ...pulse, width: 50, height: 20, borderRadius: 8 }} />
              </div>

              {/* Progress bar */}
              <div className="goal-bar">
                <div style={{ ...pulse, height: 6, width: `${25 + i * 15}%`, borderRadius: 3 }} />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ ...pulse, width: 70, height: 11 }} />
                <div style={{ ...pulse, width: 80, height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
