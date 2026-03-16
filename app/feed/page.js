'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function FeedPage() {
  const [plays, setPlays] = useState([])
  const [boxScores, setBoxScores] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    subscribeToFeed()
  }, [])

  const fetchData = async () => {
    const [playsRes, boxRes] = await Promise.all([
      supabase
        .from('game_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('box_scores')
        .select('*')
        .order('created_at', { ascending: false })
    ])
    if (playsRes.data) setPlays(playsRes.data)
    if (boxRes.data) {
      setBoxScores(boxRes.data)
      if (boxRes.data.length > 0) setSelectedGame(boxRes.data[0].game_id)
    }
    setLoading(false)
  }

  // Real-time subscription — new plays appear instantly
  const subscribeToFeed = () => {
    const channel = supabase
      .channel('game_feed_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_feed'
      }, payload => {
        setPlays(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  const getPlayIcon = (playText) => {
    const text = playText?.toLowerCase() || ''
    if (text.includes('touchdown') || text.includes('td')) return '🏈'
    if (text.includes('interception')) return '🚨'
    if (text.includes('fumble')) return '💥'
    if (text.includes('field goal')) return '🎯'
    if (text.includes('sack')) return '💪'
    if (text.includes('punt')) return '👟'
    if (text.includes('penalty')) return '🚩'
    return '▶'
  }

  const getPlayColor = (playText) => {
    const text = playText?.toLowerCase() || ''
    if (text.includes('touchdown') || text.includes('td')) return '#00ff88'
    if (text.includes('interception')) return '#ff4444'
    if (text.includes('fumble')) return '#ff8800'
    if (text.includes('field goal')) return '#CC0000'
    if (text.includes('sack')) return '#ff6666'
    return 'rgba(255,255,255,0.9)'
  }

  const linkifyPlayers = (text, playerId) => {
    if (!text) return text
    return text
  }

  const filteredPlays = selectedGame
    ? plays.filter(p => p.game_id === selectedGame)
    : plays

  const selectedBox = boxScores.find(b => b.game_id === selectedGame)

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#CC0000',
            letterSpacing: '2px'
          }}>
            GAME FEED
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            Live play-by-play updates
          </p>
        </div>

        {/* Game selector */}
        {boxScores.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            {boxScores.map(game => (
              <button
                key={game.game_id}
                onClick={() => setSelectedGame(game.game_id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '50px',
                  border: '1px solid rgba(204,0,0,0.4)',
                  background: selectedGame === game.game_id ? '#CC0000' : 'rgba(204,0,0,0.08)',
                  color: selectedGame === game.game_id ? '#000' : '#CC0000',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {game.away_team} vs {game.home_team}
              </button>
            ))}
          </div>
        )}

        {/* Box score */}
        {selectedBox && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(204,0,0,0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(8px)',
            overflowX: 'auto'
          }}>
            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
                {selectedBox.away_team} vs {selectedBox.home_team}
              </h2>
              <span style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: '700',
                background: selectedBox.status === 'live'
                  ? 'rgba(0,255,100,0.15)'
                  : selectedBox.status === 'final'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(204,0,0,0.1)',
                color: selectedBox.status === 'live'
                  ? '#00ff88'
                  : selectedBox.status === 'final'
                  ? 'rgba(255,255,255,0.6)'
                  : '#CC0000',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {selectedBox.status === 'live' ? '🔴 LIVE' : selectedBox.status === 'final' ? 'Final' : 'Upcoming'}
              </span>
            </div>

            {/* Score table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '12px' }}>Team</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '12px' }}>Q1</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '12px' }}>Q2</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '12px' }}>Q3</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '12px' }}>Q4</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: '#CC0000', fontWeight: '700', fontSize: '14px' }}>T</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: selectedBox.away_team, q1: selectedBox.away_q1, q2: selectedBox.away_q2, q3: selectedBox.away_q3, q4: selectedBox.away_q4, total: selectedBox.away_total },
                  { name: selectedBox.home_team, q1: selectedBox.home_q1, q2: selectedBox.home_q2, q3: selectedBox.home_q3, q4: selectedBox.home_q4, total: selectedBox.home_total }
                ].map((team, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'white' }}>{team.name}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{team.q1}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{team.q2}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{team.q3}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{team.q4}</td>
                    <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: '800', fontSize: '18px', color: '#CC0000' }}>{team.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Play by play feed */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 8px #00ff88'
            }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>
              PLAY BY PLAY
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              Loading feed...
            </div>
          ) : filteredPlays.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No plays yet. Updates will appear here live during the game.
            </div>
          ) : (
            <div>
              {filteredPlays.map((play, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < filteredPlays.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'flex',
                    gap: '12px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                    {getPlayIcon(play.play_description)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: getPlayColor(play.play_description) }}>
                        {play.play_description}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(play.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}