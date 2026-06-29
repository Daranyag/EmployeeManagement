import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LeaveManagement = () => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState('Sick');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/leaves' : '/leaves/me';
      const res = await fetch(`${API_URL}/api${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leave_type: leaveType, from_date: fromDate, to_date: toDate, reason })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit leave');
      }
      setMessage('Leave request submitted successfully!');
      setFromDate('');
      setToDate('');
      setReason('');
      fetchLeaves();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAction = async (leaveId, action) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update leave request');
      }
      setMessage(`Leave request successfully ${action.toLowerCase()}ed.`);
      fetchLeaves();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Leave <span style={{ color: 'var(--accent-color)' }}>Management</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'admin' ? 'Review, approve, and track employee leave logs.' : 'Apply for time off and view approval status.'}
        </p>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {user?.role === 'employee' && (
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Apply for Leave</h3>
            <form onSubmit={handleApply}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Leave Type</label>
                <select className="custom-input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From Date</label>
                <input type="date" className="custom-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To Date</label>
                <input type="date" className="custom-input" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reason</label>
                <textarea className="custom-input" style={{ height: '80px', resize: 'vertical' }} value={reason} onChange={(e) => setReason(e.target.value)} required />
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%' }}>Submit Application</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>My Leave History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No leaves filed yet.</td>
                    </tr>
                  ) : (
                    leaves.map((lv) => (
                      <tr key={lv.leave_id}>
                        <td>{lv.leave_id}</td>
                        <td>{lv.leave_type}</td>
                        <td>{new Date(lv.from_date).toLocaleDateString()} to {new Date(lv.to_date).toLocaleDateString()}</td>
                        <td>{lv.reason}</td>
                        <td>
                          <span style={{
                            color: lv.status === 'Approved' ? 'var(--success)' : lv.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)',
                            fontWeight: '600'
                          }}>{lv.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>All Leave Requests</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No leave requests found.</td>
                  </tr>
                ) : (
                  leaves.map((lv) => (
                    <tr key={lv.leave_id}>
                      <td>{lv.employee_name} ({lv.employee_id})</td>
                      <td>{lv.department}</td>
                      <td>{lv.leave_type}</td>
                      <td>{new Date(lv.from_date).toLocaleDateString()} - {new Date(lv.to_date).toLocaleDateString()}</td>
                      <td>{lv.reason}</td>
                      <td style={{ fontWeight: '600', color: lv.status === 'Approved' ? 'var(--success)' : lv.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)' }}>
                        {lv.status}
                      </td>
                      <td>
                        {lv.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleAction(lv.leave_id, 'Approved')}
                              style={{ background: 'var(--success)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(lv.leave_id, 'Rejected')}
                              style={{ background: 'var(--danger)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
