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
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'ASSISTIDO' });

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
    setShowInviteForm(false);
    try {
      const { data } = await client.get(`/api/networks/${network.id}/members`);
      setMembers(data);
    } catch (err) {
      alert('Failed to fetch members');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/api/networks/${selectedNetwork.id}/invitations`, {
        invitedEmail: inviteData.email,
        proposedRole: inviteData.role,
        medicationAccess: 'VIEW',
        consultationAccess: 'VIEW',
        networkAccess: 'VIEW',
        recordsAccess: 'VIEW'
      });
      alert('Invitation sent successfully!');
      setInviteData({ email: '', role: 'ASSISTIDO' });
      setShowInviteForm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', height: 'calc(100vh - 100px)' }}>
      <div style={{ 
        display: 'flex', 
        gap: '32px', 
        height: '100%',
        alignItems: 'stretch'
      }}>
        {/* Left Section: Networks List */}
        <div style={{ 
          width: selectedNetwork ? '320px' : '100%', 
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: selectedNetwork ? '1.5rem' : '2rem' }}>Support Networks</h1>
            {!selectedNetwork && (
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                <Plus size={18} /> {showForm ? 'Cancel' : 'New Network'}
              </button>
            )}
          </div>

          {!selectedNetwork && showForm && (
            <div className="card glass" style={{ marginBottom: '8px' }}>
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

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedNetwork ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {loading ? <p>Loading networks...</p> : networks.map(n => (
              <div 
                key={n.id} 
                className="card glass" 
                style={{ 
                  borderColor: selectedNetwork?.id === n.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  background: selectedNetwork?.id === n.id ? 'rgba(99, 102, 241, 0.1)' : undefined,
                  boxShadow: selectedNetwork?.id === n.id ? '0 0 20px rgba(99, 102, 241, 0.15)' : 'none',
                  cursor: 'pointer',
                  padding: selectedNetwork ? '16px' : '20px',
                  transition: 'all 0.3s ease',
                  borderWidth: '2px'
                }}
                onClick={() => showMembers(n)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: selectedNetwork ? '1rem' : '1.2rem' }}>{n.name}</h3>
                  <button 
                    className="btn" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                    style={{ color: '#ef4444', padding: '4px', minWidth: 'auto', background: 'transparent' }}
                  >
                    <Trash size={16} />
                  </button>
                </div>
                {!selectedNetwork && (
                  <>
                    <p className="text-muted" style={{ margin: '8px 0', fontSize: '0.9rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.8rem', color: '#a5b4fc' }}>
                      <Users size={14} /> {n.memberCount || 0} members
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {selectedNetwork && (
            <button className="btn" onClick={() => setSelectedNetwork(null)} style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)' }}>
              ← Return All
            </button>
          )}
        </div>

        {/* Right Section: Details & Members */}
        {selectedNetwork ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            animation: 'fadeIn 0.5s ease',
            overflowY: 'auto',
            paddingRight: '12px'
          }}>
            <div className="card glass" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedNetwork.name}</h2>
              </div>
              <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                {selectedNetwork.description || 'No description provided for this support network.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
              {/* Members Column */}
              <div className="card glass">
                <div style={{ 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: '#6366f1', 
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Users size={16} /> Members List
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {members.length === 0 ? <p className="text-muted">Loading members...</p> : members.map(m => (
                    <div key={m.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{m.user?.name || m.user?.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                          {m.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Column */}
              <div className="card glass">
                <div style={{ 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: '#6366f1', 
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <UserPlus size={16} /> Invite New Member
                </div>
                
                <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '6px', display: 'block' }}>Email Address</label>
                    <input 
                      className="input-field" 
                      placeholder="name@example.com" 
                      value={inviteData.email}
                      onChange={e => setInviteData({...inviteData, email: e.target.value})}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '6px', display: 'block' }}>Assign Permissions</label>
                    <select 
                      className="input-field"
                      value={inviteData.role}
                      onChange={e => setInviteData({...inviteData, role: e.target.value})}
                      style={{ background: '#0f172a' }}
                    >
                      <option value="ASSISTIDO">Assistido (View only)</option>
                      <option value="RESPONSAVEL">Responsável (Edit access)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px' }}>
                    Send Secure Invitation
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
            <div style={{ textAlign: 'center' }}>
              <Info size={48} style={{ marginBottom: '16px' }} />
              <p>Select a network from the list to view its members and details.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Networks;
