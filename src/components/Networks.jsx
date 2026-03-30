import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Trash, Edit, Users, UserPlus, Info } from 'lucide-react';

const Networks = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newNetwork, setNewNetwork] = useState({ name: '', description: '' });
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [members, setMembers] = useState([]);

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/api/networks');
      setNetworks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await client.post('/api/networks', newNetwork);
      setNewNetwork({ name: '', description: '' });
      setShowForm(false);
      fetchNetworks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create network');
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log('Deleting network:', id);
      await client.delete(`/api/networks/${id}`);
      fetchNetworks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const showMembers = async (network) => {
    setSelectedNetwork(network);
    try {
      const { data } = await client.get(`/networks/${network.id}/members`);
      setMembers(data);
    } catch (err) {
      alert('Failed to fetch members');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedNetwork ? '1fr 350px' : '1fr', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Support Networks</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'New Network'}
          </button>
        </div>

        {showForm && (
          <div className="card glass">
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                className="input-field" 
                placeholder="Network Name" 
                value={newNetwork.name} 
                onChange={e => setNewNetwork({...newNetwork, name: e.target.value})}
                required 
              />
              <textarea 
                className="input-field" 
                placeholder="Description" 
                value={newNetwork.description} 
                onChange={e => setNewNetwork({...newNetwork, description: e.target.value})}
                style={{ height: '80px', resize: 'none' }}
              />
              <button className="btn btn-primary" type="submit">Create Network</button>
            </form>
          </div>
        )}

        {loading ? <p>Loading networks...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {networks.map(n => (
              <div key={n.id} className="card glass" style={{ borderColor: selectedNetwork?.id === n.id ? '#6366f1' : undefined }}>
                <h3>{n.name}</h3>
                <p className="text-muted" style={{ margin: '8px 0', fontSize: '0.9rem' }}>{n.description}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn" onClick={() => showMembers(n)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', flex: 1 }}>
                    <Users size={16} /> Members
                  </button>
                  <button className="btn" onClick={() => handleDelete(n.id)} style={{ color: '#ef4444' }}>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedNetwork && (
        <div className="card glass" style={{ position: 'sticky', top: '0', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem' }}>{selectedNetwork.name} Members</h2>
            <button className="btn" onClick={() => setSelectedNetwork(null)}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.length === 0 ? <p className="text-muted">No members yet</p> : members.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{m.user?.name || m.user?.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{m.role}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: '12px' }}>
              <UserPlus size={16} /> Invite Someone
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Networks;
