import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const features = [
  { icon: '👤', text: 'Employee Profile Management' },
  { icon: '🗓️', text: 'Leave Request & Approval System' },
  { icon: '💬', text: 'Complaint & Support Management' },
  { icon: '📨', text: 'Secure Internal Messaging' },
  { icon: '🏢', text: 'Company-Based Employee Management' },
  { icon: '📊', text: 'Real-Time Admin Dashboard' },
  { icon: '🔐', text: 'Role-Based Secure Access' },
  { icon: '📱', text: 'Responsive Across All Devices' },
];

const HeroSection = () => (
  <div style={{
    flex: 1,
    background: 'linear-gradient(150deg, #1e40af 0%, #2563eb 45%, #3b82f6 80%, #60a5fa 100%)',
    padding: '60px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100%',
  }}>
    {/* Decorative background circles */}
    <div style={{
      position: 'absolute', top: '-80px', right: '-80px',
      width: '300px', height: '300px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
    }} />
    <div style={{
      position: 'absolute', bottom: '-60px', left: '-60px',
      width: '240px', height: '240px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
    }} />

    {/* Logo badge */}
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px', padding: '8px 18px',
      marginBottom: '36px', width: 'fit-content'
    }}>
      <span style={{ fontSize: '1.4rem' }}>🏗️</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.5px' }}>HRMS Platform</span>
    </div>

    <h1 style={{
      fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800,
      color: '#fff', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px'
    }}>
      Join Your<br />Company<br />
      <span style={{ color: '#93c5fd' }}>Workspace</span>
    </h1>
    <p style={{
      fontSize: '1.05rem', color: 'rgba(255,255,255,0.78)',
      lineHeight: 1.6, marginBottom: '40px', maxWidth: '380px'
    }}>
      Create your account to access the employee portal. Admins can set up a new company workspace, and employees can join an existing one.
    </p>

    {/* Feature list */}
    <div style={{
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '16px', padding: '24px 28px', marginBottom: '36px'
    }}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px'
      }}>Platform Features</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem' }}>{f.icon}</span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ borderLeft: '3px solid rgba(255,255,255,0.4)', paddingLeft: '18px' }}>
      <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, fontStyle: 'italic' }}>
        "Manage your employees with confidence. Track attendance, handle leave requests, communicate efficiently, and keep your workforce organized from one secure platform."
      </p>
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '11px 16px', borderRadius: '10px',
  border: '1.5px solid #e2e8f0', fontSize: '0.92rem',
  background: '#f8fafc', color: '#1e293b', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signup(name, email, password, role, company);
      if (result.pending) {
        setPendingData({ email: result.user?.email || email, company_name: result.user?.company_name || company });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending Approval Confirmation Screen ─────────────────────
  if (pendingData) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EAF6FF 0%, #DCEEFF 50%, #F7FBFF 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '48px 40px',
          width: '100%', maxWidth: '500px', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(37,99,235,0.12)'
        }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.8rem', margin: '0 auto 24px'
          }}>✅</div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>
            Registration <span style={{ color: '#10b981' }}>Submitted!</span>
          </h2>
          <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '28px', fontSize: '0.95rem' }}>
            Your account request has been sent to the administrator for review. You'll be able to log in once they approve your registration.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px', padding: '20px', marginBottom: '28px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>{pendingData.email}</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563eb' }}>{pendingData.company_name}</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                <span style={{
                  fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b',
                  background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                  padding: '3px 12px', borderRadius: '999px'
                }}>⏳ Pending Approval</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>What happens next?</p>
            {[
              { icon: '📋', text: 'Your admin will be notified of your registration request' },
              { icon: '✅', text: 'Once approved, your account becomes active' },
              { icon: '🔑', text: 'You can then log in using your email and password' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                <span style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>{step.text}</span>
              </div>
            ))}
          </div>

          <Link
            to="/login"
            style={{
              display: 'block', textDecoration: 'none', textAlign: 'center',
              padding: '13px', width: '100%', borderRadius: '12px',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              boxSizing: 'border-box', boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EAF6FF 0%, #DCEEFF 50%, #F7FBFF 100%)',
    }}>
      {/* ── Left Hero Panel ── */}
      <div style={{ display: 'none', flex: '0 0 50%', minHeight: '100vh' }} className="signup-hero-panel">
        <HeroSection />
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mobile-only branding */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              borderRadius: '14px', padding: '10px 20px', marginBottom: '16px'
            }}>
              <span style={{ fontSize: '1.3rem' }}>🏗️</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>EMSystem</span>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px', color: '#1e293b' }}>
              Create Account
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Register with your company to enter the system</p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(37,99,235,0.10), 0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(37,99,235,0.08)'
          }}>
            {/* Info banner for employees */}
            {role === 'employee' && (
              <div style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.18)',
                borderRadius: '10px', padding: '11px 14px', marginBottom: '18px',
                fontSize: '0.82rem', color: '#64748b',
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
                <span>Employee registrations require <strong style={{ color: '#1e293b' }}>admin approval</strong> before you can log in. The company must already exist in the system.</span>
              </div>
            )}

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#dc2626',
                padding: '12px 16px', borderRadius: '10px',
                marginBottom: '18px', fontSize: '0.88rem', textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Company Name</label>
                <input
                  id="signup-company"
                  type="text"
                  style={inputStyle}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={role === 'admin' ? 'Create your company name' : 'Must match existing admin company'}
                  required
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  required
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '46px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    required
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      color: '#94a3b8', padding: '0'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Portal Role</label>
                <select
                  id="signup-role"
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', letterSpacing: '0.3px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)'
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}
              >
                {loading
                  ? (role === 'admin' ? 'Creating Account...' : 'Submitting Request...')
                  : (role === 'admin' ? 'Create Admin Account →' : 'Submit Registration Request →')
                }
              </button>

              <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Already have an account? </span>
                <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 900px) {
          .signup-hero-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
