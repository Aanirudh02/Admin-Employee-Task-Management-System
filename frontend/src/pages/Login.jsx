// src/pages/Login.jsx
import { useState } from 'react';
import { loginUser } from '../api';

export default function Login({ onLogin, goRegister }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        onLogin(data);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position:'absolute', top:'-80px', left:'-80px',
        width:320, height:320, borderRadius:'50%',
        background:'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))',
        filter:'blur(40px)', pointerEvents:'none'
      }} />
      <div style={{
        position:'absolute', bottom:'-60px', right:'-60px',
        width:280, height:280, borderRadius:'50%',
        background:'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.10))',
        filter:'blur(40px)', pointerEvents:'none'
      }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{
            width:64, height:64, borderRadius:18, margin:'0 auto 14px',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, boxShadow:'0 8px 24px rgba(99,102,241,0.35)'
          }}>📋</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--primary)', marginBottom:4 }}>TaskFlow</h1>
          <p style={{ color:'var(--text-light)', fontSize:14 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow:'0 4px 32px rgba(99,102,241,0.10)' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{
                position:'relative', display:'flex', alignItems:'center',
                border:'1.5px solid var(--border)', borderRadius:8,
                background:'var(--bg)', overflow:'hidden'
              }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    flex:1, border:'none', outline:'none', background:'transparent',
                    padding:'10px 44px 10px 12px', fontSize:15, color:'var(--text)',
                    fontFamily:'inherit', width:'100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  title={showPwd ? 'Hide password' : 'Show password'}
                  style={{
                    position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    fontSize:17, color:'var(--text-light)', padding:'4px',
                    lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15, marginTop:4 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="alert alert-info" style={{ marginTop:20, marginBottom:0 }}>
            <strong>Login as</strong> admin <br/>
            or <code>as an</code> employee
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:20, color:'var(--text-light)', fontSize:14 }}>
          New employee?{' '}
          <button onClick={goRegister}
            style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontWeight:600, fontSize:14 }}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}