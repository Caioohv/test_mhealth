import React, { useState } from 'react';
import client from '../api/client';
import { Play, Code } from 'lucide-react';

const GenericTester = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/api/networks');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const config = {
        method,
        url,
        data: body ? JSON.parse(body) : undefined,
      };
      const res = await client(config);
      setResponse({
        status: res.status,
        data: res.data,
      });
    } catch (err) {
      setResponse({
        status: err.response?.status || 'Error',
        data: err.response?.data || { message: err.message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Generic API Tester</h1>
      <div className="card glass">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <select 
            className="input-field" 
            style={{ width: '120px' }} 
            value={method} 
            onChange={e => setMethod(e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
          <input 
            className="input-field" 
            placeholder="/endpoint" 
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleTest} disabled={loading}>
            <Play size={18} /> {loading ? 'Running...' : 'Send'}
          </button>
        </div>

        {(method === 'POST' || method === 'PATCH') && (
          <div style={{ marginBottom: '16px' }}>
            <p className="text-muted" style={{ marginBottom: '8px', fontSize: '0.85rem' }}>Request Body (JSON)</p>
            <textarea 
              className="input-field" 
              style={{ height: '120px', fontFamily: 'monospace' }}
              placeholder='{ "key": "value" }'
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        )}

        {response && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Response</p>
              <span className={`badge badge-${response.status >= 200 && response.status < 300 ? 'get' : 'delete'}`}>
                {response.status}
              </span>
            </div>
            <pre className="json-view">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericTester;
