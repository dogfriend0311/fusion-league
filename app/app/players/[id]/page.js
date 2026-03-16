'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PlayerPage() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [passing, setPassing] = useState(null)
  const [rushing, setRushing] = useState(null)
  const [receiving, setReceiving] = useState(null)
  const [defensive, setDefensive] = useState(null)
  const [kicking, setKicking] = useState(null)
  const [awards, setAwards] = useState([])
  const [photos, setPhotos] = useState([])
  const [season, setSeason] = useState('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [id, season])

  const fetchAll = async () => {
    const [p, ps, rs, rec, def, k, aw, ph] = await Promise.all([
      supabase.from('players').select('*').eq('id', id).single(),
      supabase.from('passing_stats').select('*').eq('player_id', id).eq('season', season).single(),
      supabase.from('rushing_stats').select('*').eq('player_id', id).eq('season', season).single(),
      supabase.from('receiving_stats').select('*').eq('player_id', id).eq('season', season).single(),
      supabase.from('defensive_stats').select('*').eq('player_id', id).eq('season', season).single(),
      supabase.from('kicking_stats').select('*').eq('player_id', id).eq('season', season).single(),
      supabase.from('awards').select('*').eq('player_id', id).order('created_at', { ascending: false }),
      supabase.from('performance_photos').select('*').eq('player_id', id).order('created_at', { ascending: false })
    ])
    setPlayer(p.data)
    setPassing(ps.data)
    setRushing(rs.data)
    setReceiving(rec.data)
    setDefensive(def.data)
    setKicking(k.data)
    setAwards(aw.data || [])
    setPhotos(ph.data || [])
    setLoading(false)
  }

  const getRobloxAvatar = (robloxId) =>
    `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=420&height=420&format=png`

  const StatRow = ({ label, value }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontSize: '14px'
    }}>
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <span style={{ fontWeight: '600', color: 'white' }}>{value ?? '—'}</span>
    </div>
  )

  const StatCard = ({ title, children }) => (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: '12px',
      padding: '1.25rem',
      backdropFilter: 'blur(8px)'
    }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#CC0000',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '0.75rem'
      }}>{title}</h3>
      {children}
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading player...</p>
    </div>
  )

  if (!player) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Player not found.</p>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Profile header */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Avatar */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgba(255,215,0,0.5)',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.1)'
        }}>
          {player.roblox_id ? (
            <img
              src={getRobloxAvatar(player.roblox_id)}
              alt={player.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : player.photo_url ? (
            <img
              src={player.photo_url}
              alt={player.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '48px'
            }}>🏈</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '900',
            color: 'white',
            letterSpacing: '1px'
          }}>{player.name}</h1>

          {player.team && (
            <span style={{
              fontSize: '13px',
              color: '#CC0000',
              background: 'rgba(204,0,0,0.1)',
              padding: '3px 12px',
              borderRadius: '20px',
              display: 'inline-block',
              marginTop: '6px'
            }}>{player.team}</span>
          )}

          {player.positions && (
            <p style={{
              marginTop: '8px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)'
            }}>📍 {player.positions}</p>
          )}

          {player.bio && (
            <p style={{
              marginTop: '12px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.6',
              maxWidth: '500px'
            }}>{player.bio}</p>
          )}

          {/* Song */}
          {player.song_url && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
                🎵 Player's Song
              </p>
              <iframe
                src={player.song_url}
                width="300"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ borderRadius: '8px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Season toggle */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {['current', 'career'].map(s => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            style={{
              padding: '8px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(204,0,0,0.4)',
              background: season === s ? '#CC0000' : 'transparent',
              color: season === s ? '#000' : '#CC0000',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            {s === 'current' ? 'Current Season' : 'Career Stats'}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {passing && (
          <StatCard title="Passing">
            <StatRow label="Completions" value={passing.completions} />
            <StatRow label="Attempts" value={passing.attempts} />
            <StatRow label="Passing Yards" value={passing.passing_yards} />
            <StatRow label="Touchdowns" value={passing.touchdowns} />
            <StatRow label="Interceptions" value={passing.interceptions} />
            <StatRow label="Longest Pass" value={passing.longest_pass} />
            <StatRow label="Sacks Taken" value={passing.sacks} />
            <StatRow label="Passer Rating" value={passing.passer_rating} />
          </StatCard>
        )}

        {rushing && (
          <StatCard title="Rushing">
            <StatRow label="Carries" value={rushing.carries} />
            <StatRow label="Rushing Yards" value={rushing.rushing_yards} />
            <StatRow label="Yards Per Carry" value={rushing.yards_per_carry} />
            <StatRow label="Touchdowns" value={rushing.rushing_tds} />
            <StatRow label="Longest Run" value={rushing.longest_run} />
            <StatRow label="Fumbles" value={rushing.fumbles} />
          </StatCard>
        )}

        {receiving && (
          <StatCard title="Receiving">
            <StatRow label="Receptions" value={receiving.receptions} />
            <StatRow label="Targets" value={receiving.targets} />
            <StatRow label="Receiving Yards" value={receiving.receiving_yards} />
            <StatRow label="Yards Per Reception" value={receiving.yards_per_reception} />
            <StatRow label="Touchdowns" value={receiving.receiving_tds} />
            <StatRow label="Longest Reception" value={receiving.longest_reception} />
            <StatRow label="Drops" value={receiving.drops} />
          </StatCard>
        )}

        {defensive && (
          <StatCard title="Defense">
            <StatRow label="Tackles" value={defensive.tackles} />
            <StatRow label="Solo Tackles" value={defensive.solo_tackles} />
            <StatRow label="Sacks" value={defensive.sacks} />
            <StatRow label="Interceptions" value={defensive.interceptions} />
            <StatRow label="Forced Fumbles" value={defensive.forced_fumbles} />
            <StatRow label="Fumble Recoveries" value={defensive.fumble_recoveries} />
            <StatRow label="Passes Defended" value={defensive.passes_defended} />
            <StatRow label="Defensive TDs" value={defensive.defensive_tds} />
            <StatRow label="Safeties" value={defensive.safeties} />
          </StatCard>
        )}

        {kicking && (
          <StatCard title="Kicking">
            <StatRow label="FG Made" value={kicking.field_goals_made} />
            <StatRow label="FG Attempted" value={kicking.field_goals_attempted} />
            <StatRow label="Longest FG" value={kicking.longest_fg} />
            <StatRow label="XP Made" value={kicking.extra_points_made} />
            <StatRow label="XP Attempted" value={kicking.extra_points_attempted} />
            <StatRow label="Punts" value={kicking.punts} />
            <StatRow label="Punt Yards" value={kicking.punt_yards} />
            <StatRow label="Avg Punt Distance" value={kicking.avg_punt_distance} />
          </StatCard>
        )}
      </div>

      {/* Awards */}
      {awards.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#CC0000',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>🏆 Awards</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {awards.map(award => (
              <div key={award.id} style={{
                background: 'rgba(204,0,0,0.08)',
                border: '1px solid rgba(204,0,0,0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                minWidth: '180px'
              }}>
                <p style={{ fontWeight: '700', color: '#CC0000', fontSize: '14px' }}>
                  {award.title}
                </p>
                {award.season && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                    {award.season}
                  </p>
                )}
                {award.description && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
                    {award.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance photos */}
      {photos.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#CC0000',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>📸 Top Performances</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            {photos.map(photo => (
              <div key={photo.id} style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(204,0,0,0.2)',
                aspectRatio: '16/9',
                background: 'rgba(0,0,0,0.3)'
              }}>
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Performance'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}