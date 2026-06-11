/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse, capitalizeWord, formatErrorMessage } from '@/lib/helpers';

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  // State variables
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Organisations list state
  const [organisationsList, setOrganisationsList] = useState([]);
  
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

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getEmployees();
      const data = normalizeApiResponse(response, 'employees');

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
      setError('Could not fetch employees from the server.');
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

  const fetchOrganisations = async () => {
    try {
      const res = await api.getOrganisations();
      const data = normalizeApiResponse(res, 'orgs', 'organisations');
      
      const custom = typeof window !== 'undefined' && localStorage.getItem('pm_custom_orgs')
        ? JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]')
        : [];

      const baseOrgs = data.length > 0 ? data : [{ _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo' }, { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena' }];
      const uniqueCustom = custom.filter(c => !baseOrgs.some(b => b.name === c.name || b._id === c._id));
      const mergedNames = [...baseOrgs, ...uniqueCustom].map(org => org.name);
      setOrganisationsList(mergedNames);
    } catch (err) {
      console.warn('Could not fetch organisations', err);
      const custom = typeof window !== 'undefined' && localStorage.getItem('pm_custom_orgs')
        ? JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]')
        : [];
      const mergedNames = ['Sportizo', 'PlayArena', ...custom.map(org => org.name)];
      setOrganisationsList(mergedNames);
    }
  };

  // Parallel fetch on mount
  useEffect(() => {
    Promise.all([fetchEmployees(), fetchMetadata(), fetchOrganisations()]);
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

    // Determine default organization
    let defaultOrg = 'Sportizo';
    if (isAdmin) {
      if (organisationsList.length > 0) {
        defaultOrg = organisationsList[0];
      }
    } else {
      defaultOrg = user?.organization || 'Sportizo';
    }

    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      mobileNumber: '',
      department: deptsList[0] || 'administration',
      userRole: rolesList[0] || 'admin',
      organization: defaultOrg,
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

  // Create employee submission
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const matchedRole = rolesObjects.find(r => r.userRoleKey === formData.userRole || r.userRoleName?.toLowerCase() === formData.userRole);
      const userType = matchedRole ? matchedRole.userType : (formData.userRole === 'admin' ? 'admin' : 'employee');
      const isAdminUserType = formData.userRole === 'admin';
      
      if (!isAdminUserType && !formData.organization) {
        setModalError('Organization is strictly mandatory for non-Admin users.');
        setIsSubmitting(false);
        return;
      }
      
      await api.createEmployee({
        ...formData,
        mobileNumber: Number(formData.mobileNumber) || 0,
        userType,
        organization: isAdminUserType ? [] : formData.organization
      });
      setInviteModalOpen(false);
      showToast('Staff member invited successfully', 'success');
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
      const userType = matchedRole ? matchedRole.userType : (formData.userRole === 'admin' ? 'admin' : 'employee');
      const isAdminUserType = formData.userRole === 'admin';
      
      if (!isAdminUserType && !formData.organization) {
        setModalError('Organization is strictly mandatory for non-Admin users.');
        setIsSubmitting(false);
        return;
      }

      await api.updateEmployee({
        ...formData,
        mobileNumber: Number(formData.mobileNumber) || 0,
        userType,
        organization: isAdminUserType ? [] : formData.organization,
        originalEmployeeCode: selectedEmployee.employeeCode
      });
      setEditModalOpen(false);
      showToast('Staff member updated successfully', 'success');
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

  const isSelectedAdmin = formData.userRole === 'admin';

  // Shared form JSX for both invite and edit modals
  const renderEmployeeForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit} className="modal-form">
      {modalError && (
        <div className="form-error-banner">
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
          <label>{submitLabel === 'Apply Changes' ? 'Employee Code (Locked)' : 'Employee Code'}</label>
          <input
            type="text"
            name="employeeCode"
            value={formData.employeeCode}
            onChange={handleInputChange}
            required={submitLabel !== 'Apply Changes'}
            disabled={submitLabel === 'Apply Changes'}
            style={submitLabel === 'Apply Changes' ? {opacity: 0.6, cursor: 'not-allowed'} : {}}
          />
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
              <option key={r} value={r}>{capitalizeWord(r)}</option>
            ))}
          </select>
        </div>
        <div className="form-group half">
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleInputChange}>
            {deptsList.map(d => (
              <option key={d} value={d}>{capitalizeWord(d)}</option>
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
          <label htmlFor="organization">Organization</label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            required={!isSelectedAdmin}
            disabled={isSelectedAdmin || !isAdmin}
          >
            {isSelectedAdmin ? (
              <option value="">Not Applicable (Admin)</option>
            ) : !isAdmin ? (
              <option value={user?.organization || formData.organization || 'Sportizo'}>
                {user?.organization || formData.organization || 'Sportizo'}
              </option>
            ) : (
              [...new Set([formData.organization, ...organisationsList])].filter(Boolean).map(org => (
                <option key={org} value={org}>{org}</option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={() => { setInviteModalOpen(false); setEditModalOpen(false); }}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? <span className="spinner-mini"></span> : submitLabel}
        </button>
      </div>
    </form>
  );

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
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Team Member">
        {renderEmployeeForm(handleInviteSubmit, 'Send Invitation')}
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modify Staff Member">
        {renderEmployeeForm(handleEditSubmit, 'Apply Changes')}
      </Modal>
    </div>
  );
}
