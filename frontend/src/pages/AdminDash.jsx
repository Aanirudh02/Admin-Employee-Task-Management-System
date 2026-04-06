/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
 
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';

const BASE = 'http://localhost:5000';
const token = () => localStorage.getItem('token');
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const NAV = [
  { id: 'overview',  icon: '📊', label: 'Overview'  },
  { id: 'employees', icon: '👥', label: 'Employees' },
  { id: 'tasks',     icon: '✅', label: 'Tasks'     },
];

const PC = { Minor: 'minor', Medium: 'medium', Major: 'major', Critical: 'critical' };

export default function AdminDash({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [tasks,     setTasks]     = useState([]);
  const [approved,  setApproved]  = useState([]);

  const loadEmployees = useCallback(async () => {
    const r = await fetch(`${BASE}/api/admin/employees`, { headers: authH() });
    const d = await r.json();
    if (Array.isArray(d)) setEmployees(d);
  }, []);

  const loadTasks = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE}/api/tasks`,                    { headers: authH() }),
      fetch(`${BASE}/api/admin/employees/approved`, { headers: authH() }),
    ]);
    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
    if (Array.isArray(d1)) setTasks(d1);
    if (Array.isArray(d2)) setApproved(d2);
  }, []);

  useEffect(() => { loadEmployees(); loadTasks(); }, [loadEmployees, loadTasks]);

  // ── BUG FIX 1: only count approved employees, not rejected ────────────────
  const pending       = employees.filter(e => e.status === 'pending').length;
  const approvedCount = employees.filter(e => e.status === 'approved').length;
  const tasksDone     = tasks.filter(t => t.status === 'completed').length;

  return (
    <Layout user={user} onLogout={onLogout} navItems={NAV} activeTab={activeTab} setActiveTab={setActiveTab}>

      {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          <div className="page-header">
            <h1>Welcome back, {user?.name} 👋</h1>
            <p>Here's your team summary</p>
          </div>

          {/* BUG FIX: show approvedCount not employees.length in stat cards */}
          <div className="grid-3" style={{ marginBottom: 32 }}>
            <StatCard icon="👥" num={approvedCount}  lbl="Active Employees" color="#6366f1" />
            <StatCard icon="⏳" num={pending}         lbl="Pending Approvals" color="#f59e0b" />
            <StatCard icon="✅" num={tasksDone}       lbl="Tasks Completed" color="#22c55e" />
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
            <MiniStat label="Total Registered" value={employees.length}  icon="📝" />
            <MiniStat label="Total Tasks"       value={tasks.length}      icon="📋" />
          </div>

          {pending > 0 ? (
            <div className="card">
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18 }}>⏳ Pending Approvals ({pending})</h2>
              <EmployeeTable
                employees={employees.filter(e => e.status === 'pending')}
                onReload={loadEmployees}
                showActions defaultView="table"
              />
            </div>
          ) : (
            <div className="alert alert-success">✅ No pending approvals — all caught up!</div>
          )}
        </>
      )}

      {/* ── EMPLOYEES ──────────────────────────────────────────────────── */}
      {activeTab === 'employees' && (
        <>
          <div className="page-header">
            <h1>Employees</h1>
            <p>Manage all employee registrations and details</p>
          </div>
          <EmployeeTable employees={employees} onReload={loadEmployees} showActions defaultView="table" />
        </>
      )}

      {/* ── TASKS ──────────────────────────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <TasksTab tasks={tasks} approved={approved} onTaskCreated={loadTasks} />
      )}
    </Layout>
  );
}

// ─── Employee Table / Grid ────────────────────────────────────────────────────
function EmployeeTable({ employees, onReload, showActions, defaultView = 'table' }) {
  const [view,     setView]     = useState(defaultView);
  const [selected, setSelected] = useState(null);   // approve modal
  const [salary,   setSalary]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [viewImg,  setViewImg]  = useState(null);   // image viewer {url, title}
  const [viewEmp,  setViewEmp]  = useState(null);   // detail modal
  const [filterSt, setFilterSt] = useState('all');
  const [delConfirm, setDelConfirm] = useState(null); // delete confirm

  const filtered = filterSt === 'all'
    ? employees
    : employees.filter(e => e.status === filterSt);

  const handleStatus = (emp, status) => {
    if (status === 'approved') { setSelected({ emp, status }); setSalary(''); }
    else doUpdate(emp._id, status, null);
  };

  const doUpdate = async (id, status, salaryVal) => {
    setLoading(true);
    await fetch(`${BASE}/api/admin/employees/${id}/status`, {
      method: 'PATCH', headers: authH(),
      body: JSON.stringify({ status, salary: salaryVal })
    });
    setSelected(null); setLoading(false); onReload();
  };

  const handleDelete = async (id) => {
    setLoading(true);
    await fetch(`${BASE}/api/admin/employees/${id}`, { method: 'DELETE', headers: authH() });
    setDelConfirm(null); setLoading(false); onReload();
  };

  const imgUrl = (url) => url ? `${BASE}${url}` : null;

  const statusBadge = (s) => {
    const map = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };
    return (
      <span style={{ background: (map[s]||'#94a3b8') + '20', color: map[s]||'#94a3b8',
        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
        {s}
      </span>
    );
  };

  const Avatar = ({ emp, size = 40 }) => (
    emp.profilePictureUrl
      ? <img src={imgUrl(emp.profilePictureUrl)} alt={emp.name}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 800 }}>
          {emp.name?.charAt(0).toUpperCase()}
        </div>
  );

  return (
    <>
      {/* Controls */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setFilterSt(s)}
              style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid var(--border)',
                background: filterSt===s ? 'var(--primary)' : 'transparent',
                color: filterSt===s ? '#fff' : 'var(--text)',
                fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
              {s} ({s==='all' ? employees.length : employees.filter(e=>e.status===s).length})
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, background:'var(--bg)', borderRadius:8, padding:4, border:'1.5px solid var(--border)' }}>
          <TglBtn active={view==='table'} onClick={()=>setView('table')} label="☰ Table" />
          <TglBtn active={view==='grid'}  onClick={()=>setView('grid')}  label="⊞ Grid"  />
        </div>
      </div>

      {/* ── TABLE view ─────────────────────────────────────────────────── */}
      {view === 'table' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ background:'var(--bg)', borderBottom:'2px solid var(--border)' }}>
                  {['','ID','Name','Dept','Email','Phone','Gender','Salary','Status','Docs',showActions&&'Actions',''].filter(Boolean).map(h=>(
                    <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontWeight:700, color:'var(--text-light)', fontSize:12, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp._id} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'transparent':'var(--bg)' }}>
                    <td style={{ padding:'10px 14px' }}><Avatar emp={emp} size={36} /></td>
                    <td style={{ padding:'10px 14px' }}><code style={{ fontSize:12, color:'var(--text-light)' }}>{emp.employeeId}</code></td>
                    <td style={{ padding:'10px 14px' }}>
                      <button onClick={() => setViewEmp(emp)}
                        style={{ background:'none', border:'none', fontWeight:700, cursor:'pointer', color:'var(--primary)', padding:0, fontSize:14 }}>
                        {emp.name}
                      </button>
                    </td>
                    <td style={{ padding:'10px 14px', color:'var(--text-light)' }}>{emp.department}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text-light)', fontSize:13 }}>{emp.email}</td>
                    <td style={{ padding:'10px 14px', color:'var(--text-light)' }}>{emp.phonenumber}</td>
                    <td style={{ padding:'10px 14px', textTransform:'capitalize', color:'var(--text-light)' }}>{emp.gender}</td>
                    <td style={{ padding:'10px 14px', fontWeight:600 }}>
                      {emp.salary ? `₹${emp.salary.toLocaleString('en-IN')}` : <span style={{ color:'var(--text-light)' }}>—</span>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>{statusBadge(emp.status)}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        {emp.profilePictureUrl && (
                          <button className="btn btn-outline btn-sm" title="View Profile Photo"
                            onClick={() => setViewImg({ url: imgUrl(emp.profilePictureUrl), title:`${emp.name} — Profile Photo` })}>🖼️</button>
                        )}
                        {emp.aadharPhotoUrl && (
                          <button className="btn btn-outline btn-sm" title="View Aadhar Card"
                            onClick={() => setViewImg({ url: imgUrl(emp.aadharPhotoUrl), title:`${emp.name} — Aadhar Card` })}>🪪</button>
                        )}
                      </div>
                    </td>
                    {showActions && (
                      <td style={{ padding:'10px 14px' }}>
                        {emp.status === 'pending' ? (
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleStatus(emp,'approved')}>✓ Approve</button>
                            <button className="btn btn-danger btn-sm"  onClick={() => handleStatus(emp,'rejected')}>✗ Reject</button>
                          </div>
                        ) : (
                          <span style={{ color:'var(--text-light)', fontSize:13 }}>
                            {emp.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                        )}
                      </td>
                    )}
                    {/* Delete dustbin */}
                    <td style={{ padding:'10px 14px' }}>
                      <button onClick={() => setDelConfirm(emp)} title="Delete employee"
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#ef4444', padding:'4px 6px', borderRadius:6,
                          transition:'background 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'}
                        onMouseLeave={e=>e.currentTarget.style.background='none'}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign:'center', color:'var(--text-light)', padding:40 }}>No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── GRID view ──────────────────────────────────────────────────── */}
      {view === 'grid' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {filtered.map(emp => (
            <div key={emp._id} className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:14, position:'relative' }}>
              {/* Delete button top-right */}
              <button onClick={() => setDelConfirm(emp)} title="Delete"
                style={{ position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#ef4444', padding:'4px 6px', borderRadius:6 }}
                onMouseEnter={e=>e.currentTarget.style.background='#fee2e2'}
                onMouseLeave={e=>e.currentTarget.style.background='none'}>
                🗑️
              </button>

              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Avatar emp={emp} size={56} />
                  {emp.profilePictureUrl && (
                    <button onClick={() => setViewImg({ url:imgUrl(emp.profilePictureUrl), title:`${emp.name} — Profile` })}
                      style={{ position:'absolute', bottom:-2, right:-2, background:'#fff', border:'1px solid var(--border)', borderRadius:'50%', width:22, height:22, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      🔍
                    </button>
                  )}
                </div>
                <div style={{ minWidth:0 }}>
                  <button onClick={() => setViewEmp(emp)}
                    style={{ background:'none', border:'none', fontWeight:700, fontSize:15, cursor:'pointer', color:'var(--text)', padding:0, textAlign:'left', display:'block' }}>
                    {emp.name}
                  </button>
                  <div style={{ color:'var(--text-light)', fontSize:12, marginTop:2 }}>{emp.department}</div>
                  <div style={{ marginTop:6 }}>{statusBadge(emp.status)}</div>
                </div>
              </div>

              <div style={{ fontSize:13, display:'flex', flexDirection:'column', gap:6 }}>
                <GRow icon="🪪" label={emp.employeeId} />
                <GRow icon="📧" label={emp.email} />
                <GRow icon="📱" label={emp.phonenumber} />
                <GRow icon="💰" label={emp.salary ? `₹${emp.salary.toLocaleString('en-IN')}` : 'Salary not set'} muted={!emp.salary} />
              </div>

              <div style={{ display:'flex', gap:8 }}>
                {emp.aadharPhotoUrl && (
                  <button className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }}
                    onClick={() => setViewImg({ url:imgUrl(emp.aadharPhotoUrl), title:`${emp.name} — Aadhar Card` })}>
                    🪪 View Aadhar
                  </button>
                )}
              </div>

              {showActions && emp.status === 'pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-success btn-sm" style={{ flex:1, justifyContent:'center' }}
                    onClick={() => handleStatus(emp,'approved')}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm" style={{ flex:1, justifyContent:'center' }}
                    onClick={() => handleStatus(emp,'rejected')}>✗ Reject</button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', color:'var(--text-light)', padding:48 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👥</div><p>No employees found</p>
            </div>
          )}
        </div>
      )}

      {/* ── Approve + salary modal ────────────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:400 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
              <Avatar emp={selected.emp} size={48} />
              <div>
                <h2 style={{ margin:0, fontSize:18 }}>Approve Employee</h2>
                <p style={{ margin:0, color:'var(--text-light)', fontSize:13 }}>{selected.emp.email}</p>
              </div>
            </div>
            <p style={{ color:'var(--text-light)', marginBottom:20, fontSize:14 }}>
              Set a monthly salary for <strong>{selected.emp.name}</strong>. An approval email will be sent automatically.
            </p>
            <div className="form-group">
              <label>Monthly Salary (₹) <span style={{ color:'var(--text-light)', fontSize:12 }}>optional</span></label>
              <input type="number" placeholder="e.g. 50000" value={salary} onChange={e=>setSalary(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-success" disabled={loading}
                onClick={() => doUpdate(selected.emp._id, 'approved', salary||null)}>
                {loading ? 'Approving…' : '✓ Confirm & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ──────────────────────────────────────── */}
      {delConfirm && (
        <div className="modal-overlay" onClick={() => setDelConfirm(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:380 }}>
            <h2 style={{ marginBottom:12 }}>🗑️ Delete Employee</h2>
            <p style={{ color:'var(--text-light)', marginBottom:24 }}>
              Are you sure you want to permanently delete <strong>{delConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={loading} onClick={() => handleDelete(delConfirm._id)}>
                {loading ? 'Deleting…' : '🗑️ Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image viewer modal ───────────────────────────────────────── */}
      {viewImg && (
        <ImageViewerModal url={viewImg.url} title={viewImg.title} onClose={() => setViewImg(null)} />
      )}

      {/* ── Employee detail modal ─────────────────────────────────────── */}
      {viewEmp && (
        <div className="modal-overlay" onClick={() => setViewEmp(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:540 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <h2 style={{ margin:0 }}>Employee Details</h2>
              <button onClick={() => setViewEmp(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--text-light)' }}>✕</button>
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24, padding:16, background:'var(--bg)', borderRadius:12 }}>
              <Avatar emp={viewEmp} size={72} />
              <div>
                <div style={{ fontWeight:800, fontSize:20 }}>{viewEmp.name}</div>
                <div style={{ color:'var(--text-light)', fontSize:13 }}>{viewEmp.email}</div>
                <div style={{ marginTop:8 }}>{statusBadge(viewEmp.status)}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px' }}>
              {[
                ['Employee ID', viewEmp.employeeId],
                ['Department',  viewEmp.department],
                ['Phone',       viewEmp.phonenumber],
                ['Gender',      viewEmp.gender],
                ['Salary',      viewEmp.salary ? `₹${viewEmp.salary.toLocaleString('en-IN')}` : 'Not set'],
                ['Aadhar No.',  viewEmp.aadharCard],
                ['Joining Date',viewEmp.joiningDate ? new Date(viewEmp.joiningDate).toLocaleDateString('en-IN') : '—'],
                ['Address',     viewEmp.address],
              ].map(([label,val]) => (
                <div key={label} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{label}</div>
                  <div style={{ fontWeight:600, fontSize:14, wordBreak:'break-word' }}>{val||'—'}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, display:'flex', gap:10 }}>
              {viewEmp.profilePictureUrl && (
                <button className="btn btn-outline btn-sm"
                  onClick={() => { setViewEmp(null); setViewImg({ url:imgUrl(viewEmp.profilePictureUrl), title:`${viewEmp.name} — Profile` }); }}>
                  🖼️ Profile Photo
                </button>
              )}
              {viewEmp.aadharPhotoUrl && (
                <button className="btn btn-outline btn-sm"
                  onClick={() => { setViewEmp(null); setViewImg({ url:imgUrl(viewEmp.aadharPhotoUrl), title:`${viewEmp.name} — Aadhar` }); }}>
                  🪪 Aadhar Card
                </button>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop:20 }}>
              <button className="btn btn-outline" onClick={() => setViewEmp(null)}>Close</button>
              {showActions && viewEmp.status === 'pending' && (
                <>
                  <button className="btn btn-success" onClick={() => { setViewEmp(null); handleStatus(viewEmp,'approved'); }}>✓ Approve</button>
                  <button className="btn btn-danger"  onClick={() => { setViewEmp(null); handleStatus(viewEmp,'rejected'); }}>✗ Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
function TasksTab({ tasks, approved, onTaskCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title:'', description:'', assignedTo:'',
    task_priority:'Medium', time_given:'', estimated_hours:'',
    completion_date:'', dueDate:''
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('all');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // BUG FIX: selected employee preview
  const selectedEmployee = approved.find(e => e._id === form.assignedTo) || null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title||!form.description||!form.assignedTo||!form.time_given||!form.estimated_hours||!form.completion_date||!form.dueDate) {
      setError('Please fill all fields'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/tasks`, { method:'POST', headers:authH(), body:JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        setSuccess('✅ Task assigned! Email sent to employee.');
        setShowModal(false);
        setForm({ title:'',description:'',assignedTo:'',task_priority:'Medium',time_given:'',estimated_hours:'',completion_date:'',dueDate:'' });
        onTaskCreated();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed');
      }
    } catch { setError('Server error'); }
    finally  { setLoading(false); }
  };

  const filtered = filter==='all' ? tasks : tasks.filter(t=>t.status===filter);

  return (
    <>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h1>Tasks</h1><p>Assign and track team tasks</p></div>
        <button className="btn btn-blue" onClick={() => setShowModal(true)}>＋ Assign Task</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {['all','pending','in progress','on-hold','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid var(--border)',
              background: filter===s ? 'var(--primary)' : 'transparent',
              color: filter===s ? '#fff' : 'var(--text)',
              fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'var(--bg)', borderBottom:'2px solid var(--border)' }}>
                {['Title','Assigned To','Dept','Priority','Status','Due Date','Est. Hrs'].map(h=>(
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'var(--text-light)', fontSize:12, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t,i) => (
                <tr key={t._id} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'transparent':'var(--bg)' }}>
                  <td style={{ padding:'11px 16px', fontWeight:700 }}>{t.title}</td>
                  <td style={{ padding:'11px 16px' }}>{t.assignedTo?.name||'—'}</td>
                  <td style={{ padding:'11px 16px', color:'var(--text-light)', fontSize:13 }}>{t.assignedTo?.department||'—'}</td>
                  <td style={{ padding:'11px 16px' }}><span className={`badge badge-${PC[t.task_priority]||'medium'}`}>{t.task_priority}</span></td>
                  <td style={{ padding:'11px 16px' }}><span className={`badge badge-${t.status.replace(' ','-')}`}>{t.status}</span></td>
                  <td style={{ padding:'11px 16px', fontSize:13, color:'var(--text-light)' }}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding:'11px 16px', color:'var(--text-light)' }}>{t.estimated_hours}h</td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-light)', padding:40 }}>No tasks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Task modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:560 }}>
            <h2>Assign New Task</h2>
            <p style={{ color:'var(--text-light)', fontSize:13, marginBottom:20 }}>
              An email notification will be sent to the assigned employee automatically.
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Task Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Fix login bug" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the task…" rows={3}
                  style={{ resize:'vertical' }} />
              </div>

              {/* BUG FIX: Assign To with dynamic employee preview */}
              <div className="form-group">
                <label>Assign To *</label>
                <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                  <option value="">— Select approved employee —</option>
                  {approved.map(e => (
                    <option key={e._id} value={e._id}>{e.name} — {e.department}</option>
                  ))}
                </select>
                {/* Dynamic selected employee preview */}
                {selectedEmployee && (
                  <div style={{ marginTop:10, padding:'10px 14px', background:'var(--bg)', borderRadius:8, border:'1.5px solid var(--border)',
                    display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, flexShrink:0 }}>
                      {selectedEmployee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{selectedEmployee.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-light)' }}>
                        {selectedEmployee.department} · {selectedEmployee.email}
                      </div>
                    </div>
                    <span style={{ marginLeft:'auto', background:'#dcfce720', color:'#22c55e', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                      ✓ Selected
                    </span>
                  </div>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="task_priority" value={form.task_priority} onChange={handleChange}>
                    <option>Minor</option><option>Medium</option><option>Major</option><option>Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Given (hrs) *</label>
                  <input name="time_given" type="number" value={form.time_given} onChange={handleChange} placeholder="8" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Estimated Hours *</label>
                  <input name="estimated_hours" type="number" value={form.estimated_hours} onChange={handleChange} placeholder="6" />
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Completion Date *</label>
                <input name="completion_date" type="date" value={form.completion_date} onChange={handleChange} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-blue" disabled={loading}>
                  {loading ? 'Assigning…' : '📧 Assign & Notify Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatCard({ icon, num, lbl, color='var(--primary)' }) {
  return (
    <div className="stat-card" style={{ borderLeft:`4px solid ${color}` }}>
      <div className="icon">{icon}</div>
      <div><div className="num" style={{ color }}>{num}</div><div className="lbl">{lbl}</div></div>
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px' }}>
      <span style={{ fontSize:26 }}>{icon}</span>
      <div><div style={{ fontSize:22, fontWeight:800 }}>{value}</div><div style={{ fontSize:13, color:'var(--text-light)' }}>{label}</div></div>
    </div>
  );
}

function TglBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      style={{ padding:'6px 14px', borderRadius:6, border:'none',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-light)',
        fontSize:13, fontWeight:600, cursor:'pointer' }}>
      {label}
    </button>
  );
}

function GRow({ icon, label, muted }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ color:muted?'var(--text-light)':'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:13 }}>{label}</span>
    </div>
  );
}

// ── Image Viewer Modal — with loading skeleton & no-download fix ──────────────
// "Open full size downloads" is fixed server-side in fileRoutes.js by setting
// Content-Disposition: inline. This component adds a shimmer skeleton so
// the user sees feedback while the image loads.
function ImageViewerModal({ url, title, onClose }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:620 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 style={{ margin:0, fontSize:16 }}>{title}</h2>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--text-light)' }}>✕</button>
        </div>

        <div style={{
          position:'relative', minHeight:180, borderRadius:10, overflow:'hidden',
          background:'var(--bg)', border:'1px solid var(--border)'
        }}>
          {!imgLoaded && !imgError && (
            <div style={{
              position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:12,
            }}>
              <div style={{ fontSize:32 }}>🖼️</div>
              <div style={{ fontSize:13, color:'var(--text-light)' }}>Loading image…</div>
            </div>
          )}
          {imgError && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:8 }}>
              <div style={{ fontSize:36 }}>❌</div>
              <p style={{ color:'var(--text-light)', fontSize:14 }}>Failed to load image</p>
            </div>
          )}
          <img
            src={url}
            alt="Document"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgLoaded(true); setImgError(true); }}
            style={{
              width:'100%', borderRadius:10, objectFit:'contain',
              maxHeight:520, display: imgLoaded && !imgError ? 'block' : 'none',
              background:'#f8fafc'
            }}
          />
        </div>

        <div className="modal-footer" style={{ justifyContent:'center', marginTop:16 }}>
         
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}