// src/pages/Register.jsx
import { useState } from 'react';

const BASE = 'http://localhost:5000/api';

export default function Register({ goLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    gender: '', phonenumber: '', department: '', address: '', aadharCard: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [aadharPhoto,    setAadharPhoto]    = useState(null);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const required = ['name','email','password','confirmPassword','gender','phonenumber','department','address','aadharCard'];
    for (const key of required) {
      if (!form[key].trim()) { setError(`Please fill in: ${key}`); return; }
    }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!aadharPhoto) { setError('Aadhar card photo is required'); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (profilePicture) formData.append('profilePicture', profilePicture);
    formData.append('aadharPhoto', aadharPhoto);

    setLoading(true);

    // Use a 60-second timeout — GridFS uploads can be slow for large images
    const controller = new AbortController();
    const uploadTimeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(uploadTimeout);

      // Parse JSON safely
      let data;
      try { data = await res.json(); }
      catch {
        if (res.ok) {
          setSuccess('✅ Registered! Please wait for admin approval before logging in.');
          setForm({ name:'',email:'',password:'',confirmPassword:'',gender:'',phonenumber:'',department:'',address:'',aadharCard:'' });
          setProfilePicture(null); setAadharPhoto(null);
        } else {
          setError(`Server error (${res.status}). Please try again.`);
        }
        return;
      }

      if (res.ok) {
        setSuccess(data.message || '✅ Registered! Please wait for admin approval.');
        setForm({ name:'',email:'',password:'',confirmPassword:'',gender:'',phonenumber:'',department:'',address:'',aadharCard:'' });
        setProfilePicture(null); setAadharPhoto(null);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      clearTimeout(uploadTimeout);
      if (err.name === 'AbortError') {
        setSuccess('⚠️ Upload is taking longer than expected. Your registration may have been saved — please wait a minute then try logging in, or contact your admin.');
      } else {
        setError('Cannot connect to server. Make sure backend is running on port 5000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
      position:'relative', overflow:'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position:'absolute', top:'-100px', right:'-60px',
        width:360, height:360, borderRadius:'50%',
        background:'linear-gradient(135deg,rgba(99,102,241,0.16),rgba(139,92,246,0.10))',
        filter:'blur(48px)', pointerEvents:'none'
      }} />
      <div style={{
        position:'absolute', bottom:'-80px', left:'-80px',
        width:300, height:300, borderRadius:'50%',
        background:'linear-gradient(135deg,rgba(59,130,246,0.13),rgba(99,102,241,0.08))',
        filter:'blur(40px)', pointerEvents:'none'
      }} />

      <div style={{ width:'100%', maxWidth:580, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:60, height:60, borderRadius:16, margin:'0 auto 12px',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, boxShadow:'0 8px 24px rgba(99,102,241,0.32)'
          }}>👤</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--primary)', marginBottom:4 }}>Employee Registration</h1>
          <p style={{ color:'var(--text-light)', fontSize:14 }}>
            Fill all details — admin will review and approve your account
          </p>
        </div>

        <div className="card" style={{ boxShadow:'0 4px 32px rgba(99,102,241,0.10)' }}>
          {error   && <div className="alert alert-error">{error}</div>}
          {success && (
            <div className="alert alert-success">
              {success}
              <br/>
              <button onClick={goLogin}
                style={{ background:'none', border:'none', color:'var(--success)', fontWeight:700, cursor:'pointer', padding:0, marginTop:6 }}>
                → Go to Login
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ── Personal Info ──────────────────────────────────────────── */}
            <SectionTitle>Personal Information</SectionTitle>

            <div className="grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Phone Number *</label>
                <input name="phonenumber" placeholder="9876543210" value={form.phonenumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <input name="department" placeholder="Engineering" value={form.department} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input name="address" placeholder="123 Main St, City, State" value={form.address} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Aadhar Card Number *</label>
              <input name="aadharCard" placeholder="1234 5678 9012" value={form.aadharCard} onChange={handleChange} />
            </div>

            {/* ── Account Info ────────────────────────────────────────────── */}
            <SectionTitle>Account Credentials</SectionTitle>

            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" placeholder="john@company.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Password *</label>
                <div style={{ position:'relative' }}>
                  <input
                    name="password" type={showPwd ? 'text' : 'password'}
                    placeholder="min 6 characters" value={form.password} onChange={handleChange}
                    style={{ paddingRight:44 }}
                  />
                  <EyeBtn show={showPwd} toggle={() => setShowPwd(v => !v)} />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div style={{ position:'relative' }}>
                  <input
                    name="confirmPassword" type={showCPwd ? 'text' : 'password'}
                    placeholder="repeat password" value={form.confirmPassword} onChange={handleChange}
                    style={{ paddingRight:44 }}
                  />
                  <EyeBtn show={showCPwd} toggle={() => setShowCPwd(v => !v)} />
                </div>
              </div>
            </div>

            {/* ── Photos ──────────────────────────────────────────────────── */}
            <SectionTitle>Photos</SectionTitle>

            <div className="grid-2">
              {/* Profile Picture — NO preview shown (avoids blob URL leaking into GridFS cluster) */}
              <div className="form-group">
                <label>Profile Photo (optional)</label>
                <UploadBox
                  id="profileInput"
                  icon="🖼️"
                  label="Click to upload photo"
                  file={profilePicture}
                  onChange={e => setProfilePicture(e.target.files[0] || null)}
                  required={false}
                />
              </div>

              {/* Aadhar Photo — NO preview shown */}
              <div className="form-group">
                <label>Aadhar Card Photo *</label>
                <UploadBox
                  id="aadharInput"
                  icon="🪪"
                  label="Required — click to upload"
                  file={aadharPhoto}
                  onChange={e => setAadharPhoto(e.target.files[0] || null)}
                  required={true}
                />
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom:16 }}>
              ℹ️ <strong>Salary</strong> and <strong>holidays</strong> will be filled by the admin after your account is approved.
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:15 }}>
              {loading ? '⏳ Uploading & Registering… Please wait' : 'Submit Registration'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:18, color:'var(--text-light)', fontSize:14 }}>
          Already registered?{' '}
          <button onClick={goLogin}
            style={{ background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontWeight:600, fontSize:14 }}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p style={{ fontWeight:700, color:'var(--primary)', fontSize:13, textTransform:'uppercase',
      letterSpacing:'0.06em', marginBottom:12, marginTop:8 }}>
      {children}
    </p>
  );
}

function EyeBtn({ show, toggle }) {
  return (
    <button type="button" onClick={toggle}
      title={show ? 'Hide password' : 'Show password'}
      style={{
        position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
        background:'none', border:'none', cursor:'pointer',
        fontSize:18, color:'var(--text-light)', padding:'4px', lineHeight:1,
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
      {show ? '🙈' : '👁️'}
    </button>
  );
}

/**
 * Upload box that shows ONLY the filename — no image preview.
 * This prevents blob URLs / GridFS IDs from appearing before the file
 * is actually stored and confirmed server-side.
 */
function UploadBox({ id, icon, label, file, onChange, required }) {
  return (
    <div
      style={{
        border: `2px dashed ${file ? 'var(--success,#22c55e)' : required ? '#E65100' : 'var(--border)'}`,
        borderRadius: 8, padding:'16px', textAlign:'center', cursor:'pointer',
        background: file ? '#f0fdf4' : required ? '#FFF3E0' : 'var(--bg)',
        transition:'border-color 0.2s, background 0.2s'
      }}
      onClick={() => document.getElementById(id).click()}
    >
      {file ? (
        <>
          <div style={{ fontSize:24, marginBottom:4 }}>✅</div>
          <div style={{ fontSize:12, color:'var(--success,#22c55e)', fontWeight:600, wordBreak:'break-all' }}>
            {file.name}
          </div>
          <div style={{ fontSize:11, color:'var(--text-light)', marginTop:2 }}>
            {(file.size / 1024).toFixed(0)} KB — click to change
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
          <div style={{ fontSize:12, color: required ? '#E65100' : 'var(--text-light)' }}>{label}</div>
        </>
      )}
      <input id={id} type="file" accept="image/*" style={{ display:'none' }} onChange={onChange} />
    </div>
  );
}