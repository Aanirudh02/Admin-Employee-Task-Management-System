/* eslint-disable no-unused-vars */
/* src/components/Layout.jsx */
import { useState } from 'react';

export default function Layout({ user, onLogout, navItems, activeTab, setActiveTab, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 240,
        background: 'var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Logo area */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            TaskFlow
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {user?.role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '11px 14px',
                marginBottom: 4,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: activeTab === item.id ? 600 : 400,
                background: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 10 }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ textTransform: 'capitalize', fontSize: 12 }}>{user?.role}</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onLogout}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: '100%', justifyContent: 'center' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}