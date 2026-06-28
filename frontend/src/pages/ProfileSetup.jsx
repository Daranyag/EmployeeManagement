import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProfileSetup = () => {
  const { updateProfile, user } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone || !address || !emergencyContact) {
      setError('Please fill in all mandatory fields');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        phone,
        address,
        emergency_contact: emergencyContact,
        profile_photo: profilePhoto || ''
      });
      // Profile successfully saved, user state will update
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 700, marginBottom: '8px' }}>
            Complete Your Profile
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Before accessing the dashboard, please complete your employee profile details.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Phone Number *
            </label>
            <input
              id="setup-phone"
              type="text"
              className="custom-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1234567890"
              required
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Emergency Contact (Name & Phone) *
            </label>
            <input
              id="setup-emergency"
              type="text"
              className="custom-input"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Jane Doe (+1987654321)"
              required
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Home Address *
            </label>
            <textarea
              id="setup-address"
              className="custom-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, City, Country"
              required
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit',
                padding: '12px'
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Profile Photo URL (Optional)
            </label>
            <input
              id="setup-photo"
              type="url"
              className="custom-input"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="e.g. https://example.com/avatar.jpg"
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
            />
          </div>

          <button
            id="setup-submit"
            type="submit"
            className="glow-btn"
            style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Complete Registration & Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
