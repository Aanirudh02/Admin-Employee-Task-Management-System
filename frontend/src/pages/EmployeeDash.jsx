/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
// src/pages/EmployeeDash.jsx
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';

const BASE = 'http://localhost:5000';
const token = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const NAV = [
  { id: 'tasks',   icon: '📋', label: 'My Tasks' },
  { id: 'profile', icon: '👤', label: 'Profile'  },
];

const STATUS_OPTIONS = ['pending', 'in progress', 'on-hold', 'cancelled', 'completed'];

const PRIORITY_COLORS = {
  Minor:    { bg: '#dcfce7', text: '#16a34a' },
  Medium:   { bg: '#dbeafe', text: '#1d4ed8' },
  Major:    { bg: '#fef9c3', text: '#a16207' },
  Critical: { bg: '#fee2e2', text: '#dc2626' },
};

const STATUS_COLORS = {
  'pending':     { bg: '#f1f5f9', text: '#64748b' },
  'in progress': { bg: '#dbeafe', text: '#1d4ed8' },
  'on-hold':     { bg: '#fef9c3', text: '#a16207' },
  'cancelled':   { bg: '#fee2e2', text: '#dc2626' },
  'completed':   { bg: '#dcfce7', text: '#16a34a' },
};

export default function EmployeeDash({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [msg,       setMsg]       = useState({ text:'', type:'' });
  const [filterSt,  setFilterSt]  = useState('all');
  const [profile,   setProfile]   = useState(null);

  // ── Edit profile state ──────────────────────────────────────────────────────
  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/api/tasks/my-tasks`, { headers: authH() });
      const d = await r.json();
      if (Array.isArray(d)) setTasks(d);
    } catch (err) {
      showMsg('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/employee/profile`, { headers: authH() });
      const d = await r.json();
      if (d._id) {
        setProfile(d);
        // Pre-fill edit form
        setEditForm({
          phonenumber: d.phonenumber || '',
          address:     d.address     || '',
          department:  d.department  || '',
        });
      }
    } catch {}
  }, []);

  useEffect(() => { loadTasks(); loadProfile(); }, [loadTasks, loadProfile]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text:'', type:'' }), 4000);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const r = await fetch(`${BASE}/api/tasks/${taskId}/status`, {
        method: 'PATCH', headers: authH(),
        body: JSON.stringify({ status: newStatus })
      });
      const d = await r.json();
      if (r.ok) {
        showMsg(`✅ Status updated to "${newStatus}" — confirmation email sent!`, 'success');
        loadTasks();
      } else {
        showMsg(d.message || 'Update failed', 'error');
      }
    } catch {
      showMsg('Server error', 'error');
    }
  };

  // ── Save edited profile ─────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const r = await fetch(`${BASE}/api/employee/profile`, {
        method: 'PATCH',
        headers: authH(),
        body: JSON.stringify(editForm),
      });
      const d = await r.json();
      if (r.ok) {
        showMsg('✅ Profile updated successfully!', 'success');
        setProfile(prev => ({ ...prev, ...editForm }));
        setEditMode(false);
      } else {
        showMsg(d.message || 'Update failed', 'error');
      }
    } catch {
      showMsg('Server error', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Stats
  const done       = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in progress').length;
  const pending    = tasks.filter(t => t.status === 'pending').length;
  const onHold     = tasks.filter(t => t.status === 'on-hold').length;

  const filtered = filterSt === 'all' ? tasks : tasks.filter(t => t.status === filterSt);

  return (
    <Layout user={user} onLogout={onLogout} navItems={NAV} activeTab={activeTab} setActiveTab={setActiveTab}>

      {/* ── MY TASKS ───────────────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <>
          <div className="page-header">
            <h1>My Tasks</h1>
            <p>View and update your assigned tasks. Status changes send you an email confirmation.</p>
          </div>

          {/* Stats */}
          <div className="grid-3" style={{ marginBottom:24, gap:16 }}>
            <div className="stat-card" style={{ borderLeft:'4px solid #6366f1' }}>
              <div className="icon">📋</div>
              <div><div className="num" style={{ color:'#6366f1' }}>{tasks.length}</div><div className="lbl">Total Tasks</div></div>
            </div>
            <div className="stat-card" style={{ borderLeft:'4px solid #3b82f6' }}>
              <div className="icon">🔄</div>
              <div><div className="num" style={{ color:'#3b82f6' }}>{inProgress}</div><div className="lbl">In Progress</div></div>
            </div>
            <div className="stat-card" style={{ borderLeft:'4px solid #22c55e' }}>
              <div className="icon">✅</div>
              <div><div className="num" style={{ color:'#22c55e' }}>{done}</div><div className="lbl">Completed</div></div>
            </div>
          </div>

          {/* Notification */}
          {msg.text && (
            <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom:16 }}>
              {msg.text}
            </div>
          )}

          {/* Status filter */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
            {['all','pending','in progress','on-hold','completed','cancelled'].map(s => {
              const count = s==='all' ? tasks.length : tasks.filter(t=>t.status===s).length;
              return (
                <button key={s} onClick={() => setFilterSt(s)}
                  style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid var(--border)',
                    background: filterSt===s ? 'var(--primary)' : 'transparent',
                    color: filterSt===s ? '#fff' : 'var(--text)',
                    fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
                  {s} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:48, color:'var(--text-light)' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
              <p>Loading your tasks…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <p style={{ color:'var(--text-light)', fontWeight:600 }}>
                {filterSt === 'all' ? 'No tasks assigned to you yet.' : `No ${filterSt} tasks.`}
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {filtered.map(task => (
                <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PROFILE ────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <>
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1>My Profile</h1>
              <p>Your account information</p>
            </div>
            {!editMode ? (
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-outline" onClick={() => {
                  setEditMode(false);
                  setEditForm({ phonenumber: profile?.phonenumber||'', address: profile?.address||'', department: profile?.department||'' });
                }}>Cancel</button>
                <button className="btn btn-primary" disabled={saveLoading} onClick={handleSaveProfile}>
                  {saveLoading ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Notification for profile tab */}
          {msg.text && (
            <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom:16 }}>
              {msg.text}
            </div>
          )}

          <div className="card" style={{ maxWidth:520 }}>
            {/* Avatar row */}
            <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, flexShrink:0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:20 }}>{user?.name}</div>
                <div style={{ color:'var(--text-light)', fontSize:14 }}>{user?.email}</div>
                <div style={{ marginTop:6, display:'inline-block', background:'#dcfce7', color:'#16a34a', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                  ✓ Employee
                </div>
              </div>
            </div>

            {/* Profile details */}
            {profile && !editMode && (
              <>
                <ProfileRow label="Employee ID"  value={profile.employeeId} />
                <ProfileRow label="Department"   value={profile.department} />
                <ProfileRow label="Phone"        value={profile.phonenumber} />
                <ProfileRow label="Gender"       value={profile.gender} style={{ textTransform:'capitalize' }} />
                <ProfileRow label="Salary"       value={profile.salary ? `₹${profile.salary.toLocaleString('en-IN')}/month` : 'Not set yet'} />
                <ProfileRow label="Joined"       value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN',{dateStyle:'long'}) : '—'} />
                <ProfileRow label="Address"      value={profile.address} />
              </>
            )}

            {/* ── Edit form ───────────────────────────────────────────────── */}
            {profile && editMode && (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <p style={{ fontSize:12, color:'var(--text-light)', marginBottom:8 }}>
                  ℹ️ You can edit your phone, address, and department. Name, email, salary and ID are managed by admin.
                </p>

                <ProfileRow label="Employee ID" value={profile.employeeId} />
                <ProfileRow label="Gender"      value={profile.gender} />
                <ProfileRow label="Salary"      value={profile.salary ? `₹${profile.salary.toLocaleString('en-IN')}/month` : 'Not set yet'} />
                <ProfileRow label="Joined"      value={profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN',{dateStyle:'long'}) : '—'} />

                <div style={{ paddingTop:12 }}>
                  <EditField
                    label="Phone Number"
                    value={editForm.phonenumber}
                    onChange={v => setEditForm(f => ({ ...f, phonenumber: v }))}
                    placeholder="9876543210"
                    type="tel"
                  />
                  <EditField
                    label="Department"
                    value={editForm.department}
                    onChange={v => setEditForm(f => ({ ...f, department: v }))}
                    placeholder="Engineering"
                  />
                  <EditField
                    label="Address"
                    value={editForm.address}
                    onChange={v => setEditForm(f => ({ ...f, address: v }))}
                    placeholder="123 Main St, City, State"
                    multiline
                  />
                </div>
              </div>
            )}

            {/* Task summary */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Task Summary</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  ['Total',       tasks.length,  '#6366f1'],
                  ['Pending',     pending,        '#f59e0b'],
                  ['In Progress', inProgress,     '#3b82f6'],
                  ['Completed',   done,           '#22c55e'],
                ].map(([label,val,color]) => (
                  <div key={label} style={{ background:'var(--bg)', borderRadius:10, padding:'12px 16px', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:20, fontWeight:800, color }}>{val}</div>
                    <div style={{ fontSize:12, color:'var(--text-light)', marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange }) {
  const [selected, setSelected] = useState(task.status);
  const [updating, setUpdating] = useState(false);

  const pc = PRIORITY_COLORS[task.task_priority] || PRIORITY_COLORS.Medium;
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS['pending'];

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleUpdate = async () => {
    if (selected === task.status) return;
    setUpdating(true);
    await onStatusChange(task._id, selected);
    setUpdating(false);
  };

  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:16, position:'relative',
      borderLeft:`4px solid ${pc.text}` }}>

      {isOverdue && (
        <div style={{ position:'absolute', top:14, right:14, background:'#fee2e2', color:'#dc2626',
          padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
          ⚠️ Overdue
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6, marginRight:80 }}>{task.title}</h3>
          <p style={{ color:'var(--text-light)', fontSize:14, lineHeight:1.5 }}>{task.description}</p>
        </div>
        <span style={{ background:pc.bg, color:pc.text, padding:'4px 12px', borderRadius:20,
          fontSize:12, fontWeight:700, flexShrink:0, whiteSpace:'nowrap' }}>
          {task.task_priority}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
        <MetaChip icon="📅" label="Due" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '—'} danger={isOverdue} />
        <MetaChip icon="⏱️" label="Est. Hours" value={`${task.estimated_hours} hrs`} />
        <MetaChip icon="🕐" label="Time Given" value={`${task.time_given} hrs`} />
        <MetaChip icon="🗓️" label="Assigned" value={task.assigned_date ? new Date(task.assigned_date).toLocaleDateString('en-IN') : '—'} />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
        <span style={{ color:'var(--text-light)' }}>Current:</span>
        <span style={{ background:sc.bg, color:sc.text, padding:'3px 12px', borderRadius:20, fontSize:13, fontWeight:700, textTransform:'capitalize' }}>
          {task.status}
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', paddingTop:8, borderTop:'1px solid var(--border)' }}>
        <span style={{ fontSize:13, color:'var(--text-light)', fontWeight:600 }}>Update Status:</span>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid var(--border)',
            fontSize:14, fontFamily:'inherit', background:'var(--bg)', color:'var(--text)', flex:1, minWidth:160, maxWidth:220 }}>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleUpdate}
          disabled={selected === task.status || updating}
          style={{ whiteSpace:'nowrap' }}>
          {updating ? '⏳ Updating…' : '📧 Update & Email Me'}
        </button>
      </div>
    </div>
  );
}

// ── Edit field component ──────────────────────────────────────────────────────
function EditField({ label, value, onChange, placeholder, type = 'text', multiline }) {
  const inputStyle = {
    width:'100%', padding:'9px 12px', borderRadius:8,
    border:'1.5px solid var(--border)', fontSize:14,
    fontFamily:'inherit', background:'var(--bg)', color:'var(--text)',
    resize: multiline ? 'vertical' : undefined,
    marginTop:4, boxSizing:'border-box'
  };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:13, fontWeight:600, color:'var(--text-light)', display:'block', marginBottom:2 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} style={inputStyle} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      }
    </div>
  );
}

function MetaChip({ icon, label, value, danger }) {
  return (
    <div style={{ background:'var(--bg)', borderRadius:8, padding:'8px 12px', border:'1px solid var(--border)' }}>
      <div style={{ fontSize:11, color:'var(--text-light)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.04em' }}>{icon} {label}</div>
      <div style={{ fontWeight:700, fontSize:13, color: danger ? '#dc2626' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid var(--border)', gap:16 }}>
      <span style={{ color:'var(--text-light)', fontSize:14, flexShrink:0 }}>{label}</span>
      <span style={{ fontWeight:600, fontSize:14, textAlign:'right', wordBreak:'break-word', textTransform: label==='Gender' ? 'capitalize' : undefined }}>{value || '—'}</span>
    </div>
  );
}