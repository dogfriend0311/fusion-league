'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/members', label: 'Members' },
    { href: '/feed', label: 'Game Feed' },
    { href: '/transactions', label: 'Transactions' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#CC0000',
        letterSpacing: '1px'
      }}>
        ⚡ FUSION LEAGUE
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: pathname === link.href ? '#CC0000' : 'rgba(255,255,255,0.8)',
              borderBottom: pathname === link.href ? '2px solid #CC0000' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'all 0.2s'
            }}
          >
            {link.label}
          </Link>
        ))}

        {/* Hidden owner link */}
        <Link
          href="/owner-login"
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            marginLeft: '1rem'
          }}
        >
          ⚙
        </Link>
      </div>
    </nav>
  )
}