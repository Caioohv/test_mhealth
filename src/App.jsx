import React, { useState, useEffect } from 'react';
import { devApi } from './api';
import { 
  UserPlus, 
  LogIn, 
  Users, 
  Plus, 
  Send, 
  Mail, 
  Shield, 
  LogOut,
  ChevronRight,
  UserCheck
} from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [allUsers, setAllUsers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [netName, setNetName] = useState('');
  const [netDesc, setNetDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNetworkId, setInviteNetworkId] = useState('');
  const [inviteRole, setInviteRole] = useState('RESPONSAVEL');
  const [medicationAccess, setMedicationAccess] = useState('VIEW');
  const [consultationAccess, setConsultationAccess] = useState('VIEW');
  const [networkAccess, setNetworkAccess] = useState('VIEW');
  const [recordsAccess, setRecordsAccess] = useState('VIEW');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserContent();
    }
  }, [currentUser]);

  const fetchAllUsers = async () => {
    try {
      const { data } = await devApi.getUsers();
      setAllUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchUserContent = async () => {
    try {
      setLoading(true);
      const [netRes, invRes] = await Promise.all([
        devApi.getNetworks(currentUser.id),
        devApi.getInvites(currentUser.email)
      ]);
      setNetworks(netRes.data);
      setInvites(invRes.data);
      if (netRes.data.length > 0) setInviteNetworkId(netRes.data[0].id);
    } catch (err) {
      console.error('Failed to fetch user content', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const { data } = await devApi.register(regName, regEmail);
      login(data.user, data.accessToken);
      fetchAllUsers();
      setRegName('');
      setRegEmail('');
    } catch (err) {
      setError('Falha ao registrar usuário');
    }
  };

  const handleLogin = async (email) => {
    try {
      setError(null);
      const { data } = await devApi.login(email);
      login(data.user, data.accessToken);
    } catch (err) {
      setError('Falha no login');
    }
  };

  const login = (user, accessToken) => {
    setCurrentUser(user);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setNetworks([]);
    setInvites([]);
  };

  const handleCreateNetwork = async (e) => {
    e.preventDefault();
    try {
      await devApi.createNetwork(currentUser.id, netName, netDesc);
      fetchUserContent();
      setNetName('');
      setNetDesc('');
    } catch (err) {
      setError('Erro ao criar rede');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await devApi.invite(inviteNetworkId, currentUser.id, inviteEmail, inviteRole, {
        medicationAccess,
        consultationAccess,
        networkAccess,
        recordsAccess
      });
      setInviteEmail('');
      alert('Convite enviado!');
    } catch (err) {
      setError('Erro ao enviar convite');
    }
  };

  const handleAcceptInvite = async (token) => {
    try {
      await devApi.acceptInvite(token, currentUser.id);
      fetchUserContent();
    } catch (err) {
      setError('Erro ao aceitar convite');
    }
  };

  if (!currentUser) {
    return (
      <div className="app-container">
        <header className="glass-card">
          <h1>mHealth Dev Portal</h1>
          <div className="badge">Ambiente de Teste</div>
        </header>

        <div className="grid">
          <div className="glass-card">
            <h2><UserPlus size={20} /> Registrar Novo Usuário</h2>
            <form onSubmit={handleRegister}>
              <label>Nome</label>
              <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Amanda" required />
              <label>Email</label>
              <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="amanda@gmail.com" required />
              <button type="submit" className="btn btn-primary">Registrar</button>
            </form>
          </div>

          <div className="glass-card">
            <h2><LogIn size={20} /> Login Rápido</h2>
            <p className="text-muted">Selecione um usuário existente para entrar:</p>
            <div className="user-selector">
              {allUsers.map(u => (
                <div key={u.id} className="user-chip" onClick={() => handleLogin(u.email)}>
                  <strong>{u.name}</strong>
                  <div style={{ fontSize: '0.7rem' }}>{u.email}</div>
                </div>
              ))}
              {allUsers.length === 0 && <div className="empty-state">Nenhum usuário encontrado</div>}
            </div>
          </div>
        </div>
        {error && <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={24} color="#6366f1" />
          <div>
            <h1>Acessando como {currentUser.name}</h1>
            <p className="text-muted">{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Sair
        </button>
      </header>

      {error && <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>{error}</div>}

      <div className="grid">
        <section className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h2><Users size={20} /> Suas Redes de Apoio</h2>
          {networks.length > 0 ? (
            <div style={{ marginTop: '1.5rem' }}>
              {networks.map(n => (
                <div key={n.id} className="network-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>{n.name}</h3>
                      <p className="text-muted">{n.description}</p>
                    </div>
                    <div className="badge">{n.myRole}</div>
                  </div>
                  <div className="member-list">
                    {n.members?.map(m => (
                      <div key={m.id} className="user-chip" style={{ cursor: 'default', padding: '0.5rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <UserCheck size={14} /> 
                              <span style={{ fontWeight: '500' }}>{m.user.name}</span>
                              <span className="badge" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{m.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              <span className={`perm-badge perm-${m.medicationAccess.toLowerCase()}`}>M:{m.medicationAccess[0]}</span>
                              <span className={`perm-badge perm-${m.consultationAccess.toLowerCase()}`}>C:{m.consultationAccess[0]}</span>
                              <span className={`perm-badge perm-${m.networkAccess.toLowerCase()}`}>N:{m.networkAccess[0]}</span>
                              <span className={`perm-badge perm-${m.recordsAccess.toLowerCase()}`}>R:{m.recordsAccess[0]}</span>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Você ainda não faz parte de nenhuma rede.</div>
          )}
        </section>

        <section>
          <div className="glass-card">
            <h2><Plus size={20} /> Criar Nova Rede</h2>
            <form onSubmit={handleCreateNetwork}>
              <label>Nome da Rede</label>
              <input value={netName} onChange={(e) => setNetName(e.target.value)} placeholder="Rede da Amanda" required />
              <label>Descrição (Opcional)</label>
              <textarea value={netDesc} onChange={(e) => setNetDesc(e.target.value)} placeholder="Apoio para tratamentos" />
              <button type="submit" className="btn btn-primary">Criar Rede</button>
            </form>
          </div>

          <div className="glass-card">
            <h2><Send size={20} /> Convidar Alguém</h2>
            <form onSubmit={handleInvite}>
              <label>Rede</label>
              <select value={inviteNetworkId} onChange={(e) => setInviteNetworkId(e.target.value)}>
                {networks.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
              <label>Função Desejada</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="RESPONSAVEL">RESPONSAVEL</option>
                <option value="ASSISTIDO">ASSISTIDO</option>
              </select>

              <div className="permission-grid">
                <div>
                  <label>Medicamentos</label>
                  <select value={medicationAccess} onChange={(e) => setMedicationAccess(e.target.value)}>
                    <option value="NONE">NONE</option>
                    <option value="VIEW">VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                </div>
                <div>
                  <label>Consultas</label>
                  <select value={consultationAccess} onChange={(e) => setConsultationAccess(e.target.value)}>
                    <option value="NONE">NONE</option>
                    <option value="VIEW">VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                </div>
                <div>
                  <label>Rede</label>
                  <select value={networkAccess} onChange={(e) => setNetworkAccess(e.target.value)}>
                    <option value="NONE">NONE</option>
                    <option value="VIEW">VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                </div>
                <div>
                  <label>Registros</label>
                  <select value={recordsAccess} onChange={(e) => setRecordsAccess(e.target.value)}>
                    <option value="NONE">NONE</option>
                    <option value="VIEW">VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                </div>
              </div>

              <label>Email do Convidado</label>
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ederson@gmail.com" required />
              <button type="submit" className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>Enviar Convite</button>
            </form>
          </div>
        </section>
      </div>

      <section className="glass-card">
        <h2><Mail size={20} /> Convites Pendentes</h2>
        {invites.length > 0 ? (
          <div className="grid" style={{ marginTop: '1.5rem' }}>
            {invites.map(inv => (
              <div key={inv.id} className="network-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>Convite para: {inv.network.name}</h3>
                    <p className="text-muted">Enviado por: {inv.inviter.name}</p>
                    <p className="text-muted">Função: {inv.proposedRole}</p>
                  </div>
                  <button onClick={() => handleAcceptInvite(inv.token)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                    Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Nenhum convite pendente.</div>
        )}
      </section>
    </div>
  );
}

export default App;
