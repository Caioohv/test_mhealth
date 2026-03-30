import React, { useState, useEffect } from 'react';
import client from './api/client';
import Auth from './components/Auth';
import Networks from './components/Networks';
import GenericTester from './components/GenericTester';
import { Terminal, Activity, ShieldCheck } from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('networks');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('mhealth_token');
      if (token) {
        try {
          const { data } = await client.get('/api/users/me');
          setUser(data);
        } catch (err) {
          localStorage.removeItem('mhealth_token');
        }
      }
      setIsInitializing(false);
    };
    checkAuth();
  }, []);

  if (isInitializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading mHealth Test Suite...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ paddingTop: '100px' }}>
        <Auth user={user} setUser={setUser} />
      </div>
    );
  }

  return (
    <div className="container">
      <aside className="glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <ShieldCheck size={32} color="#6366f1" />
          <h2 style={{ fontSize: '1.25rem' }}>mHealth Test</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <div 
            className={`nav-item ${activeTab === 'networks' ? 'active' : ''}`} 
            onClick={() => setActiveTab('networks')}
          >
            <Activity size={20} /> Networks
          </div>
          <div 
            className={`nav-item ${activeTab === 'tester' ? 'active' : ''}`} 
            onClick={() => setActiveTab('tester')}
          >
            <Terminal size={20} /> API Tester
          </div>
        </nav>

        <div className="card glass" style={{ marginTop: 'auto', padding: '12px', fontSize: '0.8rem' }}>
          <p className="text-muted">Logged in as:</p>
          <p style={{ fontWeight: '600', color: 'white' }}>{user.email}</p>
          <button 
            onClick={() => { localStorage.removeItem('mhealth_token'); setUser(null); }}
            style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px 0', marginTop: '8px' }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main>
        {activeTab === 'networks' && <Networks />}
        {activeTab === 'tester' && <GenericTester />}
      </main>
    </div>
  );
}

export default App;
