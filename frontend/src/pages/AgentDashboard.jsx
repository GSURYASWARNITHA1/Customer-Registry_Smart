import React, { useEffect, useState } from 'react';

const AgentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchComplaints = () => {
fetch('https://customer-registry-smart.onrender.com/api/complaints')
  .then(res => res.json())
      .then(data => { setComplaints(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role === 'agent') fetchComplaints();
  }, []);

  const handleMarkResolved = async (id) => {
await fetch(`https://customer-registry-smart.onrender.com/api/complaints/${id}`, {
  method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    });
    fetchComplaints();
    if (selectedComplaint && selectedComplaint._id === id) {
      setSelectedComplaint(prev => ({ ...prev, status: 'Resolved' }));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedComplaint) return;
const res = await fetch(`https://customer-registry-smart.onrender.com/api/complaints/${selectedComplaint._id}/message`, {
  method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'agent', text: chatMsg })
    });
    const updated = await res.json();
    setSelectedComplaint(updated);
    setChatMsg('');
    fetchComplaints();
  };

  if (!user || user.role !== 'agent') return <div className="page-wrapper"><h2>Agent Access Required</h2></div>;

  const statusColor = (s) => s === 'Resolved' ? 'var(--success)' : s === 'In Progress' ? '#60a5fa' : 'var(--warning)';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
      {/* Sidebar - Complaint List */}
      <div style={{ width: '380px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>All Complaints ({complaints.length})</h2>
        {loading ? <p>Loading...</p> : complaints.map(c => (
          <div
            key={c._id}
            onClick={() => setSelectedComplaint(c)}
            style={{
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '10px',
              cursor: 'pointer',
              background: selectedComplaint?._id === c._id ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedComplaint?._id === c._id ? 'var(--primary-color)' : 'var(--border-color)'}`,
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem' }}>{c.userId?.name || 'User'}</strong>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: statusColor(c.status) }}>● {c.status}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{c.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {/* Main Panel - Chat View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedComplaint ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>📋</div>
            <p>Select a complaint from the left to view and reply</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedComplaint.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  From: {selectedComplaint.userId?.name} ({selectedComplaint.userId?.email})
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: statusColor(selectedComplaint.status) }}>● {selectedComplaint.status}</span>
                {selectedComplaint.status !== 'Resolved' && (
                  <button onClick={() => handleMarkResolved(selectedComplaint._id)} className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(selectedComplaint.messages || []).map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'agent' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '65%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.from === 'agent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.from === 'agent' ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 600 }}>
                      {msg.from === 'agent' ? '🎧 Agent' : '👤 ' + (selectedComplaint.userId?.name || 'User')}
                    </div>
                    {msg.text}
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.4rem', textAlign: msg.from === 'agent' ? 'right' : 'left' }}>
                      {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={selectedComplaint.status === 'Resolved' ? 'Complaint resolved - no more replies needed' : 'Type your reply to the customer...'}
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  disabled={selectedComplaint.status === 'Resolved'}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={selectedComplaint.status === 'Resolved'}>Send</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
