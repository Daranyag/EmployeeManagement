import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ComplaintSystem = () => {
  const { user, token, API_URL } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');
  const [messageContent, setMessageContent] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('Open');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/complaints' : '/complaints/me';
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRaise = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, category, message: messageContent })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit complaint');
      }
      setSuccess('Complaint ticket successfully raised.');
      setSubject('');
      setMessageContent('');
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/complaints/${selectedComplaint.ticket_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: ticketStatus, response: responseMsg })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update ticket');
      }
      setSuccess('Ticket response and status updated successfully.');
      setResponseMsg('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Complaint <span style={{ color: 'var(--accent-color)' }}>Desk</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'admin' ? 'Review feedback, respond to employee queries and update status logs.' : 'Raise issues and monitor ticket statuses.'}
        </p>
      </div>

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

      {user?.role === 'employee' && (
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Raise a Complaint</h3>
            <form onSubmit={handleRaise}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</label>
                <select className="custom-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="HR">HR Dept</option>
                  <option value="IT">IT Support</option>
                  <option value="Payroll">Payroll / Finance</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" className="custom-input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Message Description</label>
                <textarea className="custom-input" style={{ height: '100px', resize: 'vertical' }} value={messageContent} onChange={(e) => setMessageContent(e.target.value)} required />
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%' }}>Submit Ticket</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Raised Tickets</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Admin Response</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints raised yet.</td>
                    </tr>
                  ) : (
                    complaints.map((ticket) => (
                      <tr key={ticket.ticket_id}>
                        <td>{ticket.ticket_id}</td>
                        <td>{ticket.category}</td>
                        <td>
                          <strong>{ticket.subject}</strong>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{ticket.message}</p>
                        </td>
                        <td style={{ fontSize: '0.9rem', fontStyle: 'italic', color: ticket.response ? '#1F2937' : 'var(--text-secondary)' }}>
                          {ticket.response || 'Awaiting response...'}
                        </td>
                        <td>
                          <span style={{
                            color: ticket.status === 'Closed' ? 'var(--success)' : ticket.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)',
                            fontWeight: '600'
                          }}>{ticket.status}</span>
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
        <div>
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>All Employee Tickets</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No tickets found.</td>
                    </tr>
                  ) : (
                    complaints.map((ticket) => (
                      <tr key={ticket.ticket_id}>
                        <td>{ticket.ticket_id}</td>
                        <td>{ticket.employee_name} ({ticket.employee_id})</td>
                        <td>{ticket.category}</td>
                        <td>
                          <strong>{ticket.subject}</strong>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{ticket.message}</p>
                          {ticket.response && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '6px' }}>
                              <strong>Response:</strong> {ticket.response}
                            </p>
                          )}
                        </td>
                        <td style={{ fontWeight: '600', color: ticket.status === 'Closed' ? 'var(--success)' : ticket.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)' }}>
                          {ticket.status}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedComplaint(ticket);
                              setResponseMsg(ticket.response || '');
                              setTicketStatus(ticket.status);
                            }}
                            style={{ background: 'var(--accent-color)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Respond
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Respond Modal */}
          {selectedComplaint && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div className="glass-panel" style={{ padding: '30px', maxWidth: '500px', width: '90%' }}>
                <h3 style={{ marginBottom: '15px' }}>Respond to Ticket {selectedComplaint.ticket_id}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <strong>Subject:</strong> {selectedComplaint.subject}
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                  <strong>Message:</strong> {selectedComplaint.message}
                </p>
                <form onSubmit={handleRespond}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</label>
                    <select className="custom-input" value={ticketStatus} onChange={(e) => setTicketStatus(e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Response Message</label>
                    <textarea
                      className="custom-input"
                      style={{ height: '100px', resize: 'vertical' }}
                      value={responseMsg}
                      onChange={(e) => setResponseMsg(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(null)}
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glow-btn"
                      style={{ padding: '10px 18px' }}
                    >
                      Submit Response
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintSystem;
