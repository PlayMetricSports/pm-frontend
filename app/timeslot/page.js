/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse, getOrgName } from '@/lib/helpers';

export default function TimeslotPage() {
  const { showToast } = useToast();

  // State
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('All');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Forms
  const [form, setForm] = useState({ slotIndex: 1, orgId: '', startTime: '08:00', endTime: '09:00' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Mock Fallbacks
  const mockOrgs = [
    { _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo' },
    { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena' }
  ];

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
    try {
      const res = await api.getOrganisations();
      const data = normalizeApiResponse(res, 'orgs', 'organisations');
      
      const custom = typeof window !== 'undefined' && localStorage.getItem('pm_custom_orgs')
        ? JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]')
        : [];

      const baseOrgs = data.length > 0 ? data : mockOrgs;
      const uniqueCustom = custom.filter(c => !baseOrgs.some(b => b._id === c._id));
      setOrgs([...baseOrgs, ...uniqueCustom]);
    } catch (err) {
      console.warn('Failed to load orgs, using mocks', err);
      const custom = typeof window !== 'undefined' && localStorage.getItem('pm_custom_orgs')
        ? JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]')
        : [];
      setOrgs([...mockOrgs, ...custom]);
    }
  };

  // Fetch Timeslots
  const fetchTimeslots = async () => {
    if (selectedOrgFilter === 'All' && orgs.length === 0) return;

    setLoading(true);
    setError('');
    try {
      let allData = [];
      if (selectedOrgFilter === 'All') {
        // Fetch all orgs concurrently without waiting for the global API call to fail
        const promises = orgs.map(org => api.getTimeslots(org._id).catch(() => null));
        const results = await Promise.all(promises);
        results.forEach(r => {
           if (r) {
             const orgData = normalizeApiResponse(r, 'timeslots');
             allData = [...allData, ...orgData];
           }
        });
      } else {
        const res = await api.getTimeslots(selectedOrgFilter);
        allData = normalizeApiResponse(res, 'timeslots');
      }

      const custom = getCustomSlots();
      const uniqueCustom = custom.filter(c => !allData.some(d => d._id === c._id));
      setTimeslots([...allData, ...uniqueCustom].sort((a, b) => a.slotIndex - b.slotIndex));
    } catch (err) {
      console.error('Failed to fetch timeslots:', err);
      setError('Failed to fetch timeslots from API. Using offline custom data.');
      setTimeslots([...getCustomSlots()].sort((a, b) => a.slotIndex - b.slotIndex));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganisations(); }, []);
  useEffect(() => { fetchTimeslots(); }, [selectedOrgFilter, orgs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'slotIndex' ? Number(value) : value }));
  };

  const openModal = (mode, slotItem = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && slotItem) {
      setSelectedSlot(slotItem);
      const slotOrgIdStr = typeof slotItem.orgId === 'object' ? (slotItem.orgId?._id || slotItem.orgId?.id) : (slotItem.orgId || '');
      setForm({
        slotIndex: slotItem.slotIndex || 1,
        orgId: String(slotOrgIdStr),
        startTime: slotItem.startTime || '08:00',
        endTime: slotItem.endTime || '09:00'
      });
    } else {
      setSelectedSlot(null);
      const defaultOrgId = selectedOrgFilter !== 'All' ? selectedOrgFilter : (orgs[0]?._id || '');
      setForm({
        slotIndex: timeslots.length + 1,
        orgId: defaultOrgId,
        startTime: '08:00',
        endTime: '09:00'
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      let slotToSave = null;
      if (modalMode === 'create') {
        const res = await api.createTimeslot(form);
        slotToSave = res?.data || res;
        if (!slotToSave || !slotToSave._id) slotToSave = { ...form, _id: res?._id || `slot-${Date.now()}` };
        saveCustomSlots([...getCustomSlots(), slotToSave]);
      } else {
        const res = await api.updateTimeslot(selectedSlot._id, form);
        slotToSave = res?.data || res;
        if (!slotToSave || !slotToSave._id) slotToSave = { ...form, _id: selectedSlot._id };
        const custom = getCustomSlots();
        if (custom.some(s => s._id === selectedSlot._id)) {
          saveCustomSlots(custom.map(s => s._id === selectedSlot._id ? { ...s, ...slotToSave } : s));
        } else {
          saveCustomSlots([...custom, slotToSave]);
        }
      }
      setModalOpen(false);
      showToast(modalMode === 'create' ? 'Timeslot created successfully' : 'Timeslot updated successfully', 'success');
      fetchTimeslots();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Operation failed.');
      if (modalMode === 'create') {
        saveCustomSlots([...getCustomSlots(), { ...form, _id: `slot-${Date.now()}` }]);
      } else {
        saveCustomSlots(getCustomSlots().map(s => s._id === selectedSlot._id ? { ...s, ...form } : s));
      }
      setModalOpen(false);
      fetchTimeslots();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!confirm(`Are you sure you want to delete slot #${slot.slotIndex}?`)) return;
    try {
      await api.deleteTimeslot(slot._id, slot);
      saveCustomSlots(getCustomSlots().filter(s => s._id !== slot._id));
      showToast('Timeslot deleted successfully', 'success');
      fetchTimeslots();
    } catch (err) {
      console.warn('API error during delete. Simulating local delete.', err);
      saveCustomSlots(getCustomSlots().filter(s => s._id !== slot._id));
      fetchTimeslots();
    }
  };

  const filteredSlots = timeslots.filter(slot => {
    const slotOrgIdStr = typeof slot.orgId === 'object' ? (slot.orgId?._id || slot.orgId?.id) : String(slot.orgId);
    const matchesOrg = selectedOrgFilter === 'All' || slotOrgIdStr === String(selectedOrgFilter);
    return matchesOrg;
  });

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Timeslot Configuration</h1>
          <p className="subtitle">Manage and define global scheduling and booking intervals for organisations</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => openModal('create')}>
            <i className="fa-solid fa-plus"></i> Create Timeslot
          </button>
        </div>
      </div>

      {error && (
        <div className="warning-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="widget-header" style={{ marginBottom: '1.5rem' }}>
        <div className="search-bar" style={{ width: '250px', background: 'var(--bg-surface)', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>
          <select
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer' }}
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
          >
            <option value="All">All Organisations</option>
            {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
          </select>
        </div>
      </div>

      <div className="widget">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading timeslots...</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-clock"></i>
            <p>No timeslots found. Create one to define scheduling windows.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Organisation</th>
                  <th>Index</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => (
                  <tr key={slot._id}>
                    <td>
                      <div className="client-cell">
                        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: '0.95rem' }}></i>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {getOrgName(slot.orgId, orgs)}
                        </span>
                      </div>
                    </td>
                    <td><span className="code-badge" style={{ padding: '4px 8px', borderRadius: '6px' }}>Slot #{slot.slotIndex}</span></td>
                    <td><span style={{ fontWeight: 500 }}>{slot.startTime}</span></td>
                    <td><span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{slot.endTime}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ color: 'var(--accent-blue)' }} onClick={() => openModal('edit', slot)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn-text" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(slot)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Create Timeslot' : 'Update Timeslot'}>
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{formError}</span>
            </div>
          )}
          <div className="form-row">
            <div className="form-group half">
              <label>Slot Index</label>
              <input type="number" name="slotIndex" value={form.slotIndex} onChange={handleInputChange} required min="1" />
            </div>
            <div className="form-group half">
              <label>Organisation</label>
              <select name="orgId" value={form.orgId} onChange={handleInputChange} required>
                <option value="">-- Select Organisation --</option>
                {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleInputChange} required />
            </div>
            <div className="form-group half">
              <label>End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-mini"></span> : modalMode === 'create' ? 'Create Slot' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
