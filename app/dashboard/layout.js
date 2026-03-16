'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (!session) {
        router.push('/owner-login')
      } else {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        router.push('/owner-login')
      } else if (session) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/owner-login')
  }

  const tabs = [
    { label: '👥 Players', href: '/dashboard' },
    { label: '📊 Stats', href: '/dashboard/stats' },
    { label: '📡 Game Feed', href: '/dashboard/feed' },
    { label: '🏆 Box Scores', href: '/dashboard/boxscores' },
    { label: '📋 Transactions', href: '/dashboard/transactions' },
    { label: '🖼️ Home Photos', href: '/dashboard/photos' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading dashboard...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(204,0,0,0.3)',
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

      <div style={{
        background: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 2rem',
        display: 'flex',
        overflowX: 'auto',
        backdropFilter: 'blur(8px)'
      }}>
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: '600',
              color: pathname === tab.href ? '#CC0000' : 'rgba(255,255,255,0.5)',
              borderBottom: pathname === tab.href ? '2px solid #CC0000' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}