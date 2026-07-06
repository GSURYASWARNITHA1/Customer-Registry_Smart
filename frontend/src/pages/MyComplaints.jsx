import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchComplaints = () => {
    if (user && user._id) {
      fetch(`http://localhost:5000/api/complaints/user/${user._id}`)
        .then(res => res.json())
        .then(data => { setComplaints(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedComplaint) return;
    const res = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint._id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'user', text: chatMsg })
    });
    const updated = await res.json();
    setSelectedComplaint(updated);
    setChatMsg('');
    fetchComplaints();
  };

  if (!user || user.role !== 'user') return <div className="page-wrapper"><h2>Access Denied</h2></div>;

  const statusColor = (s) => s === 'Resolved' ? 'var(--success)' : s === 'In Progress' ? '#60a5fa' : 'var(--warning)';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
      {/* Sidebar */}
      <div style={{ width: '360px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>My Complaints</h2>
          <Link to="/complaints/new" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>+ New</Link>
        </div>

        {loading ? <p>Loading...</p> : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>No complaints yet.</p>
            <Link to="/complaints/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Lodge Complaint</Link>
          </div>
        ) : complaints.map(c => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>{c.title}</strong>
              <span style={{ fontSize: '0.7rem', color: statusColor(c.status), fontWeight: 600 }}>● {c.status}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {/* Chat View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedComplaint ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <p>Select a complaint to view conversation with agent</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{selectedComplaint.title}</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: statusColor(selectedComplaint.status) }}>● {selectedComplaint.status}</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(selectedComplaint.messages || []).map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '65%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.from === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 600 }}>
                      {msg.from === 'user' ? '👤 You' : '🎧 Support Agent'}
                    </div>
                    {msg.text}
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '0.4rem' }}>
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
                  placeholder={selectedComplaint.status === 'Resolved' ? 'This complaint is resolved' : 'Reply to the agent...'}
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

export default MyComplaints;
