'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('players')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/owner-login')
    } else {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/owner-login')
  }

  const tabs = [
    { id: 'players', label: '👥 Players', href: '/dashboard' },
    { id: 'stats', label: '📊 Stats', href: '/dashboard/stats' },
    { id: 'feed', label: '📡 Game Feed', href: '/dashboard/feed' },
    { id: 'boxscores', label: '🏆 Box Scores', href: '/dashboard/boxscores' },
    { id: 'transactions', label: '📋 Transactions', href: '/dashboard/transactions' },
    { id: 'photos', label: '🖼️ Home Photos', href: '/dashboard/photos' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Checking login...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Dashboard header */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(204,0,0,0.2)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '64px',
        zIndex: 50,
        backdropFilter: 'blur(12px)'
      }}>
        <h2 style={{ color: '#CC0000', fontWeight: '800', fontSize: '16px', letterSpacing: '2px' }}>
          ⚡ OWNER DASHBOARD
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            ← View Site
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255,100,100,0.4)',
              background: 'transparent',
              color: '#ff6666',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 2rem',
        display: 'flex',
        gap: '0',
        overflowX: 'auto',
        backdropFilter: 'blur(8px)'
      }}>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            href={tab.href}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.5)',
              borderBottom: '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Page content */}
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}