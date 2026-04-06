

const BASE = 'http://localhost:5000/api';


const getToken = () => localStorage.getItem('token');


const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});


export const loginUser = (email, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

export const registerEmployee = (data) =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

// ── Admin: employees ──────────────────────────────────────────────────────────
export const getAllEmployees = () =>
  fetch(`${BASE}/admin/employees`, { headers: headers() }).then(r => r.json());

export const getApprovedEmployees = () =>
  fetch(`${BASE}/admin/employees/approved`, { headers: headers() }).then(r => r.json());

export const updateEmployeeStatus = (id, status) =>
  fetch(`${BASE}/admin/employees/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status })
  }).then(r => r.json());

// ── Admin: tasks ──────────────────────────────────────────────────────────────
export const createTask = (data) =>
  fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data)
  }).then(r => r.json());

export const getAllTasks = () =>
  fetch(`${BASE}/tasks`, { headers: headers() }).then(r => r.json());

// ── Employee: tasks ───────────────────────────────────────────────────────────
export const getMyTasks = () =>
  fetch(`${BASE}/tasks/my-tasks`, { headers: headers() }).then(r => r.json());

export const updateTaskStatus = (id, status) =>
  fetch(`${BASE}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status })
  }).then(r => r.json());