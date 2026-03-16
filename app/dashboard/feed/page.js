'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function FeedManager() {
  const [plays, setPlays] = useState([])
  const [games, setGames] = useState([])
  const [form, setForm] = useState({
    game_id: '',
    player_name: '',
    play_text: '',
    yards: '',
    field_position: '',
    team: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: playsData, error: playsError } = await supabase
      .from('game_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: gamesData } = await supabase
      .from('box_scores')
      .select('game_id, home_team, away_team')
      .order('created_at', { ascending: false })

    if (playsError) setError('Error loading plays: ' + playsError.message)
    if (playsData) setPlays(playsData)
    if (gamesData) setGames(gamesData)
  }

  const handlePost = async () => {
    if (!form.play_text.trim()) {
      setError('Play description is required')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      play_text: form.play_text.trim(),
      player_name: form.player_name.trim() || null,
      game_id: form.game_id || null,
      yards: form.yards !== '' ? parseInt(form.yards) : null,
      field_position: form.field_position.trim() || null,
      team: form.team.trim() || null,
    }

    const { error: insertError } = await supabase
      .from('game_feed')
      .insert([payload])

    if (insertError) {
      setError('Failed to post play: ' + insertError.message)
    } else {
      setMessage('Play posted!')
      setForm(prev => ({
        ...prev,
        player_name: '',
        play_text: '',
        yards: '',
        field_position: '',
        team: ''
      }))
      fetchData()
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('game_feed').delete().eq('id', id)
    if (error) setError('Delete failed: ' + error.message)
    else fetchData()
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

      {error && (
        <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6666', fontSize: '13px', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontSize: '13px', marginBottom: '1rem' }}>
          ✅ {message}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(204,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: '#CC0000', fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>
          Post a Play
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
              GAME (optional)
            </label>
            <select
              value={form.game_id}
              onChange={e => setForm({ ...form, game_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">No game selected</option>
              {games.map(g => (
                <option key={g.game_id} value={g.game_id}>
                  {g.away_team} vs {g.home_team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
              PLAYER NAME (optional)
            </label>
            <input
              type="text"
              value={form.player_name}
              onChange={e => setForm({ ...form, player_name: e.target.value })}
              placeholder="e.g. John Smith"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
              YARDS (optional)
            </label>
            <input
              type="number"
              value={form.yards}
              onChange={e => setForm({ ...form, yards: e.target.value })}
              placeholder="e.g. 12"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
              FIELD POSITION (optional)
            </label>
            <input
              type="text"
              value={form.field_position}
              onChange={e => setForm({ ...form, field_position: e.target.value })}
              placeholder="e.g. OPP 35"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>
            PLAY DESCRIPTION ✱
          </label>
          <textarea
            value={form.play_text}
            onChange={e => setForm({ ...form, play_text: e.target.value })}
            placeholder="e.g. rushes up the middle for a TOUCHDOWN!"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button
          onClick={handlePost}
          disabled={saving || !form.play_text.trim()}
          style={{
            padding: '10px 28px',
            borderRadius: '20px',
            border: 'none',
            background: saving || !form.play_text.trim() ? 'rgba(204,0,0,0.4)' : '#CC0000',
            color: 'white',
            fontWeight: '800',
            fontSize: '14px',
            cursor: saving || !form.play_text.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {saving ? 'Posting...' : '📡 Post Play'}
        </button>
      </div>

      <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '0.75rem', letterSpacing: '1px' }}>
        RECENT PLAYS ({plays.length})
      </h3>

      {plays.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No plays yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {plays.map(play => (
            <div key={play.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                {play.player_name && (
                  <span style={{ color: '#CC0000', fontWeight: '700', fontSize: '13px' }}>
                    {play.player_name}{' '}
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  {play.play_text}
                </span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {play.yards != null && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      {play.yards > 0 ? '+' : ''}{play.yards} yds
                    </span>
                  )}
                  {play.field_position && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      📍 {play.field_position}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                    {new Date(play.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
      )}
    </div>
  )
}