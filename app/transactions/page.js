'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTransactions(data)
    setLoading(false)
  }

  const types = ['All', 'Signing', 'Trade', 'Promotion', 'Release', 'Other']

  const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'signing':
        return { bg: 'rgba(0,255,136,0.1)', color: '#00ff88', border: 'rgba(0,255,136,0.3)' }
      case 'trade':
        return { bg: 'rgba(55,138,221,0.1)', color: '#378ADD', border: 'rgba(55,138,221,0.3)' }
      case 'promotion':
        return { bg: 'rgba(127,119,221,0.1)', color: '#AFA9EC', border: 'rgba(127,119,221,0.3)' }
      case 'release':
        return { bg: 'rgba(255,68,68,0.1)', color: '#ff6666', border: 'rgba(255,68,68,0.3)' }
      default:
        return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.15)' }
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'signing': return '✍️'
      case 'trade': return '🔄'
      case 'promotion': return '⬆️'
      case 'release': return '🚪'
      default: return '📋'
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filtered = filter === 'All'
    ? transactions
    : transactions.filter(t => t.type?.toLowerCase() === filter.toLowerCase())

  return (
    <main style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#FFD700',
            letterSpacing: '2px'
          }}>
            TRANSACTIONS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            Latest league moves and signings
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {types.map(type => {
            const style = getTypeStyle(type)
            const isActive = filter === type
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '50px',
                  border: `1px solid ${isActive ? style.border : 'rgba(255,255,255,0.15)'}`,
                  background: isActive ? style.bg : 'transparent',
                  color: isActive ? style.color : 'rgba(255,255,255,0.5)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {type !== 'All' && getTypeIcon(type)} {type}
              </button>
            )
          })}
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {['Signing', 'Trade', 'Promotion', 'Release'].map(type => {
            const count = transactions.filter(t => t.type?.toLowerCase() === type.toLowerCase()).length
            const style = getTypeStyle(type)
            return (
              <div key={type} style={{
                flex: 1,
                minWidth: '100px',
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '22px', fontWeight: '800', color: style.color }}>{count}</p>
                <p style={{ fontSize: '11px', color: style.color, opacity: 0.8, marginTop: '2px' }}>{type}s</p>
              </div>
            )
          })}
        </div>

        {/* Transactions list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'rgba(255,255,255,0.3)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px'
          }}>
            No {filter !== 'All' ? filter.toLowerCase() + 's' : 'transactions'} yet.
            <br />
            <span style={{ fontSize: '13px', marginTop: '8px', display: 'block' }}>
              Add them from the Owner Dashboard.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((transaction, index) => {
              const style = getTypeStyle(transaction.type)
              return (
                <div
                  key={transaction.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${style.border}`,
                    borderLeft: `3px solid ${style.color}`,
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    {/* Left side */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: style.bg,
                          color: style.color,
                          border: `1px solid ${style.border}`,
                          letterSpacing: '1px',
                          textTransform: 'uppercase'
                        }}>
                          {getTypeIcon(transaction.type)} {transaction.type}
                        </span>
                      </div>

                      {/* Player name */}
                      {transaction.player_name && (
                        <p style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'white',
                          marginBottom: '6px'
                        }}>
                          <Link
                            href={`/members`}
                            style={{
                              color: '#FFD700',
                              textDecoration: 'underline',
                              textDecorationColor: 'rgba(255,215,0,0.3)'
                            }}
                          >
                            {transaction.player_name}
                          </Link>
                        </p>
                      )}

                      {/* Trade arrow */}
                      {transaction.team_from && transaction.team_to && (
                        <p style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.6)',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ color: '#ff6666' }}>{transaction.team_from}</span>
                          <span>→</span>
                          <span style={{ color: '#00ff88' }}>{transaction.team_to}</span>
                        </p>
                      )}

                      {/* Team only (signing) */}
                      {transaction.team_to && !transaction.team_from && (
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                          Signed to <span style={{ color: '#00ff88', fontWeight: '600' }}>{transaction.team_to}</span>
                        </p>
                      )}

                      {/* Notes */}
                      {transaction.notes && (
                        <p style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: '1.5',
                          fontStyle: 'italic'
                        }}>
                          "{transaction.notes}"
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.3)',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}>
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}