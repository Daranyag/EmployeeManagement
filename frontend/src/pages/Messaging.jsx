import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

const Messaging = () => {
  const { user, employee, token, API_URL } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null); // employee_id for admin, 'admin' for employee
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchContacts();
    } else {
      setActiveContact('admin');
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCounts();
    const countsInterval = setInterval(fetchUnreadCounts, 4000);
    return () => clearInterval(countsInterval);
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 4000); // Auto poll messages history every 4s
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/unread-counts-per-contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCounts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    if (!activeContact) return;
    try {
      // Mark messages from this contact as read
      await fetch(`${API_URL}/messages/mark-read/${activeContact}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUnreadCounts(prev => ({ ...prev, [activeContact]: 0 }));

      // Fetch the updated history
      const res = await fetch(`${API_URL}/messages/history/${activeContact}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeContact) return;

    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: activeContact,
          message: typedMessage
        })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setTypedMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMyId = () => {
    if (user?.role === 'admin') return 'admin';
    return employee?.employee_id || '';
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Internal <span style={{ color: 'var(--accent-color)' }}>Messenger</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Instant secure messaging between Admin and Staff members.</p>
      </div>

      <div className="glass-panel chat-layout">
        {/* Contact List */}
        <div className="chat-contacts">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 5 }}>
            <h3 style={{ fontSize: '1rem' }}>{user?.role === 'admin' ? 'Employees' : 'Contacts'}</h3>
          </div>
          {user?.role === 'admin' ? (
            contacts.map((contact) => (
              <div
                key={contact.employee_id}
                onClick={() => setActiveContact(contact.employee_id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  background: activeContact === contact.employee_id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  transition: 'background 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{contact.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {contact.employee_id} • {contact.department}
                  </div>
                </div>
                {unreadCounts[contact.employee_id] > 0 && (
                  <span style={{
                    background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                    minWidth: '22px', height: '22px', borderRadius: '11px', padding: '0 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCounts[contact.employee_id]}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div
              onClick={() => setActiveContact('admin')}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                background: activeContact === 'admin' ? 'rgba(59,130,246,0.1)' : 'transparent',
                transition: 'background 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>Administrator</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Admin</div>
              </div>
              {unreadCounts['admin'] > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                  minWidth: '22px', height: '22px', borderRadius: '11px', padding: '0 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {unreadCounts['admin']}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {activeContact ? (
            <>
              {/* Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ fontSize: '1.1rem' }}>
                  {activeContact === 'admin' ? 'Company Administrator' : contacts.find(c => c.employee_id === activeContact)?.name || activeContact}
                </h3>
              </div>

              {/* Message List */}
              <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', fontSize: '0.9rem' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === getMyId();
                    const isAdmin = msg.sender_id === 'admin';
                    const bubbleBg = isAdmin ? '#2563eb' : '#10b981';
                    
                    return (
                      <div
                        key={msg.message_id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: bubbleBg,
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.4, color: '#ffffff' }}>{msg.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', textAlign: 'right', marginTop: '5px' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Type your message here..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  required
                />
                <button type="submit" className="glow-btn" style={{ padding: '12px 24px' }}>Send</button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              Select a contact to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
