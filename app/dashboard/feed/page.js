'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function FeedPage() {
  const [plays, setPlays] = useState([])
  const [boxScores, setBoxScores] = useState([])
  const [selectedGame, setSelectedGame] = useState('all')
  const [loading, setLoading] = useState(true)
  const playsRef = useRef([])

  useEffect(() => {
    fetchData()
    const unsub = subscribeToFeed()
    return () => unsub()
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
    if (playsRes.data) {
      setPlays(playsRes.data)
      playsRef.current = playsRes.data
    }
    if (boxRes.data) setBoxScores(boxRes.data)
    setLoading(false)
  }

  const subscribeToFeed = () => {
    const channel = supabase
      .channel('realtime-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_feed' },
        () => {
          // Re-fetch all plays when anything changes
          fetchData()
        }
      )
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

  const filteredPlays = selectedGame === 'all'
    ? plays
    : plays.filter(p => p.game_id === selectedGame)

  const selectedBox = boxScores.find(b => b.game_id === selectedGame)

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

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
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setSelectedGame('all')}
            style={{
              padding: '8px 20px',
              borderRadius: '50px',
              border: '1px solid rgba(204,0,0,0.4)',
              background: selectedGame === 'all' ? '#CC0000' : 'rgba(204,0,0,0.08)',
              color: selectedGame === 'all' ? '#fff' : '#CC0000',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All Plays
          </button>
          {boxScores.map(game => (
            <button
              key={game.game_id}
              onClick={() => setSelectedGame(game.game_id)}
              style={{
                padding: '8px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(204,0,0,0.4)',
                background: selectedGame === game.game_id ? '#CC0000' : 'rgba(204,0,0,0.08)',
                color: selectedGame === game.game_id ? '#fff' : '#CC0000',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
                {selectedBox.away_team} vs {selectedBox.home_team}
              </h2>
              <span style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: '700',
                background: selectedBox.status === 'live' ? 'rgba(0,255,100,0.15)' : selectedBox.status === 'final' ? 'rgba(255,255,255,0.1)' : 'rgba(204,0,0,0.1)',
                color: selectedBox.status === 'live' ? '#00ff88' : selectedBox.status === 'final' ? 'rgba(255,255,255,0.6)' : '#CC0000',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {selectedBox.status === 'live' ? '🔴 LIVE' : selectedBox.status === 'final' ? 'Final' : 'Upcoming'}
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  {['Team','Q1','Q2','Q3','Q4','T'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Team' ? 'left' : 'center', padding: '8px 12px', color: h === 'T' ? '#CC0000' : 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: h === 'T' ? '14px' : '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: selectedBox.away_team, q1: selectedBox.away_q1, q2: selectedBox.away_q2, q3: selectedBox.away_q3, q4: selectedBox.away_q4, total: selectedBox.away_total },
                  { name: selectedBox.home_team, q1: selectedBox.home_q1, q2: selectedBox.home_q2, q3: selectedBox.home_q3, q4: selectedBox.home_q4, total: selectedBox.home_total }
                ].map((team, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'white' }}>{team.name}</td>
                    {[team.q1, team.q2, team.q3, team.q4].map((q, j) => (
                      <td key={j} style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{q}</td>
                    ))}
                    <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: '800', fontSize: '18px', color: '#CC0000' }}>{team.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Play by play */}
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
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>
              PLAY BY PLAY
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
              {filteredPlays.length} plays
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading feed...</div>
          ) : filteredPlays.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No plays yet. Updates will appear here live during the game.
            </div>
          ) : (
            <div>
              {filteredPlays.map((play, index) => (
                <div
                  key={play.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    background: index === 0 ? 'rgba(204,0,0,0.03)' : 'transparent'
                  }}
                >
                  <div style={{ fontSize: '18px', marginTop: '2px', flexShrink: 0 }}>
                    {getPlayIcon(play.play_text)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '14px',
                      color: getPlayColor(play.play_text),
                      lineHeight: '1.5',
                      fontWeight: play.play_text?.toLowerCase().includes('touchdown') ? '700' : '400'
                    }}>
                      {play.player_name ? (
                        <>
                          <Link href="/members" style={{ color: '#CC0000', fontWeight: '700', textDecoration: 'underline', textDecorationColor: 'rgba(204,0,0,0.3)' }}>
                            {play.player_name}
                          </Link>
                          {' '}{play.play_text}
                        </>
                      ) : play.play_text}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {play.yards != null && (
                        <span style={{ fontSize: '12px', color: play.yards > 0 ? '#00ff88' : '#ff6666', fontWeight: '600' }}>
                          {play.yards > 0 ? '+' : ''}{play.yards} yds
                        </span>
                      )}
                      {play.field_position && (
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📍 {play.field_position}</span>
                      )}
                      {play.team && (
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{play.team}</span>
                      )}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                        {new Date(play.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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