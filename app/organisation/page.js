'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse } from '@/lib/helpers';

export default function OrganisationPage() {
  const { showToast } = useToast();

  // Tabs: 'orgs' or 'timeslots'
  const [activeTab, setActiveTab] = useState('orgs');

  // Organisations State
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgError, setOrgError] = useState('');
  
  // Timeslots State
  const [timeslots, setTimeslots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');

  // Modals
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // Selected for Edit
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Forms
  const [orgForm, setOrgForm] = useState({ name: '', domainUrl: '', organisationNumber: '', mainOffice: '', orgSubDomain: '' });
  const [slotForm, setSlotForm] = useState({ slotIndex: 1, orgId: '', startTime: '08:00', endTime: '09:00' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Mock Fallbacks
  const mockOrgs = [
    { _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo', domainUrl: 'sportizo.playmetric.com', organisationNumber: 'ORG-1010-10', mainOffice: 'Test Address 1', orgSubDomain: 'sportizo' },
    { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena', domainUrl: 'playarena.playmetric.com', organisationNumber: 'ORG-2020-20', mainOffice: 'Main Office Bangalore', orgSubDomain: 'playarena' }
  ];

  const mockSlots = [
    { _id: 'slot-1', slotIndex: 1, orgId: '6a299c62d7c28c0c99219fda', startTime: '06:00', endTime: '07:30' },
    { _id: 'slot-2', slotIndex: 2, orgId: '6a299c62d7c28c0c99219fda', startTime: '08:00', endTime: '09:30' },
    { _id: 'slot-3', slotIndex: 3, orgId: '6a299c62d7c28c0c99219fda', startTime: '16:00', endTime: '17:30' }
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

  const getCustomSlots = () => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('pm_custom_slots') || '[]'); } catch (e) { return []; }
    }
    return [];
  };

  const saveCustomSlots = (list) => {
    if (typeof window !== 'undefined') localStorage.setItem('pm_custom_slots', JSON.stringify(list));
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

  // Fetch Timeslots
  const fetchTimeslots = async (orgId) => {
    if (!orgId) { setTimeslots([]); return; }
    setLoadingSlots(true);
    setSlotError('');
    try {
      const res = await api.getTimeslots(orgId);
      const data = normalizeApiResponse(res, 'timeslots');

      const custom = getCustomSlots().filter(s => s.orgId === orgId);
      const defaultSlots = orgId === '6a299c62d7c28c0c99219fda' ? mockSlots : [];
      const uniqueDefault = defaultSlots.filter(d => !data.some(b => b._id === d._id));
      const uniqueCustom = custom.filter(c => !data.some(b => b._id === c._id) && !defaultSlots.some(d => d._id === c._id));
      setTimeslots([...data, ...uniqueDefault, ...uniqueCustom].sort((a, b) => a.slotIndex - b.slotIndex));
    } catch (err) {
      console.error('Failed to fetch timeslots:', err);
      setSlotError('Failed to fetch timeslots from API. Using offline mock data.');
      const custom = getCustomSlots().filter(s => s.orgId === orgId);
      const defaultSlots = orgId === '6a299c62d7c28c0c99219fda' ? mockSlots : [];
      const uniqueCustom = custom.filter(c => !defaultSlots.some(d => d._id === c._id));
      setTimeslots([...defaultSlots, ...uniqueCustom].sort((a, b) => a.slotIndex - b.slotIndex));
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => { fetchOrganisations(); }, []);
  useEffect(() => { if (orgs.length > 0 && !selectedOrgId) setSelectedOrgId(orgs[0]._id); }, [orgs]);
  useEffect(() => { if (selectedOrgId) fetchTimeslots(selectedOrgId); }, [selectedOrgId]);

  const handleOrgInputChange = (e) => { const { name, value } = e.target; setOrgForm(prev => ({ ...prev, [name]: value })); };
  const handleSlotInputChange = (e) => { const { name, value } = e.target; setSlotForm(prev => ({ ...prev, [name]: name === 'slotIndex' ? Number(value) : value })); };

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

  const openSlotModal = (mode, slotItem = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && slotItem) {
      setSelectedSlot(slotItem);
      setSlotForm({ slotIndex: slotItem.slotIndex || 1, orgId: slotItem.orgId || selectedOrgId, startTime: slotItem.startTime || '08:00', endTime: slotItem.endTime || '09:00' });
    } else {
      setSelectedSlot(null);
      setSlotForm({ slotIndex: timeslots.length + 1, orgId: selectedOrgId || (orgs[0]?._id || ''), startTime: '08:00', endTime: '09:00' });
    }
    setSlotModalOpen(true);
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

  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      let slotToSave = null;
      if (modalMode === 'create') {
        const res = await api.createTimeslot(slotForm);
        slotToSave = res?.data || res;
        if (!slotToSave || !slotToSave._id) slotToSave = { ...slotForm, _id: res?._id || `slot-${Date.now()}` };
        saveCustomSlots([...getCustomSlots(), slotToSave]);
      } else {
        const res = await api.updateTimeslot(selectedSlot._id, slotForm);
        slotToSave = res?.data || res;
        if (!slotToSave || !slotToSave._id) slotToSave = { ...slotForm, _id: selectedSlot._id };
        const custom = getCustomSlots();
        if (custom.some(s => s._id === selectedSlot._id)) {
          saveCustomSlots(custom.map(s => s._id === selectedSlot._id ? { ...s, ...slotToSave } : s));
        } else {
          saveCustomSlots([...custom, slotToSave]);
        }
      }
      setSlotModalOpen(false);
      showToast(modalMode === 'create' ? 'Timeslot created' : 'Timeslot updated', 'success');
      fetchTimeslots(selectedOrgId);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Operation failed.');
      if (modalMode === 'create') {
        saveCustomSlots([...getCustomSlots(), { ...slotForm, _id: `slot-${Date.now()}` }]);
      } else {
        saveCustomSlots(getCustomSlots().map(s => s._id === selectedSlot._id ? { ...s, ...slotForm } : s));
      }
      setSlotModalOpen(false);
      fetchTimeslots(selectedOrgId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotDelete = async (slot) => {
    if (!confirm(`Are you sure you want to delete slot #${slot.slotIndex}?`)) return;
    try {
      await api.deleteTimeslot(slot._id, slot);
      saveCustomSlots(getCustomSlots().filter(s => s._id !== slot._id));
      showToast('Timeslot deleted', 'success');
      fetchTimeslots(selectedOrgId);
    } catch (err) {
      console.warn('API error during delete.', err);
      saveCustomSlots(getCustomSlots().filter(s => s._id !== slot._id));
      fetchTimeslots(selectedOrgId);
    }
  };

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Organisations & Timeslots</h1>
          <p className="subtitle">Manage company details, subdomains, and booking timeslot intervals</p>
        </div>
        <div>
          {activeTab === 'orgs' ? (
            <button className="btn-primary" onClick={() => openOrgModal('create')}>
              <i className="fa-solid fa-plus"></i> Add Organisation
            </button>
          ) : (
            <button className="btn-primary" onClick={() => openSlotModal('create')} disabled={!selectedOrgId}>
              <i className="fa-solid fa-clock"></i> Create Timeslot
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="inner-tabs" style={{ marginBottom: '1.5rem', padding: 0 }}>
        <button className={`inner-tab ${activeTab === 'orgs' ? 'active' : ''}`} onClick={() => setActiveTab('orgs')}>
          Organisations Directory
        </button>
        <button className={`inner-tab ${activeTab === 'timeslots' ? 'active' : ''}`} onClick={() => setActiveTab('timeslots')}>
          Booking Timeslots
        </button>
      </div>

      {/* Warning banners */}
      {orgError && activeTab === 'orgs' && (
        <div className="warning-banner"><i className="fa-solid fa-triangle-exclamation"></i><span>{orgError}</span></div>
      )}
      {slotError && activeTab === 'timeslots' && (
        <div className="warning-banner"><i className="fa-solid fa-triangle-exclamation"></i><span>{slotError}</span></div>
      )}

      {/* Orgs View */}
      {activeTab === 'orgs' && (
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
      )}

      {/* Timeslots View */}
      {activeTab === 'timeslots' && (
        <div>
          <div className="venue-selector" style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Select Organisation:</label>
            <select className="venue-dropdown" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}>
              <option value="">-- Select Organisation --</option>
              {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
            </select>
          </div>

          <div className="widget">
            {loadingSlots ? (
              <div className="loading-state"><div className="spinner-large"></div><p>Loading timeslots...</p></div>
            ) : !selectedOrgId ? (
              <div className="empty-state"><i className="fa-solid fa-building-circle-check"></i><p>Select an organisation to view its timeslots.</p></div>
            ) : timeslots.length === 0 ? (
              <div className="empty-state"><i className="fa-solid fa-clock"></i><p>No timeslots defined for this organisation yet.</p></div>
            ) : (
              <div className="slots-grid">
                {timeslots.map((slot) => (
                  <div key={slot._id} className="slot-card">
                    <div className="slot-badge">Slot #{slot.slotIndex}</div>
                    <div className="slot-time">
                      <i className="fa-regular fa-clock"></i> {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="slot-actions">
                      <button onClick={() => openSlotModal('edit', slot)} title="Edit Slot">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="delete" onClick={() => handleSlotDelete(slot)} title="Delete Slot">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Timeslot Modal */}
      <Modal isOpen={slotModalOpen} onClose={() => setSlotModalOpen(false)} title={modalMode === 'create' ? 'Create Timeslot' : 'Modify Timeslot'}>
        <form onSubmit={handleSlotSubmit} className="modal-form">
          {formError && (<div className="form-error-banner"><i className="fa-solid fa-circle-exclamation"></i><span>{formError}</span></div>)}
          <div className="form-row">
            <div className="form-group half">
              <label>Slot Index</label>
              <input type="number" name="slotIndex" value={slotForm.slotIndex} onChange={handleSlotInputChange} required min="1" />
            </div>
            <div className="form-group half">
              <label>Organisation</label>
              <select name="orgId" value={slotForm.orgId} onChange={handleSlotInputChange} required>
                {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Start Time</label>
              <input type="time" name="startTime" value={slotForm.startTime} onChange={handleSlotInputChange} required />
            </div>
            <div className="form-group half">
              <label>End Time</label>
              <input type="time" name="endTime" value={slotForm.endTime} onChange={handleSlotInputChange} required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setSlotModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-mini"></span> : modalMode === 'create' ? 'Create Slot' : 'Apply Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
