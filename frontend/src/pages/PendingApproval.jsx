import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PendingApproval = () => {
  const { user, employee, logout } = useContext(AuthContext);

  const registrationDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : employee?.createdAt 
      ? new Date(employee.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Recently';

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EAF6FF 0%, #DCEEFF 50%, #F7FBFF 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '48px 40px',
        width: '100%', maxWidth: '540px', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(37,99,235,0.12)'
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '2px solid rgba(245, 158, 11, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.8rem', margin: '0 auto 24px',
          animation: 'pulse 2s infinite'
        }}>⏳</div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: '#1e293b' }}>
          Account <span style={{ color: '#f59e0b' }}>Pending Approval</span>
        </h2>
        
        <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '32px', fontSize: '0.95rem' }}>
          Your registration request has been sent to your company administrator. 
          Your account is currently under review. You will receive access once your administrator approves your request.
        </p>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '14px', padding: '24px', marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee Name</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{employee?.name || user?.email?.split('@')[0] || 'N/A'}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#2563eb' }}>{user?.company_name || 'N/A'}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registration Date</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{registrationDate}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</span>
              <span style={{
                fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                padding: '4px 14px', borderRadius: '999px'
              }}>Pending Approval</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%', padding: '14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)', borderRadius: '12px',
            fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s', letterSpacing: '0.3px',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--danger)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
        >
          Log Out
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;
