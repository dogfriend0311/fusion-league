'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const emptyGame = {
  game_id: '', home_team: '', away_team: '',
  home_q1: 0, home_q2: 0, home_q3: 0, home_q4: 0,
  away_q1: 0, away_q2: 0, away_q3: 0, away_q4: 0,
  home_total: 0, away_total: 0, status: 'upcoming'
}

export default function BoxScoresManager() {
  const [games, setGames] = useState([])
  const [form, setForm] = useState(emptyGame)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchGames() }, [])

  const fetchGames = async () => {
    const { data } = await supabase.from('box_scores').select('*').order('created_at', { ascending: false })
    if (data) setGames(data)
  }

  const calcTotals = (f) => ({
    ...f,
    home_total: Number(f.home_q1||0) + Number(f.home_q2||0) + Number(f.home_q3||0) + Number(f.home_q4||0),
    away_total: Number(f.away_q1||0) + Number(f.away_q2||0) + Number(f.away_q3||0) + Number(f.away_q4||0),
  })

  const handleSave = async () => {
    setSaving(true)
    const payload = calcTotals(form)
    if (editingId) {
      await supabase.from('box_scores').update(payload).eq('id', editingId)
    } else {
      await supabase.from('box_scores').insert([payload])
    }
    setMessage('Box score saved!')
    setForm(emptyGame)
    setEditingId(null)
    setShowForm(false)
    setSaving(false)
    fetchGames()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleEdit = (game) => {
    setForm(game)
    setEditingId(game.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this game?')) return
    await supabase.from('box_scores').delete().eq('id', id)
    fetchGames()
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'center'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700' }}>Box Scores</h2>
        <button
          onClick={() => { setForm(emptyGame); setEditingId(null); setShowForm(!showForm) }}
          style={{
            padding: '8px 20px', borderRadius: '20px',
            border: '1px solid rgba(255,215,0,0.4)',
            background: showForm ? 'rgba(255,100,100,0.1)' : 'rgba(255,215,0,0.1)',
            color: showForm ? '#ff6666' : '#FFD700',
            fontWeight: '600', fontSize: '13px', cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ New Game'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontSize: '13px', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>GAME ID</label>
              <input type="text" value={form.game_id} onChange={e => setForm({...form, game_id: e.target.value})} placeholder="e.g. week1-game1" style={{...inputStyle, textAlign: 'left'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>HOME TEAM</label>
              <input type="text" value={form.home_team} onChange={e => setForm({...form, home_team: e.target.value})} placeholder="Home team" style={{...inputStyle, textAlign: 'left'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>AWAY TEAM</label>
              <input type="text" value={form.away_team} onChange={e => setForm({...form, away_team: e.target.value})} placeholder="Away team" style={{...inputStyle, textAlign: 'left'}} />
            </div>
          </div>

          {[{label: 'HOME', prefix: 'home'}, {label: 'AWAY', prefix: 'away'}].map(row => (
            <div key={row.prefix} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '700' }}>{row.label}</span>
              {['q1','q2','q3','q4'].map(q => (
                <div key={q}>
                  <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '2px', textAlign: 'center' }}>{q.toUpperCase()}</label>
                  <input type="number" value={form[`${row.prefix}_${q}`]} onChange={e => setForm({...form, [`${row.prefix}_${q}`]: e.target.value})} style={inputStyle} />
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>STATUS</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{...inputStyle, textAlign: 'left', maxWidth: '200px'}}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="final">Final</option>
            </select>
          </div>

          <button onClick={handleSave} disabled={saving} style={{ marginTop: '1rem', padding: '9px 24px', borderRadius: '20px', border: 'none', background: '#FFD700', color: '#000', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Game'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {games.map(game => (
          <div key={game.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: '700', color: 'white' }}>{game.away_team} vs {game.home_team}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                {game.away_total} – {game.home_total} · <span style={{ textTransform: 'capitalize' }}>{game.status}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(game)} style={{ padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)', background: 'transparent', color: '#FFD700', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(game.id)} style={{ padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#ff6666', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}