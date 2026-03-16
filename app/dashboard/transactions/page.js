'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const emptyTx = { type: 'Signing', player_name: '', team_from: '', team_to: '', notes: '' }

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyTx)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchTransactions() }, [])

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
    if (data) setTransactions(data)
  }

  const handlePost = async () => {
    setSaving(true)
    await supabase.from('transactions').insert([form])
    setForm(emptyTx)
    setMessage('Transaction posted!')
    setSaving(false)
    fetchTransactions()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  const typeColors = {
    Signing: '#00ff88', Trade: '#378ADD',
    Promotion: '#AFA9EC', Release: '#ff6666', Other: 'rgba(255,255,255,0.5)'
  }

  const inputStyle = {
    width: '100%', padding: '9px 13px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white', fontSize: '14px', outline: 'none'
  }

  return (
    <div>
      <h2 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Transactions Manager
      </h2>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(204,0,0,0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: '#CC0000', fontSize: '14px', fontWeight: '700', marginBottom: '1rem' }}>Post Transaction</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>TYPE</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
              {['Signing','Trade','Promotion','Release','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>PLAYER NAME</label>
            <input type="text" value={form.player_name} onChange={e => setForm({...form, player_name: e.target.value})} placeholder="e.g. John Smith" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>FROM TEAM</label>
            <input type="text" value={form.team_from} onChange={e => setForm({...form, team_from: e.target.value})} placeholder="Previous team (trades)" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>TO TEAM</label>
            <input type="text" value={form.team_to} onChange={e => setForm({...form, team_to: e.target.value})} placeholder="New team" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>NOTES</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any additional details..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {message && <p style={{ color: '#00ff88', fontSize: '13px', marginBottom: '0.75rem' }}>{message}</p>}

        <button onClick={handlePost} disabled={saving || !form.player_name} style={{ padding: '9px 24px', borderRadius: '20px', border: 'none', background: '#CC0000', color: '#000', fontWeight: '800', fontSize: '13px', cursor: 'pointer', opacity: !form.player_name ? 0.6 : 1 }}>
          {saving ? 'Posting...' : 'Post Transaction'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {transactions.map(tx => (
          <div key={tx.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${typeColors[tx.type] || 'rgba(255,255,255,0.2)'}`, borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: typeColors[tx.type], fontWeight: '700', marginRight: '8px' }}>{tx.type}</span>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{tx.player_name}</span>
              {tx.team_to && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}> → {tx.team_to}</span>}
              {tx.notes && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>{tx.notes}</p>}
            </div>
            <button onClick={() => handleDelete(tx.id)} style={{ padding: '4px 12px', borderRadius: '10px', border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#ff6666', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}