'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const emptyPlayer = {
  name: '', team: '', positions: '', bio: '',
  roblox_id: '', song_url: '', photo_url: ''
}

export default function PlayersManager() {
  const [players, setPlayers] = useState([])
  const [form, setForm] = useState(emptyPlayer)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPlayers() }, [])

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('name')
    if (data) setPlayers(data)
  }

  const handleSave = async () => {
    setSaving(true)
    if (editingId) {
      await supabase.from('players').update(form).eq('id', editingId)
      setMessage('Player updated!')
    } else {
      await supabase.from('players').insert([form])
      setMessage('Player added!')
    }
    setForm(emptyPlayer)
    setEditingId(null)
    setShowForm(false)
    setSaving(false)
    fetchPlayers()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleEdit = (player) => {
    setForm({
      name: player.name || '',
      team: player.team || '',
      positions: player.positions || '',
      bio: player.bio || '',
      roblox_id: player.roblox_id || '',
      song_url: player.song_url || '',
      photo_url: player.photo_url || ''
    })
    setEditingId(player.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this player? This cannot be undone.')) return
    await supabase.from('players').delete().eq('id', id)
    setMessage('Player deleted.')
    fetchPlayers()
    setTimeout(() => setMessage(''), 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    marginTop: '4px'
  }

  const labelStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700' }}>Players</h2>
        <button
          onClick={() => { setForm(emptyPlayer); setEditingId(null); setShowForm(!showForm) }}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px solid rgba(204,0,0,0.4)',
            background: showForm ? 'rgba(255,100,100,0.1)' : 'rgba(204,0,0,0.1)',
            color: showForm ? '#ff6666' : '#CC0000',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Player'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(0,255,136,0.1)',
          border: '1px solid rgba(0,255,136,0.3)',
          color: '#00ff88',
          fontSize: '13px',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(204,0,0,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#CC0000', marginBottom: '1.25rem', fontSize: '14px', fontWeight: '700' }}>
            {editingId ? 'Edit Player' : 'New Player'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { key: 'name', label: 'Player Name', placeholder: 'e.g. John Smith' },
              { key: 'team', label: 'Team', placeholder: 'e.g. Blue Eagles' },
              { key: 'positions', label: 'Positions', placeholder: 'e.g. QB, WR' },
              { key: 'roblox_id', label: 'Roblox User ID', placeholder: 'e.g. 123456789' },
              { key: 'song_url', label: 'Song URL (Spotify embed)', placeholder: 'https://open.spotify.com/embed/track/...' },
              { key: 'photo_url', label: 'Photo URL (fallback)', placeholder: 'https://...' },
            ].map(field => (
              <div key={field.key}>
                <label style={labelStyle}>{field.label}</label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Write a short bio for this player..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            style={{
              marginTop: '1.25rem',
              padding: '10px 28px',
              borderRadius: '20px',
              border: 'none',
              background: '#CC0000',
              color: '#000',
              fontWeight: '800',
              fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving || !form.name ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Player'}
          </button>
        </div>
      )}

      {/* Players list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {players.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem' }}>
            No players yet. Add your first one above!
          </p>
        ) : players.map(player => (
          <div key={player.id} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {player.roblox_id && (
                <img
                  src={`https://www.roblox.com/headshot-thumbnail/image?userId=${player.roblox_id}&width=420&height=420&format=png`}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(204,0,0,0.3)' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <div>
                <p style={{ fontWeight: '700', color: 'white', fontSize: '15px' }}>{player.name}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {player.team || 'No team'} {player.positions ? `· ${player.positions}` : ''}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleEdit(player)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(204,0,0,0.3)',
                  background: 'transparent',
                  color: '#CC0000',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(player.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,100,100,0.3)',
                  background: 'transparent',
                  color: '#ff6666',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}