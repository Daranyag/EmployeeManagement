import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, employee, token, API_URL, updateProfile } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0, pendingLeaves: 0, openComplaints: 0, pendingApprovals: 0 });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState('');

  // Employee profile edit state
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, [API_URL, token]);

  const fetchPendingApprovals = useCallback(async () => {
    setLoadingApprovals(true);
    try {
      const res = await fetch(`${API_URL}/approvals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error('Failed to load approvals', err);
    } finally {
      setLoadingApprovals(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchPendingApprovals();
    } else if (employee) {
      setPhone(employee.phone || '');
      setAddress(employee.address || '');
      setEmergencyContact(employee.emergency_contact || '');
      setProfilePhoto(employee.profile_photo || '');
    }
  }, [user, employee]);

  const handleApprovalAction = async (userId, action) => {
    setApprovalMsg('');
    try {
      const res = await fetch(`${API_URL}/approvals/${userId}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApprovalMsg(`✅ ${data.message}`);
        // Refresh stats + approvals list
        fetchStats();
        fetchPendingApprovals();
      } else {
        setApprovalMsg(`⚠ ${data.message}`);
      }
    } catch (err) {
      setApprovalMsg('⚠ Action failed. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await updateProfile({
        phone,
        address,
        emergency_contact: emergencyContact,
        profile_photo: profilePhoto
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Error updating password');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Admin Dashboard ───────────────────────────────────────────
  if (user?.role === 'admin') {
    const pendingOnly = pendingRequests.filter(r => r.status === 'pending');
    const rejectedOnly = pendingRequests.filter(r => r.status === 'rejected');

    return (
      <div>
        <h1 style={{ marginBottom: '6px', fontSize: '2.2rem', fontWeight: 800 }}>
          Welcome Back, <span style={{ color: 'var(--accent-color)' }}>Admin</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Company workspace overview — manage employees and review registration requests.
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Employees</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{stats.totalEmployees}</span>
          </div>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Staff</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--success)' }}>{stats.activeEmployees}</span>
          </div>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Leaves</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>{stats.pendingLeaves}</span>
          </div>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Tickets</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: 'var(--danger)' }}>{stats.openComplaints}</span>
          </div>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {stats.pendingApprovals > 0 && (
              <span style={{
                position: 'absolute', top: '12px', right: '12px',
                background: '#f59e0b', color: '#000', fontSize: '0.65rem',
                fontWeight: 800, padding: '2px 8px', borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>NEW</span>
            )}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Approvals</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', color: '#f59e0b' }}>{stats.pendingApprovals}</span>
          </div>
        </div>

        {/* Approval Action Feedback */}
        {approvalMsg && (
          <div style={{
            background: approvalMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${approvalMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)'}`,
            color: approvalMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.9rem'
          }}>
            {approvalMsg}
          </div>
        )}

        {/* Pending Registration Requests */}
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                Pending Registration Requests
                {pendingOnly.length > 0 && (
                  <span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    color: '#fff',
                    fontSize: '0.75rem', fontWeight: 800, padding: '3px 12px',
                    borderRadius: '999px', letterSpacing: '0.5px'
                  }}>
                    {pendingOnly.length} Pending
                  </span>
                )}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Employee self-registration requests awaiting your approval
              </p>
            </div>
            <button
              onClick={() => { fetchStats(); fetchPendingApprovals(); }}
              style={{
                background: 'transparent', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>

          {loadingApprovals ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
              <p style={{ fontSize: '0.9rem' }}>Loading registration requests...</p>
            </div>
          ) : pendingOnly.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--text-secondary)', fontSize: '0.9rem'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 16px'
              }}>✅</div>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>All caught up!</p>
              <p>No pending approval requests at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingOnly.map((req) => {
                const initials = (req.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const regDate = new Date(req.createdAt);
                const dateStr = regDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const timeStr = regDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={req.user_id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    transition: 'border-color 0.2s, background 0.2s'
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    {/* Avatar */}
                    <div style={{ flexShrink: 0 }}>
                      {req.profile_photo ? (
                        <img
                          src={req.profile_photo}
                          alt={req.name}
                          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.35))',
                        border: '2px solid rgba(99,102,241,0.4)',
                        display: req.profile_photo ? 'none' : 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)'
                      }}>
                        {initials}
                      </div>
                    </div>

                    {/* Employee Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{req.name}</span>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.3)',
                          padding: '2px 10px', borderRadius: '999px'
                        }}>⏳ Pending</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{req.email}</div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {req.employee_id && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ opacity: 0.6 }}>ID:</span>
                            <strong style={{ color: 'var(--text-primary)' }}>{req.employee_id}</strong>
                          </span>
                        )}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ opacity: 0.6 }}>Company:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{req.company_name}</strong>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ opacity: 0.6 }}>Dept:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{req.department}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dateStr}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{timeStr}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.7 }}>Registration Date</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleApprovalAction(req.user_id, 'accept')}
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.25))',
                          border: '1px solid rgba(16,185,129,0.5)',
                          color: '#10b981',
                          padding: '8px 20px', borderRadius: '10px',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.25))'; e.currentTarget.style.transform = 'none'; }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleApprovalAction(req.user_id, 'reject')}
                        style={{
                          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.18))',
                          border: '1px solid rgba(239,68,68,0.4)',
                          color: '#ef4444',
                          padding: '8px 20px', borderRadius: '10px',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.18))'; e.currentTarget.style.transform = 'none'; }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rejected Requests (collapsed section) */}
        {rejectedOnly.length > 0 && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--danger)' }}>
              Rejected Requests ({rejectedOnly.length})
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Employee', 'Email', 'Company', 'Registered On', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: '0.78rem', color: 'var(--text-secondary)',
                        textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rejectedOnly.map((req) => (
                    <tr key={req.user_id} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.7 }}>
                      <td style={{ padding: '12px 14px', fontSize: '0.9rem', fontWeight: 600 }}>{req.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.email}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.company_name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}{' '}
                        <span style={{ opacity: 0.7 }}>{new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)',
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                          padding: '3px 10px', borderRadius: '999px'
                        }}>Rejected</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Employee Profile Dashboard ────────────────────────────────
  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '6px', fontSize: '2.2rem', fontWeight: 800 }}>
        My <span style={{ color: 'var(--accent-color)' }}>Profile</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        View your employment details and keep your contact details updated.
      </p>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '30px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '30px', flexWrap: 'wrap' }}>
          <img
            src={employee?.profile_photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(employee?.name || 'E') + '&background=6366f1&color=fff&size=150'}
            alt="Profile"
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-color)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{employee?.name}</h2>
            <p style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{employee?.designation} • {employee?.department}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>Employee ID: {employee?.employee_id}</p>
          </div>
        </div>

        {!editing ? (
          <div>
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 40px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Email Address</span>
                <span style={{ fontSize: '1.05rem' }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Phone Number</span>
                <span style={{ fontSize: '1.05rem' }}>{employee?.phone || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Physical Address</span>
                <span style={{ fontSize: '1.05rem' }}>{employee?.address || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Emergency Contact</span>
                <span style={{ fontSize: '1.05rem' }}>{employee?.emergency_contact || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Joined Date</span>
                <span style={{ fontSize: '1.05rem' }}>{employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Salary (Locked)</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>${employee?.salary?.toLocaleString() || '0'}</span>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="glow-btn"
              style={{ marginTop: '30px' }}
            >
              Edit Contact Info
            </button>

            {/* Change Password Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px', marginTop: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Change Password</h3>
              {pwSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                  {pwSuccess}
                </div>
              )}
              {pwError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                  {pwError}
                </div>
              )}
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered Email</label>
                    <input
                      type="email"
                      className="custom-input"
                      value={user?.email || ''}
                      readOnly
                      style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="custom-input"
                        style={{ paddingRight: '45px' }}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-secondary)',
                          padding: '0'
                        }}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="custom-input"
                        style={{ paddingRight: '45px' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-secondary)',
                          padding: '0'
                        }}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="custom-input"
                        style={{ paddingRight: '45px' }}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-secondary)',
                          padding: '0'
                        }}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="glow-btn" disabled={pwLoading}>
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="text"
                  className="custom-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Emergency Contact</label>
                <input
                  type="text"
                  className="custom-input"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  required
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Physical Address</label>
                <textarea
                  className="custom-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Photo URL</label>
                <input
                  type="text"
                  className="custom-input"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="submit" className="glow-btn">Save Changes</button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
