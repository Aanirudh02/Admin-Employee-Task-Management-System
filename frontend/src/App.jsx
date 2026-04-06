/* eslint-disable react-hooks/set-state-in-effect */
// src/App.jsx
import { useState, useEffect } from 'react';
import Login      from './pages/Login';
import Register   from './pages/Register';
import AdminDash  from './pages/AdminDash';
import EmployeeDash from './pages/EmployeeDash';
import './index.css';

export default function App() {
 
  const [page, setPage]   = useState('login');
  const [user, setUser]   = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const name  = localStorage.getItem('name');
    if (token && role) {
      setUser({ token, role, name });
      setPage(role === 'admin' ? 'admin' : 'employee');
    }
  }, []);

 
  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role',  userData.role);
    localStorage.setItem('name',  userData.name);
    setUser(userData);
    setPage(userData.role === 'admin' ? 'admin' : 'employee');
  };

 
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('login');
  };

  if (page === 'login')    return <Login    onLogin={handleLogin} goRegister={() => setPage('register')} />;
  if (page === 'register') return <Register goLogin={() => setPage('login')} />;
  if (page === 'admin')    return <AdminDash    user={user} onLogout={handleLogout} />;
  if (page === 'employee') return <EmployeeDash user={user} onLogout={handleLogout} />;
}