import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const EmployeeManagement = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // holds employee to delete

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Editing tracker
  const [editEmpId, setEditEmpId] = useState(null);

  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setDepartment('');
    setDesignation('');
    setSalary('');
    setJoiningDate('');
    setProfilePhoto('');
    setEmergencyContact('');
    setEditEmpId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email, password, name, phone, address, department, designation,
          salary, joining_date: joiningDate, profile_photo: profilePhoto,
          emergency_contact: emergencyContact
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create employee');
      }
      setMessage('Employee created successfully!');
      clearForm();
      setShowCreateModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSelect = (emp) => {
    setEditEmpId(emp.employee_id);
    setName(emp.name);
    setPhone(emp.phone);
    setAddress(emp.address);
    setDepartment(emp.department);
    setDesignation(emp.designation);
    setSalary(emp.salary);
    setJoiningDate(emp.joining_date ? emp.joining_date.substring(0, 10) : '');
    setProfilePhoto(emp.profile_photo || '');
    setEmergencyContact(emp.emergency_contact || '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/employees/${editEmpId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, phone, address, department, designation, salary,
          joining_date: joiningDate, profile_photo: profilePhoto,
          emergency_contact: emergencyContact
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update employee');
      }
      setMessage('Employee details updated successfully!');
      clearForm();
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (emp) => {
    setDeleteModal(emp);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/employees/${deleteModal.employee_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete employee');
      }

      // UI Rules:
      // Show success message
      // Redirect automatically to Create Employee page (open create modal)
      // No page refresh
      // Clear form fields automatically
      setMessage('Employee account permanently deleted. Email remains locked.');
      clearForm();
      setDeleteModal(null);
      setShowCreateModal(true); // Auto-redirect to Create Employee
      fetchEmployees();
    } catch (err) {
      setError(err.message);
      setDeleteModal(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Employee <span style={{ color: 'var(--accent-color)' }}>Directory</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage profiles, salaries, roles, and status of workforce members.</p>
        </div>
        <button
          onClick={() => { clearForm(); setShowCreateModal(true); }}
          className="glow-btn"
        >
          Add New Employee
        </button>
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

      {/* Employee List Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="custom-input"
            placeholder="Search by name, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No active employees found.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{emp.user_id?.email}</td>
                    <td>${emp.salary.toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => handleEditSelect(emp)}
                        style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '6px 12px', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(emp)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 style={{ marginBottom: '20px' }}>Register Employee Account</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                  <input
                    type="email"
                    className="custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Initial Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="custom-input"
                      style={{ paddingRight: '45px' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. IT"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Designation</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Analyst"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Annual Salary ($)</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joining Date</label>
                  <input
                    type="date"
                    className="custom-input"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
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
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Photo URL</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Physical Address</label>
                <textarea
                  className="custom-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); clearForm(); }}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="glow-btn">Register Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2 style={{ marginBottom: '20px' }}>Edit Employee: {editEmpId}</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Designation</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Annual Salary ($)</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joining Date</label>
                  <input
                    type="date"
                    className="custom-input"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
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
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Photo URL</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Physical Address</label>
                <textarea
                  className="custom-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); clearForm(); }}
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="glow-btn">Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ padding: '30px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: 'var(--danger)' }}>Confirm Permanent Deletion</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete the profile of <strong>{deleteModal.name}</strong> ({deleteModal.employee_id})? 
              This action cannot be undone, and the email address <strong>{deleteModal.user_id?.email}</strong> will remain locked in the system.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ background: 'var(--danger)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
