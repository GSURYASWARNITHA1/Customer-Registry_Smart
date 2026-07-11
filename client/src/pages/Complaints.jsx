import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Complaints = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'user') {
    return <div className="page-wrapper"><h2>Access Denied</h2></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
const response = await fetch('https://customer-registry-smart.onrender.com/api/complaints', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, title, description })
      });
      if (response.ok) {
        setStatusMsg('Complaint lodged successfully!');
        setTimeout(() => navigate('/my-complaints'), 2000);
      }
    } catch (err) {
      setStatusMsg('Failed to submit complaint.');
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Lodge a Complaint</h2>
        {statusMsg && (
          <div style={{ color: statusMsg.includes('success') ? 'var(--success)' : 'var(--warning)', marginBottom: '1rem', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            {statusMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Complaint Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Brief summary of the issue"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="5"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              placeholder="Provide detailed information about your issue..."
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Submit Complaint</button>
        </form>
      </div>
    </div>
  );
};

export default Complaints;
