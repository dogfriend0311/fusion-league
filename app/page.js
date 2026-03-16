'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [currentPhoto, setCurrentPhoto] = useState(0)

  useEffect(() => { fetchPhotos() }, [])

  useEffect(() => {
    if (photos.length === 0) return
    const timer = setInterval(() => {
      setCurrentPhoto(prev => (prev + 1) % photos.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [photos])

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('home_photos')
      .select('*')
      .order('display_order')
    if (data) setPhotos(data)
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: '900',
          color: '#CC0000',
          textShadow: '0 0 40px rgba(204,0,0,0.4)',
          letterSpacing: '3px',
          lineHeight: 1.1
        }}>
          FUSION LEAGUE
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '0.75rem',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          Official League Website
        </p>
      </div>

      {photos.length > 0 ? (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid rgba(204,0,0,0.3)',
          boxShadow: '0 0 40px rgba(204,0,0,0.15)',
          aspectRatio: '16/9',
          background: 'rgba(0,0,0,0.4)'
        }}>
          <img
            src={photos[currentPhoto]?.photo_url}
            alt="League highlight"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px'
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentPhoto(i)}
                style={{
                  width: i === currentPhoto ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === currentPhoto ? '#CC0000' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '16/9',
          borderRadius: '16px',
          border: '2px dashed rgba(204,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '14px'
        }}>
          Photos will appear here once added from the Owner Dashboard
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '2.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { href: '/members', label: '👥 Members' },
          { href: '/feed', label: '📡 Game Feed' },
          { href: '/transactions', label: '📋 Transactions' }
        ].map(btn => (
          <a
            key={btn.href}
            href={btn.href}
            style={{
              padding: '12px 28px',
              borderRadius: '50px',
              border: '1px solid rgba(204,0,0,0.4)',
              background: 'rgba(204,0,0,0.08)',
              color: '#CC0000',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '1px',
              cursor: 'pointer'
            }}
          >
            {btn.label}
          </a>
        ))}
      </div>
    </main>
  )
}