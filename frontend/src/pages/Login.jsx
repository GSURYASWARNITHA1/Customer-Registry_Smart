import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
const response = await fetch('https://customer-registry-smart.onrender.com/api/auth/login', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'agent') navigate('/agent/dashboard');
        else navigate('/my-complaints');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to Account</h2>
        {error && <div style={{ color: 'var(--warning)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Sign In</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
