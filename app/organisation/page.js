/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse } from '@/lib/helpers';

export default function OrganisationPage() {
  const { showToast } = useToast();

  // Organisations State
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgError, setOrgError] = useState('');
  
  // Modals
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // Selected for Edit
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Forms
  const [orgForm, setOrgForm] = useState({ name: '', domainUrl: '', organisationNumber: '', mainOffice: '', orgSubDomain: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Mock Fallbacks
  const mockOrgs = [
    { _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo', domainUrl: 'sportizo.playmetric.com', organisationNumber: 'ORG-1010-10', mainOffice: 'Test Address 1', orgSubDomain: 'sportizo' },
    { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena', domainUrl: 'playarena.playmetric.com', organisationNumber: 'ORG-2020-20', mainOffice: 'Main Office Bangalore', orgSubDomain: 'playarena' }
  ];

  // localStorage helpers
  const getCustomOrgs = () => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]'); } catch (e) { return []; }
    }
    return [];
  };

  const saveCustomOrgs = (list) => {
    if (typeof window !== 'undefined') localStorage.setItem('pm_custom_orgs', JSON.stringify(list));
  };

  // Fetch Organisations
  const fetchOrganisations = async () => {
    setLoadingOrgs(true);
    setOrgError('');
    try {
      const res = await api.getOrganisations();
      const data = normalizeApiResponse(res, 'orgs', 'organisations');
      
      const custom = getCustomOrgs();
      const uniqueMock = mockOrgs.filter(m => !data.some(d => d._id === m._id));
      const uniqueCustom = custom.filter(c => !data.some(d => d._id === c._id) && !mockOrgs.some(m => m._id === c._id));
      setOrgs([...data, ...uniqueMock, ...uniqueCustom]);
    } catch (err) {
      console.error('Failed to fetch organisations:', err);
      setOrgError('Failed to fetch organisations from API. Using offline mock data.');
      setOrgs([...mockOrgs, ...getCustomOrgs()]);
    } finally {
      setLoadingOrgs(false);
    }
  };

  useEffect(() => { fetchOrganisations(); }, []);

  const handleOrgInputChange = (e) => { const { name, value } = e.target; setOrgForm(prev => ({ ...prev, [name]: value })); };

  const openOrgModal = (mode, orgItem = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && orgItem) {
      setSelectedOrg(orgItem);
      setOrgForm({ name: orgItem.name || '', domainUrl: orgItem.domainUrl || '', organisationNumber: orgItem.organisationNumber || '', mainOffice: orgItem.mainOffice || '', orgSubDomain: orgItem.orgSubDomain || '' });
    } else {
      setSelectedOrg(null);
      setOrgForm({ name: '', domainUrl: '', organisationNumber: '', mainOffice: '', orgSubDomain: '' });
    }
    setOrgModalOpen(true);
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      let orgToSave = null;
      if (modalMode === 'create') {
        const res = await api.createOrganisation(orgForm);
        orgToSave = res?.data || res;
        if (!orgToSave || !orgToSave._id) orgToSave = { ...orgForm, _id: res?._id || `org-${Date.now()}` };
        saveCustomOrgs([...getCustomOrgs(), orgToSave]);
      } else {
        const res = await api.updateOrganisation(selectedOrg._id, orgForm);
        orgToSave = res?.data || res;
        if (!orgToSave || !orgToSave._id) orgToSave = { ...orgForm, _id: selectedOrg._id };
        const custom = getCustomOrgs();
        if (custom.some(o => o._id === selectedOrg._id)) {
          saveCustomOrgs(custom.map(o => o._id === selectedOrg._id ? { ...o, ...orgToSave } : o));
        } else {
          saveCustomOrgs([...custom, orgToSave]);
        }
      }
      setOrgModalOpen(false);
      showToast(modalMode === 'create' ? 'Organisation created successfully' : 'Organisation updated successfully', 'success');
      fetchOrganisations();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Operation failed.');
      // Fallback
      if (modalMode === 'create') {
        saveCustomOrgs([...getCustomOrgs(), { ...orgForm, _id: `org-${Date.now()}` }]);
      } else {
        saveCustomOrgs(getCustomOrgs().map(o => o._id === selectedOrg._id ? { ...o, ...orgForm } : o));
      }
      setOrgModalOpen(false);
      fetchOrganisations();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrgDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this organisation?')) return;
    try {
      await api.deleteOrganisation(id);
      saveCustomOrgs(getCustomOrgs().filter(o => o._id !== id));
      showToast('Organisation deleted', 'success');
      fetchOrganisations();
    } catch (err) {
      console.warn('API error during delete.', err);
      saveCustomOrgs(getCustomOrgs().filter(o => o._id !== id));
      fetchOrganisations();
    }
  };

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Organisations Directory</h1>
          <p className="subtitle">Manage company details, subdomains, and main office locations</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => openOrgModal('create')}>
            <i className="fa-solid fa-plus"></i> Add Organisation
          </button>
        </div>
      </div>

      {/* Warning banners */}
      {orgError && (
        <div className="warning-banner"><i className="fa-solid fa-triangle-exclamation"></i><span>{orgError}</span></div>
      )}

      {/* Orgs View */}
      <div className="widget">
        {loadingOrgs ? (
          <div className="loading-state"><div className="spinner-large"></div><p>Loading organisations...</p></div>
        ) : orgs.length === 0 ? (
          <div className="empty-state"><i className="fa-solid fa-sitemap"></i><p>No organisations found. Create one to get started.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Organisation Info</th>
                  <th>Subdomain</th>
                  <th>Code / Number</th>
                  <th>Office Location</th>
                  <th>Domain Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org._id}>
                    <td>
                      <div className="client-cell">
                        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                          {org.name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{org.name}</span>
                      </div>
                    </td>
                    <td><span className="code-badge" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{org.orgSubDomain}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{org.organisationNumber || 'N/A'}</span></td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{org.mainOffice || 'N/A'}</span></td>
                    <td>
                      <a href={`https://${org.domainUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                        {org.domainUrl} <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }}></i>
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ color: 'var(--accent-blue)' }} onClick={() => openOrgModal('edit', org)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn-text" style={{ color: 'var(--accent-red)' }} onClick={() => handleOrgDelete(org._id)}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Organisation Modal */}
      <Modal isOpen={orgModalOpen} onClose={() => setOrgModalOpen(false)} title={modalMode === 'create' ? 'Add Organisation' : 'Update Organisation'}>
        <form onSubmit={handleOrgSubmit} className="modal-form">
          {formError && (<div className="form-error-banner"><i className="fa-solid fa-circle-exclamation"></i><span>{formError}</span></div>)}
          <div className="form-group">
            <label>Organisation Name</label>
            <input type="text" name="name" value={orgForm.name} onChange={handleOrgInputChange} required placeholder="e.g. Sportizo" />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Domain URL</label>
              <input type="text" name="domainUrl" value={orgForm.domainUrl} onChange={handleOrgInputChange} required placeholder="e.g. sportizo.playmetric.com" />
            </div>
            <div className="form-group half">
              <label>Subdomain Key</label>
              <input type="text" name="orgSubDomain" value={orgForm.orgSubDomain} onChange={handleOrgInputChange} required placeholder="e.g. sportizo" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Organisation Number</label>
              <input type="text" name="organisationNumber" value={orgForm.organisationNumber} onChange={handleOrgInputChange} placeholder="e.g. ORG-1010-10" />
            </div>
            <div className="form-group half">
              <label>Main Office Address</label>
              <input type="text" name="mainOffice" value={orgForm.mainOffice} onChange={handleOrgInputChange} placeholder="e.g. 5th Main St, Sector 6" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setOrgModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-mini"></span> : modalMode === 'create' ? 'Create Organisation' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
