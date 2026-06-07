'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ActionsPage() {
  // Lists data states
  const [subsystems, setSubsystems] = useState([]);
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [actions, setActions] = useState([]);
  const [roles, setRoles] = useState([]);

  // UI States
  const [activeTab, setActiveTab] = useState('subsystems'); // 'subsystems', 'modules', 'submodules', 'actions'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals Open States
  const [createSubsystemOpen, setCreateSubsystemOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createSubmoduleOpen, setCreateSubmoduleOpen] = useState(false);
  const [createActionOpen, setCreateActionOpen] = useState(false);

  // Form States
  const [subsystemForm, setSubsystemForm] = useState({
    subSystemName: '',
    subSystemKey: ''
  });

  const [moduleForm, setModuleForm] = useState({
    moduleName: '',
    moduleKey: '',
    subSystemKey: ''
  });

  const [submoduleForm, setSubmoduleForm] = useState({
    subModuleName: '',
    subModuleKey: '',
    moduleKey: '',
    subSystemKey: ''
  });

  const [actionForm, setActionForm] = useState({
    actionKey: '',
    userRoleKey: '',
    subModuleKey: '',
    moduleKey: '',
    subSystemKey: ''
  });

  // Fetch all datasets on mount
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [subsRes, modsRes, subsModsRes, actsRes, rolesRes] = await Promise.all([
        api.getSubsystems(),
        api.getModules(),
        api.getSubmodules(),
        api.getActions(true),
        api.getUserRoles()
      ]);

      if (subsRes && subsRes.success) {
        setSubsystems(subsRes.data?.subSystems || []);
      }
      if (modsRes && modsRes.success) {
        setModules(modsRes.data?.modules || []);
      }
      if (subsModsRes && subsModsRes.success) {
        setSubmodules(subsModsRes.data?.modules || []); // API returns modules array for submodules
      }
      if (actsRes && actsRes.success) {
        setActions(actsRes.data?.actions || []);
      }
      if (rolesRes && rolesRes.success) {
        setRoles(rolesRes.data?.userRole || []);
      }
    } catch (err) {
      console.error('Error fetching actions data:', err);
      setError('Could not load actions configuration from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Form auto-fill helper keys
  const handleSubsystemNameChange = (e) => {
    const name = e.target.value;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSubsystemForm(prev => ({ ...prev, subSystemName: name, subSystemKey: key }));
  };

  const handleModuleNameChange = (e) => {
    const name = e.target.value;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setModuleForm(prev => ({ ...prev, moduleName: name, moduleKey: key }));
  };

  const handleSubmoduleNameChange = (e) => {
    const name = e.target.value;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSubmoduleForm(prev => ({ ...prev, subModuleName: name, subModuleKey: key }));
  };

  // Auto-derivation of parent keys on dropdown selections
  const handleModuleSelect = (e) => {
    const modKey = e.target.value;
    const matchedMod = modules.find(m => m.moduleKey === modKey);
    setSubmoduleForm(prev => ({
      ...prev,
      moduleKey: modKey,
      subSystemKey: matchedMod ? matchedMod.subSystemKey : ''
    }));
  };

  const handleSubmoduleSelect = (e) => {
    const subKey = e.target.value;
    const matchedSub = submodules.find(s => s.subModuleKey === subKey);
    setActionForm(prev => ({
      ...prev,
      subModuleKey: subKey,
      moduleKey: matchedSub ? matchedSub.moduleKey : '',
      subSystemKey: matchedSub ? matchedSub.subSystemKey : ''
    }));
  };

  // Submission handlers
  const handleCreateSubsystem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await api.createSubsystem(subsystemForm);
      if (res && res.success) {
        setSuccessMsg(`Subsystem "${subsystemForm.subSystemName}" created successfully.`);
        setCreateSubsystemOpen(false);
        setSubsystemForm({ subSystemName: '', subSystemKey: '' });
        fetchAllData();
      } else {
        setModalError(res.message || 'Failed to create subsystem.');
      }
    } catch (err) {
      setModalError(err.message || 'Error creating subsystem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const res = await api.createModule(moduleForm);
      if (res && res.success) {
        setSuccessMsg(`Module "${moduleForm.moduleName}" created successfully.`);
        setCreateModuleOpen(false);
        setModuleForm({ moduleName: '', moduleKey: '', subSystemKey: '' });
        fetchAllData();
      } else {
        setModalError(res.message || 'Failed to create module.');
      }
    } catch (err) {
      setModalError(err.message || 'Error creating module.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmodule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      // Find the matched subsystem name
      const matchedSubsystem = subsystems.find(s => s.subSystemKey === submoduleForm.subSystemKey);
      const matchedModule = modules.find(m => m.moduleKey === submoduleForm.moduleKey);
      
      const payload = {
        ...submoduleForm,
        // The API expects capitalised moduleKey in the submodule create parameters based on data dumps
        moduleName: matchedModule ? matchedModule.moduleName : '',
        subSystemName: matchedSubsystem ? matchedSubsystem.subSystemName : ''
      };

      const res = await api.createSubmodule(payload);
      if (res && res.success) {
        setSuccessMsg(`Submodule "${submoduleForm.subModuleName}" created successfully.`);
        setCreateSubmoduleOpen(false);
        setSubmoduleForm({ subModuleName: '', subModuleKey: '', moduleKey: '', subSystemKey: '' });
        fetchAllData();
      } else {
        setModalError(res.message || 'Failed to create submodule.');
      }
    } catch (err) {
      setModalError(err.message || 'Error creating submodule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');
    try {
      const matchedSubmodule = submodules.find(s => s.subModuleKey === actionForm.subModuleKey);
      const matchedRole = roles.find(r => r.userRoleKey === actionForm.userRoleKey);

      const payload = {
        ...actionForm,
        subModuleName: matchedSubmodule ? matchedSubmodule.subModuleName : '',
        userRoleName: matchedRole ? matchedRole.userRoleName : ''
      };

      const res = await api.createAction(payload);
      if (res && res.success) {
        setSuccessMsg(`Action mapping for key "${actionForm.actionKey}" created successfully.`);
        setCreateActionOpen(false);
        setActionForm({ actionKey: '', userRoleKey: '', subModuleKey: '', moduleKey: '', subSystemKey: '' });
        fetchAllData();
      } else {
        setModalError(res.message || 'Failed to create action mapping.');
      }
    } catch (err) {
      setModalError(err.message || 'Error creating action mapping.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering for active tab
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase();
    switch (activeTab) {
      case 'subsystems':
        return subsystems.filter(s => 
          s.subSystemName.toLowerCase().includes(query) || 
          s.subSystemKey.toLowerCase().includes(query)
        );
      case 'modules':
        return modules.filter(m => 
          m.moduleName.toLowerCase().includes(query) || 
          m.moduleKey.toLowerCase().includes(query) ||
          m.subSystemName?.toLowerCase().includes(query)
        );
      case 'submodules':
        return submodules.filter(s => 
          s.subModuleName.toLowerCase().includes(query) || 
          s.subModuleKey.toLowerCase().includes(query) ||
          s.moduleName?.toLowerCase().includes(query)
        );
      case 'actions':
        return actions.filter(a => 
          a.actionKey.toLowerCase().includes(query) || 
          a.userRoleKey.toLowerCase().includes(query) || 
          a.subModuleKey.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Actions & Hierarchy</h1>
          <p className="subtitle">Configure system subsystems, modules, submodules, and permission mappings</p>
        </div>
        <div>
          {activeTab === 'subsystems' && (
            <button className="btn-primary" onClick={() => { setModalError(''); setCreateSubsystemOpen(true); }}>
              <i className="fa-solid fa-plus"></i> Create Subsystem
            </button>
          )}
          {activeTab === 'modules' && (
            <button className="btn-primary" onClick={() => { setModalError(''); setCreateModuleOpen(true); }}>
              <i className="fa-solid fa-plus"></i> Create Module
            </button>
          )}
          {activeTab === 'submodules' && (
            <button className="btn-primary" onClick={() => { setModalError(''); setCreateSubmoduleOpen(true); }}>
              <i className="fa-solid fa-plus"></i> Create Submodule
            </button>
          )}
          {activeTab === 'actions' && (
            <button className="btn-primary" onClick={() => { setModalError(''); setCreateActionOpen(true); }}>
              <i className="fa-solid fa-plus"></i> Map Action
            </button>
          )}
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

      <div className="widget">
        <div className="widget-header">
          <div className="inner-tabs" style={{ padding: 0 }}>
            {[
              { id: 'subsystems', label: 'Subsystems' },
              { id: 'modules', label: 'Modules' },
              { id: 'submodules', label: 'Submodules' },
              { id: 'actions', label: 'Action Mappings' }
            ].map(tab => (
              <button 
                key={tab.id} 
                className={`inner-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="search-bar" style={{ width: '250px' }}>
            <i className="fa-solid fa-search"></i>
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Fetching database hierarchy records...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-folder-open"></i>
              <p>No configuration elements found in this category.</p>
            </div>
          ) : (
            <table>
              {activeTab === 'subsystems' && (
                <>
                  <thead>
                    <tr>
                      <th>Subsystem Name</th>
                      <th>Subsystem Key</th>
                      <th>System ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(sub => (
                      <tr key={sub._id || sub.subSystemKey}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{sub.subSystemName}</strong></td>
                        <td><span className="code-badge">{sub.subSystemKey}</span></td>
                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sub._id}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'modules' && (
                <>
                  <thead>
                    <tr>
                      <th>Module Name</th>
                      <th>Module Key</th>
                      <th>Parent Subsystem</th>
                      <th>System ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(mod => (
                      <tr key={mod._id || mod.moduleKey}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{mod.moduleName}</strong></td>
                        <td><span className="code-badge">{mod.moduleKey}</span></td>
                        <td>{mod.subSystemName} <span className="code-badge" style={{ fontSize: '0.75rem' }}>{mod.subSystemKey}</span></td>
                        <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{mod._id}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'submodules' && (
                <>
                  <thead>
                    <tr>
                      <th>Submodule Name</th>
                      <th>Submodule Key</th>
                      <th>Parent Module</th>
                      <th>Subsystem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(sub => (
                      <tr key={sub._id || sub.subModuleKey}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{sub.subModuleName}</strong></td>
                        <td><span className="code-badge">{sub.subModuleKey}</span></td>
                        <td>{sub.moduleName} <span className="code-badge" style={{ fontSize: '0.75rem' }}>{sub.moduleKey}</span></td>
                        <td>{sub.subSystemName} <span className="code-badge" style={{ fontSize: '0.75rem' }}>{sub.subSystemKey}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'actions' && (
                <>
                  <thead>
                    <tr>
                      <th>Permission Key</th>
                      <th>Target User Role</th>
                      <th>Target Submodule</th>
                      <th>Target Module</th>
                      <th>Target Subsystem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((act, index) => (
                      <tr key={`${act._id || act.actionKey}-${act.userRoleKey || index}`}>
                        <td>
                          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontFamily: 'monospace', fontWeight: 600 }}>
                            {act.actionKey}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            {act.userRoleKey?.toUpperCase() || act.userRoleName?.toUpperCase()}
                          </span>
                        </td>
                        <td>{act.subModuleName || act.subModuleKey}</td>
                        <td>{act.moduleName || act.moduleKey}</td>
                        <td><span className="code-badge">{act.subSystemKey}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          )}
        </div>
      </div>

      {/* Create Subsystem Modal */}
      {createSubsystemOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Subsystem</h2>
              <button className="close-btn" onClick={() => setCreateSubsystemOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateSubsystem} className="modal-form">
              {modalError && (
                <div className="alert-banner error-modal">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-group">
                <label>Subsystem Name</label>
                <input 
                  type="text" 
                  value={subsystemForm.subSystemName} 
                  onChange={handleSubsystemNameChange} 
                  placeholder="e.g. CRM" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Subsystem Key</label>
                <input 
                  type="text" 
                  value={subsystemForm.subSystemKey} 
                  onChange={(e) => setSubsystemForm(prev => ({ ...prev, subSystemKey: e.target.value }))} 
                  placeholder="e.g. crm" 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCreateSubsystemOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {createModuleOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Module</h2>
              <button className="close-btn" onClick={() => setCreateModuleOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateModule} className="modal-form">
              {modalError && (
                <div className="alert-banner error-modal">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-group">
                <label>Parent Subsystem</label>
                <select 
                  value={moduleForm.subSystemKey} 
                  onChange={(e) => setModuleForm(prev => ({ ...prev, subSystemKey: e.target.value }))}
                  required
                >
                  <option value="">-- Select Subsystem --</option>
                  {subsystems.map(s => (
                    <option key={s.subSystemKey} value={s.subSystemKey}>{s.subSystemName} ({s.subSystemKey})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Module Name</label>
                <input 
                  type="text" 
                  value={moduleForm.moduleName} 
                  onChange={handleModuleNameChange} 
                  placeholder="e.g. Permissions" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Module Key</label>
                <input 
                  type="text" 
                  value={moduleForm.moduleKey} 
                  onChange={(e) => setModuleForm(prev => ({ ...prev, moduleKey: e.target.value }))} 
                  placeholder="e.g. permissions" 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCreateModuleOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Submodule Modal */}
      {createSubmoduleOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Submodule</h2>
              <button className="close-btn" onClick={() => setCreateSubmoduleOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateSubmodule} className="modal-form">
              {modalError && (
                <div className="alert-banner error-modal">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-group">
                <label>Parent Module</label>
                <select 
                  value={submoduleForm.moduleKey} 
                  onChange={handleModuleSelect}
                  required
                >
                  <option value="">-- Select Module --</option>
                  {modules.map(m => (
                    <option key={m.moduleKey} value={m.moduleKey}>{m.moduleName} ({m.moduleKey})</option>
                  ))}
                </select>
              </div>
              {submoduleForm.subSystemKey && (
                <div className="form-group">
                  <label>Derived Subsystem Key</label>
                  <input type="text" value={submoduleForm.subSystemKey.toUpperCase()} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              )}
              <div className="form-group">
                <label>Submodule Name</label>
                <input 
                  type="text" 
                  value={submoduleForm.subModuleName} 
                  onChange={handleSubmoduleNameChange} 
                  placeholder="e.g. Users" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Submodule Key</label>
                <input 
                  type="text" 
                  value={submoduleForm.subModuleKey} 
                  onChange={(e) => setSubmoduleForm(prev => ({ ...prev, subModuleKey: e.target.value }))} 
                  placeholder="e.g. users" 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCreateSubmoduleOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Action Modal */}
      {createActionOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Map Action Permission</h2>
              <button className="close-btn" onClick={() => setCreateActionOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAction} className="modal-form">
              {modalError && (
                <div className="alert-banner error-modal">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{modalError}</span>
                </div>
              )}
              <div className="form-group">
                <label>Target Submodule</label>
                <select 
                  value={actionForm.subModuleKey} 
                  onChange={handleSubmoduleSelect}
                  required
                >
                  <option value="">-- Select Submodule --</option>
                  {submodules.map(s => (
                    <option key={s.subModuleKey} value={s.subModuleKey}>{s.subModuleName} ({s.subModuleKey})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target User Role</label>
                <select 
                  value={actionForm.userRoleKey} 
                  onChange={(e) => setActionForm(prev => ({ ...prev, userRoleKey: e.target.value }))}
                  required
                >
                  <option value="">-- Select Role --</option>
                  {roles.map(r => (
                    <option key={r.userRoleKey} value={r.userRoleKey}>{r.userRoleName} ({r.userRoleKey})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Action Key (Permission Code)</label>
                <input 
                  type="text" 
                  value={actionForm.actionKey} 
                  onChange={(e) => setActionForm(prev => ({ ...prev, actionKey: e.target.value }))} 
                  placeholder="e.g. ac-110" 
                  required 
                />
              </div>
              {actionForm.moduleKey && (
                <div className="form-row">
                  <div className="form-group half">
                    <label>Derived Module</label>
                    <input type="text" value={actionForm.moduleKey} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group half">
                    <label>Derived Subsystem</label>
                    <input type="text" value={actionForm.subSystemKey} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCreateActionOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner-mini"></span> : 'Map Permission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .alert-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
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

        .alert-banner.error-modal {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          margin-bottom: 0.5rem;
          padding: 0.6rem 0.8rem;
          font-size: 0.85rem;
        }

        .close-alert {
          margin-left: auto;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1rem;
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
          color: rgba(255, 255, 255, 0.1);
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .code-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 2px 6px;
          font-family: monospace;
          color: var(--text-secondary);
          font-size: 0.85rem;
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
          max-width: 450px;
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
        }

        .modal-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
