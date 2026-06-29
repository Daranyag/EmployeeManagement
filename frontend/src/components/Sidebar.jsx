import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeMenu }) => {
  const { user, employee, logout, token, API_URL } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [token, API_URL]);

  const activeStyle = {
    background: 'rgba(37, 99, 235, 0.08)',
    borderLeft: '4px solid var(--accent-color)',
    color: 'var(--accent-color)',
    paddingLeft: '16px',
    fontWeight: '600'
  };

  const linkStyle = {
    display: 'block',
    padding: '12px 12px 12px 20px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    borderRadius: '0 8px 8px 0',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    borderLeft: '4px solid transparent'
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        <div style={{ paddingBottom: '30px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            EM<span style={{ color: 'var(--accent-color)' }}>System</span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Logged in as: <strong style={{ color: 'var(--accent-color)' }}>{user?.role?.toUpperCase()}</strong>
          </p>
          {employee && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '6px', fontWeight: 500 }}>
              {employee.name} ({employee.employee_id})
            </p>
          )}
        </div>

        <nav>
          <NavLink to="/" onClick={closeMenu} style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle} end>
            Dashboard
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/employees" onClick={closeMenu} style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}>
              Employees
            </NavLink>
          )}

          <NavLink to="/leaves" onClick={closeMenu} style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}>
            Leaves
          </NavLink>

          <NavLink to="/complaints" onClick={closeMenu} style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}>
            Complaints
          </NavLink>

          <NavLink to="/messages" onClick={closeMenu} style={({ isActive }) => isActive ? { ...linkStyle, ...activeStyle } : linkStyle}>
            Messages
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--danger)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                marginLeft: '8px',
                verticalAlign: 'middle'
              }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>

      <button
        onClick={() => { closeMenu(); logout(); }}
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--danger)',
          padding: '12px',
          borderRadius: '10px',
          width: '100%',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          textAlign: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--danger)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
          e.currentTarget.style.color = 'var(--danger)';
        }}
      >
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;
