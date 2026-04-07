import React, { useState } from 'react';
import { realApi } from '../api';
import { 
  FlaskConical, 
  UserPlus, 
  Network, 
  Send, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

const ValidationLabs = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testAction = async (name, action, data) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    setResults(prev => ({ ...prev, [name]: null }));
    try {
      const response = await action(data);
      setResults(prev => ({ 
        ...prev, 
        [name]: { success: true, data: response.data } 
      }));
    } catch (err) {
      console.error(err);
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          message: err.response?.data?.message || err.message,
          error: err.response?.data
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const ResultCard = ({ name }) => {
    const res = results[name];
    if (!res) return null;

    return (
      <div className={`glass-card ${res.success ? 'border-success' : 'border-danger'}`} style={{ marginTop: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {res.success ? <CheckCircle2 size={16} color="var(--success)" /> : <AlertTriangle size={16} color="var(--danger)" />}
          <strong style={{ fontSize: '0.9rem' }}>{res.success ? 'Sucesso' : 'Erro de Validação'}</strong>
        </div>
        <pre style={{ fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap', color: res.success ? 'var(--success)' : 'var(--danger)' }}>
          {JSON.stringify(res.error || res.data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <section className="glass-card" style={{ border: '2px dashed var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FlaskConical size={32} color="var(--primary)" />
        <div>
          <h2 style={{ margin: 0 }}>🧪 Validation Labs</h2>
          <p className="text-muted">Teste as regras do Zod enviando dados propositalmente inválidos para a API real.</p>
        </div>
      </div>

      <div className="grid">
        {/* Auth Tests */}
        <div className="glass-card">
          <h3><UserPlus size={18} /> Lab: Registro Real</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Rota: POST /auth/register</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-outline" 
              disabled={loading.regEmpty}
              onClick={() => testAction('regEmpty', realApi.register, {})}
            >
              Vazio {}
            </button>
            <button 
              className="btn btn-outline" 
              disabled={loading.regShort}
              onClick={() => testAction('regShort', realApi.register, { email: 'bad-email', password: '123' })}
            >
              Email/Senha Inválidos
            </button>
          </div>
          <ResultCard name="regEmpty" />
          <ResultCard name="regShort" />
        </div>

        {/* Network Tests */}
        <div className="glass-card">
          <h3><Network size={18} /> Lab: Redes</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Rota: POST /api/networks</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-outline" 
              disabled={loading.netShort}
              onClick={() => testAction('netShort', realApi.createNetwork, { name: 'A' })}
            >
              Nome Curto ("A")
            </button>
          </div>
          <ResultCard name="netShort" />
        </div>

        {/* Invitation Tests */}
        <div className="glass-card">
          <h3><Send size={18} /> Lab: Convites</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Rota: POST /api/networks/:id/invitations</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-outline" 
              disabled={loading.inviteBad}
              onClick={() => testAction('inviteBad', realApi.invite, 'any-id', { proposedRole: 'INVALID' })}
            >
              Role Inválida
            </button>
          </div>
          <ResultCard name="inviteBad" />
        </div>
      </div>

      <style>{`
        .border-success { border-color: var(--success) !important; }
        .border-danger { border-color: var(--danger) !important; }
      `}</style>
    </section>
  );
};

export default ValidationLabs;
