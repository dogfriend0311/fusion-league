'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import RobloxAvatar from '../components/RobloxAvatar'

export default function MembersPage() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name')
    if (data) {
      setPlayers(data)
      const uniqueTeams = [...new Set(data.map(p => p.team).filter(Boolean))]
      setTeams(uniqueTeams)
    }
    setLoading(false)
  }

  const filtered = selectedTeam === 'All'
    ? players
    : players.filter(p => p.team === selectedTeam)

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#CC0000',
            letterSpacing: '2px'
          }}>
            MEMBERS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            {players.length} players across {teams.length} teams
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2.5rem'
        }}>
          {['All', ...teams].map(team => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              style={{
                padding: '8px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(204,0,0,0.4)',
                background: selectedTeam === team ? '#CC0000' : 'rgba(204,0,0,0.08)',
                color: selectedTeam === team ? '#000' : '#CC0000',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {team}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            Loading players...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            No players found. Add some from the Owner Dashboard!
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {filtered.map(player => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(204,0,0,0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid rgba(255,215,0,0.6)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.background = 'rgba(204,0,0,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(204,0,0,0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{
                    margin: '0 auto 1rem',
                    border: '2px solid rgba(204,0,0,0.4)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    overflow: 'hidden'
                  }}>
                    <RobloxAvatar
                      robloxId={player.roblox_id}
                      fallbackUrl={player.photo_url}
                      name={player.name}
                      size={80}
                    />
                  </div>

                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    {player.name}
                  </h3>

                  {player.team && (
                    <span style={{
                      fontSize: '11px',
                      color: '#CC0000',
                      background: 'rgba(204,0,0,0.1)',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      display: 'inline-block',
                      marginBottom: '4px'
                    }}>
                      {player.team}
                    </span>
                  )}

                  {player.positions && (
                    <p style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '4px'
                    }}>
                      {player.positions}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}