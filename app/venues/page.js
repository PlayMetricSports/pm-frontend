'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse, getOrgName } from '@/lib/helpers';

export default function VenuesPage() {
  const { showToast } = useToast();

  // Venues State
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Orgs List (for dropdowns/filters)
  const [orgs, setOrgs] = useState([]);
  
  // Filter & Search states
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedVenue, setSelectedVenue] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    orgId: '',
    address: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Mock Fallbacks
  const mockOrgs = [
    { _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo' },
    { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena' }
  ];

  const mockVenues = [
    { _id: '6a299e25d7c28c0c99219fe7', name: 'Badminton Club', orgId: '6a299c62d7c28c0c99219fda', address: 'Test Address Again ' },
    { _id: '6a299e25d7c28c0c99219fe8', name: 'Tennis Courts Central', orgId: '6a299c62d7c28c0c99219fda', address: '456 Sportivo Blvd' },
    { _id: 'venue-3', name: 'Arena Football Pitch', orgId: '6a299c62d7c28c0c99219fdb', address: 'Outer Ring Road, Bangalore' }
  ];

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
      console.warn('Failed to load orgs in venues page, using mocks', err);
      const custom = typeof window !== 'undefined' && localStorage.getItem('pm_custom_orgs')
        ? JSON.parse(localStorage.getItem('pm_custom_orgs') || '[]')
        : [];
      setOrgs([...mockOrgs, ...custom]);
    }
  };

  // Helper to read custom venues from localStorage
  const getCustomVenues = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_custom_venues');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) { /* ignore */ }
      }
    }
    return [];
  };

  const saveCustomVenues = (venuesList) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_custom_venues', JSON.stringify(venuesList));
    }
  };

  // Fetch Venues
  const fetchVenues = async () => {
    setLoading(true);
    setError('');
    try {
      const orgIdParam = selectedOrgFilter === 'All' ? '' : selectedOrgFilter;
      const res = await api.getVenues(orgIdParam, searchQuery);
      const data = normalizeApiResponse(res, 'venues');

      const custom = getCustomVenues();
      const uniqueMock = mockVenues.filter(m => !data.some(d => d._id === m._id));
      const uniqueCustom = custom.filter(c => !data.some(d => d._id === c._id) && !mockVenues.some(m => m._id === c._id));
      setVenues([...data, ...uniqueMock, ...uniqueCustom]);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
      setError('Failed to fetch venues from API. Using offline mock data.');
      const custom = getCustomVenues();
      setVenues([...mockVenues, ...custom]);
    } finally {
      setLoading(false);
    }
  };

  // Lifecycle — parallel fetch
  useEffect(() => {
    fetchOrganisations();
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [selectedOrgFilter, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (mode, venueItem = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && venueItem) {
      setSelectedVenue(venueItem);
      setForm({ name: venueItem.name || '', orgId: venueItem.orgId || '', address: venueItem.address || '' });
    } else {
      setSelectedVenue(null);
      setForm({ name: '', orgId: orgs[0]?._id || '', address: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      let venueToSave = null;
      if (modalMode === 'create') {
        const res = await api.createVenue(form);
        venueToSave = res?.data || res;
        if (!venueToSave || !venueToSave._id) {
          venueToSave = { ...form, _id: res?._id || `venue-${Date.now()}` };
        }
        const custom = getCustomVenues();
        saveCustomVenues([...custom, venueToSave]);
      } else {
        const res = await api.updateVenue(selectedVenue._id, form);
        venueToSave = res?.data || res;
        if (!venueToSave || !venueToSave._id) {
          venueToSave = { ...form, _id: selectedVenue._id };
        }
        const custom = getCustomVenues();
        const exists = custom.some(v => v._id === selectedVenue._id);
        if (exists) {
          saveCustomVenues(custom.map(v => v._id === selectedVenue._id ? { ...v, ...venueToSave } : v));
        } else {
          saveCustomVenues([...custom, venueToSave]);
        }
      }
      setModalOpen(false);
      showToast(modalMode === 'create' ? 'Venue created successfully' : 'Venue updated successfully', 'success');
      fetchVenues();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Operation failed.');
      // Fallback to localStorage
      let venueToSave = null;
      if (modalMode === 'create') {
        venueToSave = { ...form, _id: `venue-${Date.now()}` };
        saveCustomVenues([...getCustomVenues(), venueToSave]);
      } else {
        venueToSave = { ...form, _id: selectedVenue._id };
        saveCustomVenues(getCustomVenues().map(v => v._id === selectedVenue._id ? { ...v, ...venueToSave } : v));
      }
      setModalOpen(false);
      fetchVenues();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (venue) => {
    if (!confirm(`Are you sure you want to delete "${venue.name}"?`)) return;
    try {
      await api.deleteVenue(venue._id, venue);
      const custom = getCustomVenues();
      saveCustomVenues(custom.filter(v => v._id !== venue._id));
      showToast('Venue deleted successfully', 'success');
      fetchVenues();
    } catch (err) {
      console.warn('API error during delete. Simulating local delete.', err);
      saveCustomVenues(getCustomVenues().filter(v => v._id !== venue._id));
      fetchVenues();
    }
  };

  // Filtered venues
  const filteredVenues = venues.filter(venue => {
    const matchesOrg = selectedOrgFilter === 'All' || venue.orgId === selectedOrgFilter;
    const matchesSearch = venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          venue.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOrg && matchesSearch;
  });

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Venues Management</h1>
          <p className="subtitle">Configure courts, fields, pitches, and physical sports venue locations</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => openModal('create')}>
            <i className="fa-solid fa-plus"></i> Add Venue
          </button>
        </div>
      </div>

      {error && (
        <div className="warning-banner">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="widget-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ width: '220px', background: 'var(--bg-surface)', padding: '0.25rem 0.75rem', borderRadius: '8px' }}>
            <select
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer' }}
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
            >
              <option value="All">All Organisations</option>
              {orgs.map(o => (
                <option key={o._id} value={o._id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-bar" style={{ width: '280px' }}>
          <i className="fa-solid fa-search"></i>
          <input type="text" placeholder="Search venue name or address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="widget">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Fetching venues list...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-map-location-dot"></i>
            <p>No venues found matching search criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Venue Name</th>
                  <th>Organisation</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => (
                  <tr key={venue._id}>
                    <td>
                      <div className="client-cell">
                        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-orange))' }}>
                          <i className="fa-solid fa-location-dot" style={{ fontSize: '0.9rem' }}></i>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{venue.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="code-badge" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{getOrgName(venue.orgId, orgs)}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-map-pin" style={{ marginRight: '6px', color: 'var(--accent-red)', opacity: 0.8 }}></i>
                        {venue.address}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ color: 'var(--accent-blue)' }} onClick={() => openModal('edit', venue)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn-text" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(venue)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Add Venue' : 'Update Venue'}>
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{formError}</span>
            </div>
          )}
          <div className="form-group">
            <label>Venue Name</label>
            <input type="text" name="name" value={form.name} onChange={handleInputChange} required placeholder="e.g. Badminton Central Court" />
          </div>
          <div className="form-group">
            <label>Parent Organisation</label>
            <select name="orgId" value={form.orgId} onChange={handleInputChange} required>
              {orgs.map(o => (
                <option key={o._id} value={o._id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" value={form.address} onChange={handleInputChange} required placeholder="e.g. 12 Sport City Road, Bangalore" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-mini"></span> : modalMode === 'create' ? 'Create Venue' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
