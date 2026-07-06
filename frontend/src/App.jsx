import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Complaints from './pages/Complaints';
import MyComplaints from './pages/MyComplaints';
import AgentDashboard from './pages/AgentDashboard';
import './index.css';

// Simple Navigation Component
const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">ApexRegistry</Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {!user ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'user' && (
              <>
                <Link to="/complaints/new" className="nav-link">Lodge Complaint</Link>
                <Link to="/my-complaints" className="nav-link">My Complaints</Link>
              </>
            )}
            {user.role === 'agent' && (
              <Link to="/agent/dashboard" className="nav-link">Dashboard</Link>
            )}
            <button onClick={handleLogout} className="btn btn-outline" style={{padding: '0.4rem 1rem'}}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complaints/new" element={<Complaints />} />
        <Route path="/my-complaints" element={<MyComplaints />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
