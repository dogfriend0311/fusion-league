'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function FeedManager() {
  const [plays, setPlays] = useState([])
  const [games, setGames] = useState([])
  const [form, setForm] = useState({ game_id: '', player_name: '', play_text: '', yards: '', field_position: '', team: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [playsRes, gamesRes] = await Promise.all([
      supabase.from('game_feed').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('box_scores').select('game_id, home_team, away_team').order('created_at', { ascending: false })
    ])
    if (playsRes.data) setPlays(playsRes.data)
    if (gamesRes.data) setGames(gamesRes.data)
  }

  const handlePost = async () => {
    if (!form.play_text) return
    setSaving(true)
    await supabase.from('game_feed').insert([{
      ...form,
      yards: form.yards ? parseInt(form.yards) : null
    }])
    setForm({ game_id: form.game_id, player_name: '', play_text: '', yards: '', field_position: '', team: '' })
    setMessage('Play posted!')
    setSaving(false)
    fetchData()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    await supabase.from('game_feed').delete().eq('id', id)
    fetchData()
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 13px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  }

  return (
    <div>
      <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Game Feed Manager
      </h2>

      {/* Post a play */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#FFD700', fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>
          Post a Play
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>GAME</label>
            <select
              value={form.game_id}
              onChange={e => setForm({ ...form, game_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">No game selected</option>
              {games.map(g => (
                <option key={g.game_id} value={g.game_id}>{g.away_team} vs {g.home_team}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>PLAYER NAME</label>
            <input
              type="text"
              value={form.player_name}
              onChange={e => setForm({ ...form, player_name: e.target.value })}
              placeholder="e.g. John Smith"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>YARDS</label>
            <input
              type="number"
              value={form.yards}
              onChange={e => setForm({ ...form, yards: e.target.value })}
              placeholder="e.g. 12"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>FIELD POSITION</label>
            <input
              type="text"
              value={form.field_position}
              onChange={e => setForm({ ...form, field_position: e.target.value })}
              placeholder="e.g. OPP 35"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>PLAY DESCRIPTION</label>
          <textarea
            value={form.play_text}
            onChange={e => setForm({ ...form, play_text: e.target.value })}
            placeholder="e.g. rushes up the middle for a TOUCHDOWN!"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {message && (
          <p style={{ color: '#00ff88', fontSize: '13px', marginBottom: '0.75rem' }}>{message}</p>
        )}

        <button
          onClick={handlePost}
          disabled={saving || !form.play_text}
          style={{
            padding: '9px 24px',
            borderRadius: '20px',
            border: 'none',
            background: '#FFD700',
            color: '#000',
            fontWeight: '800',
            fontSize: '13px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving || !form.play_text ? 0.6 : 1
          }}
        >
          {saving ? 'Posting...' : '📡 Post Play'}
        </button>
      </div>

      {/* Recent plays */}
      <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem', letterSpacing: '1px' }}>
        RECENT PLAYS
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {plays.map(play => (
          <div key={play.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              {play.player_name && (
                <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '13px' }}>{play.player_name} </span>
              )}
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{play.play_text}</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                {play.yards !== null && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{play.yards > 0 ? '+' : ''}{play.yards} yds</span>}
                {play.field_position && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>📍{play.field_position}</span>}
              </div>
            </div>
            <button
              onClick={() => handleDelete(play.id)}
              style={{
                padding: '4px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,100,100,0.3)',
                background: 'transparent',
                color: '#ff6666',
                fontSize: '11px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}