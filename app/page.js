].map(btn => (
          
            key={btn.href}
            href={btn.href}
            style={{
              padding: '12px 28px',
              borderRadius: '50px',
              border: '1px solid rgba(255,215,0,0.4)',
              background: 'rgba(255,215,0,0.08)',
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '1px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {btn.label}
          </a>
        ))}