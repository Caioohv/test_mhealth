import React, { useState } from 'react';
import client from '../api/client';
import { LogIn, UserPlus, LogOut, CheckCircle } from 'lucide-react';

const Auth = ({ user, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await client.post(endpoint, formData);
      
      localStorage.setItem('mhealth_token', data.accessToken);
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mhealth_token');
    setUser(null);
  };

  const TEST_ACCOUNTS = [
    { name: 'Admin (Caio)', email: 'caioviier@gmail.com', role: 'ADMIN' },
    { name: 'Fixed Agent', email: 'fixedagent@example.com', role: 'AGENT' },
    { name: 'Test Agent', email: 'testagent@example.com', role: 'AGENT' }
  ];

  const handleQuickLogin = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.post('/auth/login', { email, password: 'Senha123@' });
      localStorage.setItem('mhealth_token', data.accessToken);
      setUser(data.user);
    } catch (err) {
      setError('Test login failed. Seed data might be missing.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>Authenticated</h2>
            <p className="text-muted">Logged in as {user.email}</p>
          </div>
          <button className="btn" onClick={handleLogout} style={{ background: '#ef4444', color: 'white' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card glass" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isLogin && (
          <>
            <input
              className="input-field"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </>
        )}
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Processing...' : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {isLogin && (
        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6366f1', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
            Quick Access (Test Accounts)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {TEST_ACCOUNTS.map(acc => (
              <button 
                key={acc.email}
                className="btn"
                onClick={() => handleQuickLogin(acc.email)}
                disabled={loading}
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '8px', 
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#a5b4fc' }}>{acc.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ color: '#6366f1', cursor: 'pointer', marginLeft: '8px', fontWeight: '600' }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default Auth;
