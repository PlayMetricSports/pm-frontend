'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [actionMenu, setActionMenu] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedActions, setCheckedActions] = useState([]);
  const [allActions, setAllActions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Create Role Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    userRoleName: '',
    userRoleKey: '',
    userType: 'employee'
  });
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Fetch all user roles
  const fetchRoles = async (actionsList = null) => {
    setRolesLoading(true);
    try {
      const res = await api.getUserRoles();
      if (res && res.success) {
        const rolesData = res.data?.userRole || [];
        setRoles(rolesData);
        
        // Select the first role by default if none is selected
        if (!selectedRole && rolesData.length > 0) {
          selectRoleWithActions(rolesData[0], actionsList || allActions);
        }
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Could not load roles from backend.');
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch Action Menu tree structure
  const fetchActionMenu = async () => {
    try {
      const res = await api.getActionMenu();
      if (res && res.success) {
        setActionMenu(res.data?.actionMenu || []);
      }
    } catch (err) {
      console.error('Error fetching action menu:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setRolesLoading(true);
      try {
        // Parallelized loading of all required API datasets
        const [menuRes, rolesRes, actionsRes] = await Promise.all([
          api.getActionMenu(),
          api.getUserRoles(),
          api.getActions(true)
        ]);

        if (menuRes && menuRes.success) {
          setActionMenu(menuRes.data?.actionMenu || []);
        }

        let actionsList = [];
        if (actionsRes && actionsRes.success) {
          actionsList = actionsRes.data?.actions || [];
          setAllActions(actionsList);
        }

        let rolesList = [];
        if (rolesRes && rolesRes.success) {
          rolesList = rolesRes.data?.userRole || [];
          setRoles(rolesList);
        }

        // Initialize the first role with the fetched actions list
        if (rolesList.length > 0) {
          const defaultRole = rolesList[0];
          setSelectedRole(defaultRole);
          
          const assigned = actionsList
            .filter(act => act.userRoleKey === defaultRole.userRoleKey)
            .map(act => act.actionKey);
            
          setCheckedActions(assigned);
        }
      } catch (err) {
        console.error('Error loading roles initial data:', err);
        setError('Failed to load roles and action menu tree from backend.');
      } finally {
        setLoading(false);
        setRolesLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch all actions mapping to find active ones for the selected role
  const selectRoleWithActions = async (role, allActionsList = null) => {
    setSelectedRole(role);
    setSuccessMsg('');
    setError('');
    
    try {
      let actions = allActionsList || allActions;
      if (!actions || actions.length === 0) {
        const res = await api.getActions(true);
        actions = res?.data?.actions || [];
        setAllActions(actions);
      }
      
      // Filter actions where userRoleKey matches selected role's key
      const assigned = actions
        .filter(act => act.userRoleKey === role.userRoleKey)
        .map(act => act.actionKey);
        
      setCheckedActions(assigned);
    } catch (err) {
      console.error('Error fetching role actions mapping:', err);
      setCheckedActions([]);
    }
  };

  const handleRoleClick = (role) => {
    selectRoleWithActions(role, allActions);
  };

  // Handle checking/unchecking checkboxes
  const handleCheckboxChange = (actionKey) => {
    setCheckedActions(prev => {
      if (prev.includes(actionKey)) {
        return prev.filter(key => key !== actionKey);
      } else {
        return [...prev, actionKey];
      }
    });
  };

  // Auto-generate key from name for new role
  const handleRoleNameChange = (e) => {
    const name = e.target.value;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setRoleForm(prev => ({
      ...prev,
      userRoleName: name,
      userRoleKey: key
    }));
  };

  // Handle Create Role Form submission
  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRole(true);
    setError('');
    try {
      const res = await api.createUserRole(roleForm);
      if (res && res.success) {
        setCreateModalOpen(false);
        setRoleForm({ userRoleName: '', userRoleKey: '', userType: 'employee' });
        // Reload roles
        await fetchRoles();
        setSuccessMsg('Role created successfully!');
      } else {
        setError(res.message || 'Failed to create role.');
      }
    } catch (err) {
      setError(err.message || 'Error creating role.');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  // Handle Save Permissions
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingPermissions(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        userRoleName: selectedRole.userRoleName,
        userRoleKey: selectedRole.userRoleKey,
        userType: selectedRole.userType,
        actionIds: checkedActions
      };
      
      const res = await api.updateUserRoleActions(selectedRole._id, payload);
      if (res && res.success) {
        setSuccessMsg('Permissions updated successfully!');
        
        // Refresh local cache of mappings to stay in sync with the backend
        const actionsRes = await api.getActions(true);
        if (actionsRes && actionsRes.success) {
          setAllActions(actionsRes.data?.actions || []);
        }
      } else {
        setError(res.message || 'Failed to save permissions.');
      }
    } catch (err) {
      setError(err.message || 'Error saving permissions.');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  return (
    <div className="view active">
      {/* Header with back navigation */}
      <div className="roles-header">
        <Link href="/users" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Back to Users & Staff
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <div>
            <h1>Roles & Permissions</h1>
            <p className="subtitle">Configure fine-grained module access for team roles.</p>
          </div>
          <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> Create Role
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner success">
          <i className="fa-solid fa-circle-check"></i>
          <span>{successMsg}</span>
          <button className="close-alert" onClick={() => setSuccessMsg('')}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError('')}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="roles-layout">
        {/* Left column: Roles selection */}
        <div className="roles-card panel-left">
          <h3>Roles</h3>
          {rolesLoading ? (
            <div className="panel-loading">
              <div className="spinner-mini"></div>
              <span>Loading roles...</span>
            </div>
          ) : (
            <div className="roles-list">
              {roles.map(role => {
                const isSelected = selectedRole?._id === role._id;
                return (
                  <div 
                    key={role._id} 
                    className={`role-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleRoleClick(role)}
                  >
                    <div className="role-item-info">
                      <span className="role-name">{role.userRoleName}</span>
                      <span className="role-key">{role.userRoleKey}</span>
                    </div>
                    <span className={`role-badge ${role.isAdmin === 'yes' ? 'admin' : 'employee'}`}>
                      {role.isAdmin === 'yes' ? 'ADMIN' : role.userType.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Permissions mapping editor */}
        <div className="roles-card panel-right">
          <div className="panel-header">
            <h3>Permissions Matrix</h3>
            {selectedRole && (
              <span className="active-role-tag">
                Configuring: <strong>{selectedRole.userRoleName}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div className="panel-loading">
              <div className="spinner-mini"></div>
              <span>Loading action menu tree...</span>
            </div>
          ) : !selectedRole ? (
            <div className="empty-panel-state">
              <i className="fa-solid fa-user-shield"></i>
              <p>Select a role from the list to manage its permissions.</p>
            </div>
          ) : (
            <div className="permission-tree-container">
              <div className="permission-tree">
                {actionMenu.map(subsystem => (
                  <div key={subsystem.subSystemKey} className="subsystem-node">
                    <div className="node-header subsystem">
                      <i className="fa-solid fa-folder"></i>
                      <span>Subsystem: {subsystem.subSystemName}</span>
                    </div>
                    
                    <div className="modules-list">
                      {subsystem.modules?.map(module => (
                        <div key={module.moduleKey} className="module-node">
                          <div className="node-header module">
                            <i className="fa-solid fa-square-caret-down"></i>
                            <span>Module: {module.moduleName}</span>
                          </div>

                          <div className="submodules-list">
                            {module.subModules?.map(sub => {
                              const isChecked = checkedActions.includes(sub.actionKey);
                              return (
                                <div key={sub.subModuleKey} className="submodule-row">
                                  <label className="checkbox-container">
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleCheckboxChange(sub.actionKey)}
                                      disabled={selectedRole.isAdmin === 'yes'} 
                                    />
                                    <span className="checkmark"></span>
                                    <div className="checkbox-text">
                                      <span className="submodule-name">{sub.subModuleName}</span>
                                      <span className="submodule-key">{sub.subModuleKey} ({sub.actionKey})</span>
                                    </div>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel-footer">
                {selectedRole.isAdmin === 'yes' ? (
                  <p className="admin-notice">
                    <i className="fa-solid fa-circle-info"></i> Admin roles automatically have all permissions enabled by default and cannot be modified.
                  </p>
                ) : (
                  <button 
                    className="btn-primary" 
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                  >
                    {isSavingPermissions ? (
                      <>
                        <span className="spinner-mini" style={{ marginRight: '6px' }}></span> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i> Save Permissions
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {createModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Role</h2>
              <button className="close-btn" onClick={() => setCreateModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateRoleSubmit} className="modal-form">
              <div className="form-group">
                <label>Role Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Venue Manager"
                  value={roleForm.userRoleName} 
                  onChange={handleRoleNameChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Role Key (Identifier)</label>
                <input 
                  type="text" 
                  placeholder="e.g. venue-manager"
                  value={roleForm.userRoleKey} 
                  onChange={(e) => setRoleForm(prev => ({ ...prev, userRoleKey: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label>User Type Category</label>
                <select 
                  value={roleForm.userType} 
                  onChange={(e) => setRoleForm(prev => ({ ...prev, userType: e.target.value }))}
                >
                  <option value="employee">Employee / Staff</option>
                  <option value="admin">Administrator</option>
                  <option value="test">Testing/Other</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmittingRole}>
                  {isSubmittingRole ? <span className="spinner-mini"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .roles-header {
          margin-bottom: 2rem;
        }

        .back-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--text-primary);
        }

        .alert-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          animation: slideIn 0.3s ease-out;
        }

        .alert-banner.success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .alert-banner.error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .close-alert {
          margin-left: auto;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
          padding: 2px;
          display: flex;
        }

        .roles-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .roles-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .roles-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .panel-header h3 {
          margin-bottom: 0;
        }

        .active-role-tag {
          font-size: 0.85rem;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .roles-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 600px;
        }

        .role-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .role-item:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-color);
        }

        .role-item.active {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .role-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .role-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .role-key {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .role-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .role-badge.admin {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .role-badge.employee {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
        }

        .panel-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 4rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          flex-grow: 1;
        }

        .empty-panel-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-secondary);
          padding: 6rem 2rem;
          text-align: center;
          flex-grow: 1;
        }

        .empty-panel-state i {
          font-size: 2.5rem;
          opacity: 0.2;
        }

        .permission-tree-container {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .permission-tree {
          flex-grow: 1;
          overflow-y: auto;
          max-height: 550px;
          padding-right: 4px;
          margin-bottom: 1.5rem;
        }

        .subsystem-node {
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .node-header.subsystem {
          background: var(--bg-surface-hover);
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .node-header.subsystem i {
          color: #f59e0b;
        }

        .modules-list {
          padding: 0.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .module-node {
          border-left: 2px dashed var(--border-color);
          padding-left: 1rem;
        }

        .node-header.module {
          color: var(--text-primary);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 0 10px 0;
        }

        .node-header.module i {
          color: #8b5cf6;
          font-size: 0.9rem;
        }

        .submodules-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.75rem;
          padding: 4px 0;
        }

        .submodule-row {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          transition: all 0.2s;
        }

        .submodule-row:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-color);
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          position: relative;
          padding-left: 28px;
          cursor: pointer;
          font-size: 0.85rem;
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: absolute;
          top: 2px;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          transition: all 0.2s;
        }

        .checkbox-container:hover input ~ .checkmark {
          background-color: var(--bg-surface-hover);
          border-color: var(--text-secondary);
        }

        .checkbox-container input:checked ~ .checkmark {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }

        .checkbox-container .checkmark:after {
          left: 5px;
          top: 2px;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .submodule-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .submodule-key {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .panel-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          display: flex;
          justify-content: flex-end;
        }

        .admin-notice {
          font-size: 0.85rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
          padding: 8px 12px;
          border-radius: 8px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Modal backdrop and contents styling */
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
          max-width: 440px;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
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
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
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
          padding: 0.65rem 0.8rem;
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
          margin-top: 0.5rem;
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
          min-width: 100px;
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
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
