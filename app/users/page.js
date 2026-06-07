'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function UsersPage() {
  // State variables
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    department: 'administration',
    userRole: 'admin',
    organization: 'Sportizo',
    employeeCode: '',
    designation: '',
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  
  // Metadata lists (roles, departments)
  const [rolesList, setRolesList] = useState(['admin', 'coach', 'operations', 'billing']);
  const [deptsList, setDeptsList] = useState(['administration', 'coaching', 'operations', 'facilities']);
  const [rolesObjects, setRolesObjects] = useState([]);

  // Fetch employees on component mount
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getEmployees();
      // Handle different formats that the API might return
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && response.data && Array.isArray(response.data.employees)) {
        data = response.data.employees;
      } else if (response && typeof response === 'object') {
        // Look for any array inside response
        const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
        if (arrayKey) {
          data = response[arrayKey];
        } else if (response.data && typeof response.data === 'object') {
          // Look inside response.data
          const innerKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
          if (innerKey) {
            data = response.data[innerKey];
          }
        }
      }

      // Normalize backend nested format to flat frontend schema
      const normalizedData = data.map(emp => {
        const roleName = emp.userRole || emp.userRoleName || 'member';
        let userRoleKey = roleName.toLowerCase().trim();
        if (userRoleKey === 'sponsored counsellor') userRoleKey = 'sponsored-counsellor';
        if (userRoleKey === 'security guard') userRoleKey = 'security-guard';
        if (userRoleKey === 'hrt (home room teacher)') userRoleKey = 'home-room-teacher';
        
        return {
          ...emp,
          firstName: emp.firstName || emp.userId?.name?.firstName || '',
          middleName: emp.middleName || emp.userId?.name?.middleName || '',
          lastName: emp.lastName || emp.userId?.name?.lastName || '',
          email: emp.email || emp.userId?.email?.address || emp.userId?.loginEmail?.address || '',
          mobileNumber: typeof emp.mobileNumber === 'object' ? emp.mobileNumber?.number : emp.mobileNumber || '',
          userRole: userRoleKey
        };
      });


      setEmployees(normalizedData);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Could not fetch employees from the server. Using offline mock data.');
      // Fallback mock data if server fails
      setEmployees([
        {
          firstName: 'Rohan',
          middleName: '',
          lastName: 'Mehta',
          email: 'rohan@playmetric.in',
          countryCode: '+91',
          mobileNumber: '9876543210',
          department: 'administration',
          userRole: 'admin',
          organization: 'Sportizo',
          employeeCode: 'EV-101',
          designation: 'Owner/Admin'
        },
        {
          firstName: 'Anjali',
          middleName: '',
          lastName: 'Desai',
          email: 'anjali.d@playmetric.in',
          countryCode: '+91',
          mobileNumber: '9876543211',
          department: 'operations',
          userRole: 'operations',
          organization: 'Sportizo',
          employeeCode: 'EV-102',
          designation: 'Venue Manager'
        },
        {
          firstName: 'Vikram',
          middleName: '',
          lastName: 'Singh',
          email: 'vikram.coach@playmetric.in',
          countryCode: '+91',
          mobileNumber: '9876543212',
          department: 'coaching',
          userRole: 'coach',
          organization: 'Sportizo',
          employeeCode: 'EV-103',
          designation: 'Head Coach'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata lists
  const fetchMetadata = async () => {
    try {
      const meta = await api.getMetadata();
      const deptsArray = meta?.data?.userDeptList || [];
      if (deptsArray.length > 0) {
        const keys = deptsArray.map(d => d.departmentKey);
        setDeptsList(keys);
      } else if (meta && meta.departments && Array.isArray(meta.departments)) {
        setDeptsList(meta.departments);
      }
    } catch (err) {
      console.warn('Could not fetch metadata from backend', err);
    }

    try {
      const rolesData = await api.getUserRoles();
      const rolesArray = rolesData?.data?.userRole || [];
      if (rolesArray.length > 0) {
        setRolesObjects(rolesArray);
        const keys = rolesArray.map(r => r.userRoleKey || r.userRoleName?.toLowerCase());
        setRolesList(keys);
      }
    } catch (err) {
      console.warn('Could not fetch user roles from backend', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchMetadata();
  }, []);

  // Handle Form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open invite modal
  const openInviteModal = () => {
    setModalError('');
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      mobileNumber: '',
      department: deptsList[0] || 'administration',
      userRole: rolesList[0] || 'admin',
      organization: 'Sportizo',
      employeeCode: `EV-${Math.floor(100 + Math.random() * 900)}`,
      designation: '',
    });
    setInviteModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (employee) => {
    setModalError('');
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      middleName: employee.middleName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      countryCode: employee.countryCode || '+91',
      mobileNumber: employee.mobileNumber || '',
      department: employee.department || 'administration',
      userRole: employee.userRole || 'admin',
      organization: employee.organization || 'Sportizo',
      employeeCode: employee.employeeCode || '',
      designation: employee.designation || '',
    });
    setEditModalOpen(true);
  };

  const formatErrorMessage = (errorString) => {
    try {
      const parsed = JSON.parse(errorString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(err => {
          if (err.message && err.message.includes('E11000 duplicate key error')) {
            if (err.message.includes('mobileNumber.number')) {
              return 'This mobile number is already registered to another user.';
            }
            if (err.message.includes('email')) {
              return 'This email address is already registered to another user.';
            }
            if (err.message.includes('employeeCode')) {
              return 'This employee code is already taken.';
            }
            return 'A record with duplicate unique details already exists.';
          }
          return err.message || JSON.stringify(err);
        }).join('\n');
      }
    } catch (e) {
      // Not a JSON error
    }
    
    if (errorString.includes('E11000 duplicate key error')) {
      if (errorString.includes('mobileNumber.number')) {
        return 'This mobile number is already registered to another user.';
      }
      return 'A duplicate key error occurred on the database.';
    }
    
    return errorString;
  };

  // Create employee submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const matchedRole = rolesObjects.find(r => r.userRoleKey === formData.userRole || r.userRoleName?.toLowerCase() === formData.userRole);
      const userType = matchedRole ? matchedRole.userType : 'employee';
      
      await api.createEmployee({
        ...formData,
        mobileNumber: Number(formData.mobileNumber) || 0,
        userType
      });
      setInviteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setModalError(formatErrorMessage(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit employee submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const matchedRole = rolesObjects.find(r => r.userRoleKey === formData.userRole || r.userRoleName?.toLowerCase() === formData.userRole);
      const userType = matchedRole ? matchedRole.userType : 'employee';

      // In PATCH /api/v1/staff/employee/edit/ we send the payload
      // We attach the employeeCode so the backend knows which record to update
      await api.updateEmployee({
        ...formData,
        mobileNumber: Number(formData.mobileNumber) || 0,
        userType,
        originalEmployeeCode: selectedEmployee.employeeCode // helper parameter in case backend needs matching
      });
      setEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setModalError(formatErrorMessage(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering logic
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const designation = (emp.designation || '').toLowerCase();
    const department = (emp.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || 
                          email.includes(query) || 
                          designation.includes(query) || 
                          department.includes(query);

    const matchesTab = activeTab === 'All' || 
                       (activeTab === 'Administrators' && (emp.userRole === 'admin' || emp.userRole === 'fees admin')) ||
                       (activeTab === 'Coaches' && (emp.userRole === 'coach' || emp.userRole === 'counsellor' || emp.userRole === 'sponsored-counsellor' || emp.userRole === 'home-room-teacher')) ||
                       (activeTab === 'Operations' && (emp.userRole === 'operations' || emp.userRole === 'security-guard' || emp.userRole === 'employee'));

    return matchesSearch && matchesTab;
  });

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Users & Staff</h1>
          <p className="subtitle">Manage roles, permissions, and internal team access from your backend database</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/users/roles" className="btn-primary" style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', textDecoration: 'none', color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-users-gear"></i> Manage Roles
          </Link>
          <button className="btn-primary" onClick={openInviteModal}>
            <i className="fa-solid fa-user-shield"></i> Invite Staff
          </button>
        </div>
      </div>

      {error && (
        <div className="warning-banner">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
          <button className="refresh-btn" onClick={fetchEmployees}><i className="fa-solid fa-rotate"></i> Retry</button>
        </div>
      )}

      <div className="widget">
        <div className="widget-header">
          <div className="inner-tabs" style={{ padding: 0 }}>
            {['All', 'Administrators', 'Coaches', 'Operations'].map(tab => (
              <button 
                key={tab} 
                className={`inner-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'All' ? 'All Staff' : tab}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ width: '250px' }}>
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Fetching active staff directory...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-users-slash"></i>
              <p>No staff members found matching criteria.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Employee Code</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => {
                  const initial = (emp.firstName || 'S').charAt(0).toUpperCase();
                  const roleColors = {
                    admin: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
                    'fees admin': { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' },
                    coach: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
                    counsellor: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
                    'sponsored-counsellor': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
                    'home-room-teacher': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
                    operations: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' },
                    'security-guard': { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' },
                    employee: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' },
                    billing: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
                  };
                  const colors = roleColors[emp.userRole] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
                  
                  const isAdminGradient = emp.userRole === 'admin' || emp.userRole === 'fees admin';
                  const isCoachGradient = emp.userRole === 'coach' || emp.userRole === 'counsellor' || emp.userRole === 'sponsored-counsellor' || emp.userRole === 'home-room-teacher';
                  
                  return (
                    <tr key={emp._id || emp.employeeCode || index}>
                      <td>
                        <div className="client-cell">
                          <div className="avatar-circle" style={{ background: `linear-gradient(135deg, ${isAdminGradient ? '#3b82f6, #60a5fa' : isCoachGradient ? '#10b981, #34d399' : '#8b5cf6, #a78bfa'})` }}>
                            {initial}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {`${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim()}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.designation || 'Staff'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="code-badge">{emp.employeeCode || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: colors.bg, color: colors.text, border: colors.border }}>
                          {emp.userRole?.toUpperCase() || 'MEMBER'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>{emp.department || 'General'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{emp.email}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{emp.countryCode} {emp.mobileNumber}</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn-text edit-btn" onClick={() => openEditModal(emp)}>
                          <i className="fa-solid fa-user-pen"></i> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="close-btn" onClick={() => setInviteModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
             <form onSubmit={handleInviteSubmit} className="modal-form">
              {modalError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem'
                }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Employee Code</label>
                  <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group quarter">
                  <label>Code</label>
                  <input type="text" name="countryCode" value={formData.countryCode} onChange={handleInputChange} required />
                </div>
                <div className="form-group three-quarter">
                  <label>Mobile Number</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Role</label>
                  <select name="userRole" value={formData.userRole} onChange={handleInputChange}>
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    {deptsList.map(d => (
                      <option key={d} value={d}>{d.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Designation</label>
                  <input type="text" name="designation" placeholder="e.g. Senior Coach" value={formData.designation} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Organization</label>
                  <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setInviteModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Modify Staff Member</h2>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
             <form onSubmit={handleEditSubmit} className="modal-form">
              {modalError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem'
                }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Employee Code (Locked)</label>
                  <input type="text" name="employeeCode" value={formData.employeeCode} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group quarter">
                  <label>Code</label>
                  <input type="text" name="countryCode" value={formData.countryCode} onChange={handleInputChange} required />
                </div>
                <div className="form-group three-quarter">
                  <label>Mobile Number</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Role</label>
                  <select name="userRole" value={formData.userRole} onChange={handleInputChange}>
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleInputChange}>
                    {deptsList.map(d => (
                      <option key={d} value={d}>{d.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} required />
                </div>
                <div className="form-group half">
                  <label>Organization</label>
                  <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .warning-banner {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          color: #f59e0b;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .refresh-btn {
          margin-left: auto;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: rgba(245, 158, 11, 0.2);
        }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          margin-right: 12px;
        }

        .code-badge {
          background: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 2px 6px;
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .edit-btn {
          color: #3b82f6 !important;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .empty-state i {
          font-size: 2.5rem;
          color: var(--border-color);
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1.5rem;
        }

        .modal-content {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          font-size: 1.25rem;
          margin: 0;
          font-weight: 600;
          color: var(--text-primary);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex-grow: 1;
        }

        .form-group.half {
          width: 50%;
        }

        .form-group.quarter {
          width: 25%;
        }

        .form-group.three-quarter {
          width: 75%;
        }

        .modal-form label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .modal-form input, .modal-form select {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          width: 100%;
        }

        .modal-form input:focus, .modal-form select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 1rem;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: var(--bg-surface-hover);
        }

        .btn-submit {
          background: #3b82f6;
          border: none;
          color: #fff;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 110px;
        }

        .btn-submit:hover {
          background: #2563eb;
        }

        .spinner-mini {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
