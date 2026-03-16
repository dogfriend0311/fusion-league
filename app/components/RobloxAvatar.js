'use client'
import { useState, useEffect } from 'react'

export default function RobloxAvatar({ robloxId, fallbackUrl, name, size = 80 }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (robloxId) fetchAvatar()
  }, [robloxId])

  const fetchAvatar = async () => {
    try {
      const res = await fetch(`/api/roblox-avatar?userId=${robloxId}`)
      const data = await res.json()
      if (data.imageUrl) setAvatarUrl(data.imageUrl)
      else setFailed(true)
    } catch {
      setFailed(true)
    }
  }

  const src = avatarUrl || fallbackUrl

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {src && !failed ? (
        <img
          src={src}
          alt={name || 'Player'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>🏈</span>
      )}
    </div>
  )
}