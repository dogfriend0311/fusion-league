'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PhotosManager() {
  const [photos, setPhotos] = useState([])
  const [url, setUrl] = useState('')
  const [order, setOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    const { data } = await supabase.from('home_photos').select('*').order('display_order')
    if (data) setPhotos(data)
  }

  const handleAdd = async () => {
    if (!url) return
    setSaving(true)
    await supabase.from('home_photos').insert([{ photo_url: url, display_order: order }])
    setUrl('')
    setOrder(0)
    setMessage('Photo added!')
    setSaving(false)
    fetchPhotos()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    await supabase.from('home_photos').delete().eq('id', id)
    fetchPhotos()
  }

  const inputStyle = {
    padding: '9px 13px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white', fontSize: '14px', outline: 'none'
  }

  return (
    <div>
      <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Home Page Photos
      </h2>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: '#FFD700', fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>Add Photo</h3>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
          Paste a direct image URL. You can upload images to Supabase Storage → player-photos bucket and copy the public URL.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>IMAGE URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>ORDER</label>
            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={{ ...inputStyle, width: '80px' }} />
          </div>
          <button onClick={handleAdd} disabled={saving || !url} style={{ padding: '9px 24px', borderRadius: '20px', border: 'none', background: '#FFD700', color: '#000', fontWeight: '800', fontSize: '13px', cursor: 'pointer', opacity: !url ? 0.6 : 1 }}>
            Add Photo
          </button>
        </div>
        {message && <p style={{ color: '#00ff88', fontSize: '13px', marginTop: '0.75rem' }}>{message}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {photos.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
            No photos yet. Add your first one above!
          </p>
        ) : photos.map(photo => (
          <div key={photo.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={photo.photo_url} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.background = '#333'} />
            <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Order: {photo.display_order}</span>
              <button onClick={() => handleDelete(photo.id)} style={{ padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#ff6666', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}