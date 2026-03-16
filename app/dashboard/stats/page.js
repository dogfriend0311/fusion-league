'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const statTables = {
  passing: ['completions','attempts','passing_yards','touchdowns','interceptions','longest_pass','sacks','passer_rating'],
  rushing: ['carries','rushing_yards','yards_per_carry','rushing_tds','longest_run','fumbles'],
  receiving: ['receptions','targets','receiving_yards','yards_per_reception','receiving_tds','longest_reception','drops'],
  defensive: ['tackles','solo_tackles','sacks','interceptions','forced_fumbles','fumble_recoveries','passes_defended','defensive_tds','safeties'],
  kicking: ['field_goals_made','field_goals_attempted','longest_fg','extra_points_made','extra_points_attempted','punts','punt_yards','avg_punt_distance'],
}

export default function StatsManager() {
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [season, setSeason] = useState('current')
  const [activeTable, setActiveTable] = useState('passing')
  const [stats, setStats] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchPlayers() }, [])
  useEffect(() => { if (selectedPlayer) fetchStats() }, [selectedPlayer, season, activeTable])

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('id, name, team').order('name')
    if (data) setPlayers(data)
  }

  const fetchStats = async () => {
    const { data } = await supabase
      .from(`${activeTable}_stats`)
      .select('*')
      .eq('player_id', selectedPlayer)
      .eq('season', season)
      .maybeSingle()
    setStats(data || {})
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...stats, player_id: selectedPlayer, season }
    if (stats.id) {
      await supabase.from(`${activeTable}_stats`).update(payload).eq('id', stats.id)
    } else {
      await supabase.from(`${activeTable}_stats`).insert([payload])
    }
    setMessage('Stats saved!')
    setSaving(false)
    fetchStats()
    setTimeout(() => setMessage(''), 3000)
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  }

  const formatLabel = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div>
      <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Stats Editor
      </h2>

      {/* Player selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '6px' }}>
          SELECT PLAYER
        </label>
        <select
          value={selectedPlayer || ''}
          onChange={e => setSelectedPlayer(e.target.value)}
          style={{ ...inputStyle, maxWidth: '300px' }}
        >
          <option value="">-- Choose a player --</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name} {p.team ? `(${p.team})` : ''}</option>
          ))}
        </select>
      </div>

      {selectedPlayer && (
        <>
          {/* Season toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {['current', 'career'].map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                style={{
                  padding: '7px 20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,215,0,0.4)',
                  background: season === s ? '#FFD700' : 'transparent',
                  color: season === s ? '#000' : '#FFD700',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {s === 'current' ? 'Current Season' : 'Career'}
              </button>
            ))}
          </div>

          {/* Stat category tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {Object.keys(statTables).map(table => (
              <button
                key={table}
                onClick={() => setActiveTable(table)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: activeTable === table ? 'rgba(255,215,0,0.15)' : 'transparent',
                  color: activeTable === table ? '#FFD700' : 'rgba(255,255,255,0.5)',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {table}
              </button>
            ))}
          </div>

          {/* Stat fields */}
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

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {statTables[activeTable].map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>
                    {formatLabel(field)}
                  </label>
                  <input
                    type="number"
                    value={stats[field] ?? ''}
                    onChange={e => setStats({ ...stats, [field]: e.target.value })}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                marginTop: '1.5rem',
                padding: '10px 28px',
                borderRadius: '20px',
                border: 'none',
                background: '#FFD700',
                color: '#000',
                fontWeight: '800',
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Stats'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}