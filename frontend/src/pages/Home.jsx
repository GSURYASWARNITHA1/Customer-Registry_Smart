import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Welcome to Customer Care Registry</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          A centralized system to record and manage customer interactions, issues, and feedback.
          Streamline your support processes and enhance service quality.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Get Started</Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Login</Link>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3>Secure & Reliable</h3>
          <p>Maintain a comprehensive history of interactions to ensure consistency and build trust.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <Clock size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3>Fast Resolution</h3>
          <p>Track inquiries in real-time and identify recurring pain points for proactive solutions.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <TrendingUp size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3>Data-Driven Insights</h3>
          <p>Analyze trends to refine training, optimize protocols, and offer personalized support.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
