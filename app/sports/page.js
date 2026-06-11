/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { normalizeApiResponse, getOrgName, getVenueName } from '@/lib/helpers';

export default function SportsPage() {
  const { showToast } = useToast();

  // Sports State
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Orgs & Venues lists
  const [orgs, setOrgs] = useState([]);
  const [venues, setVenues] = useState([]);
  
  // Filter & Search
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSport, setSelectedSport] = useState(null);
  
  // Form
  const [form, setForm] = useState({ name: '', orgId: '', venueId: '', icon: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Mock Fallbacks
  const mockOrgs = [
    { _id: '6a299c62d7c28c0c99219fda', name: 'Sportizo' },
    { _id: '6a299c62d7c28c0c99219fdb', name: 'PlayArena' }
  ];

  const mockVenues = [
    { _id: '6a299e25d7c28c0c99219fe7', name: 'Badminton Club', orgId: '6a299c62d7c28c0c99219fda' },
    { _id: '6a299e25d7c28c0c99219fe8', name: 'Tennis Courts Central', orgId: '6a299c62d7c28c0c99219fda' },
    { _id: 'venue-3', name: 'Arena Football Pitch', orgId: '6a299c62d7c28c0c99219fdb' }
  ];

  const mockSports = [
    { _id: '6a299e25d7c28c0c99219fe7', name: 'Badminton', orgId: '6a299c62d7c28c0c99219fda', venueId: '6a299e25d7c28c0c99219fe7' },
    { _id: 'sport-2', name: 'Lawn Tennis', orgId: '6a299c62d7c28c0c99219fda', venueId: '6a299e25d7c28c0c99219fe8' },
    { _id: 'sport-3', name: 'Football', orgId: '6a299c62d7c28c0c99219fdb', venueId: 'venue-3' }
  ];

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

  const fetchVenues = async () => {
    try {
      const res = await api.getVenues();
      const data = normalizeApiResponse(res, 'venues');
      setVenues(data.length > 0 ? data : mockVenues);
    } catch (err) {
      console.warn('Failed to load venues, using mocks', err);
      setVenues(mockVenues);
    }
  };

  const getCustomSports = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_custom_sports');
      if (stored) { try { return JSON.parse(stored); } catch (e) { /* ignore */ } }
    }
    return [];
  };

  const saveCustomSports = (list) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm_custom_sports', JSON.stringify(list));
    }
  };

  const fetchSports = async () => {
    setLoading(true);
    setError('');
    try {
      const orgIdParam = selectedOrgFilter === 'All' ? '' : selectedOrgFilter;
      const res = await api.getSports(orgIdParam, searchQuery);
      const data = normalizeApiResponse(res, 'sports');

      const custom = getCustomSports();
      const uniqueMock = mockSports.filter(m => !data.some(d => d._id === m._id));
      const uniqueCustom = custom.filter(c => !data.some(d => d._id === c._id) && !mockSports.some(m => m._id === c._id));
      setSports([...data, ...uniqueMock, ...uniqueCustom]);
    } catch (err) {
      console.error('Failed to fetch sports:', err);
      setError('Failed to fetch sports from API. Using offline mock data.');
      setSports([...mockSports, ...getCustomSports()]);
    } finally {
      setLoading(false);
    }
  };

  // Parallel init fetch
  useEffect(() => {
    Promise.all([fetchOrganisations(), fetchVenues()]);
  }, []);

  useEffect(() => {
    fetchSports();
  }, [selectedOrgFilter, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (mode, sportItem = null) => {
    setModalMode(mode);
    setFormError('');
    if (mode === 'edit' && sportItem) {
      setSelectedSport(sportItem);
      setForm({ name: sportItem.name || '', orgId: sportItem.orgId || '', venueId: sportItem.venueId || '', icon: sportItem.icon || '' });
    } else {
      setSelectedSport(null);
      setForm({ name: '', orgId: orgs[0]?._id || '', venueId: venues[0]?._id || '', icon: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      let sportToSave = null;
      if (modalMode === 'create') {
        const res = await api.createSport(form);
        sportToSave = res?.data || res;
        if (!sportToSave || !sportToSave._id) sportToSave = { ...form, _id: res?._id || `sport-${Date.now()}` };
        saveCustomSports([...getCustomSports(), sportToSave]);
      } else {
        const res = await api.updateSport(selectedSport._id, form);
        sportToSave = res?.data || res;
        if (!sportToSave || !sportToSave._id) sportToSave = { ...form, _id: selectedSport._id };
        const custom = getCustomSports();
        const exists = custom.some(s => s._id === selectedSport._id);
        if (exists) saveCustomSports(custom.map(s => s._id === selectedSport._id ? { ...s, ...sportToSave } : s));
        else saveCustomSports([...custom, sportToSave]);
      }
      setModalOpen(false);
      showToast(modalMode === 'create' ? 'Sport created successfully' : 'Sport updated successfully', 'success');
      fetchSports();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Operation failed.');
      // Fallback
      if (modalMode === 'create') {
        saveCustomSports([...getCustomSports(), { ...form, _id: `sport-${Date.now()}` }]);
      } else {
        const custom = getCustomSports();
        saveCustomSports(custom.map(s => s._id === selectedSport._id ? { ...s, ...form } : s));
      }
      setModalOpen(false);
      fetchSports();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sport) => {
    if (!confirm(`Are you sure you want to delete "${sport.name}"?`)) return;
    try {
      await api.deleteSport(sport._id, sport);
      saveCustomSports(getCustomSports().filter(s => s._id !== sport._id));
      showToast('Sport deleted successfully', 'success');
      fetchSports();
    } catch (err) {
      console.warn('API error during delete. Simulating local delete.', err);
      saveCustomSports(getCustomSports().filter(s => s._id !== sport._id));
      fetchSports();
    }
  };

  const getSportIconClass = (sport) => {
    if (sport && sport.icon) return sport.icon;
    const name = sport?.name || '';
    const lower = name.toLowerCase();
    if (lower.includes('badminton')) return 'fa-solid fa-shuttlecock';
    if (lower.includes('tennis')) return 'fa-solid fa-baseball-bat-ball';
    if (lower.includes('football') || lower.includes('soccer')) return 'fa-solid fa-football-board';
    if (lower.includes('basketball')) return 'fa-solid fa-basketball';
    if (lower.includes('cricket')) return 'fa-solid fa-cricket-bat-ball';
    return 'fa-solid fa-volleyball';
  };

  const iconOptions = [
    { value: '', label: 'Auto-detect from name' },
    { value: 'fa-solid fa-volleyball', label: 'Volleyball' },
    { value: 'fa-solid fa-shuttlecock', label: 'Badminton' },
    { value: 'fa-solid fa-baseball-bat-ball', label: 'Tennis / Baseball' },
    { value: 'fa-solid fa-football-board', label: 'Football / Soccer' },
    { value: 'fa-solid fa-basketball', label: 'Basketball' },
    { value: 'fa-solid fa-cricket-bat-ball', label: 'Cricket' },
    { value: 'fa-solid fa-table-tennis-paddle-ball', label: 'Table Tennis' },
    { value: 'fa-solid fa-golf-ball-tee', label: 'Golf' },
    { value: 'fa-solid fa-bowling-ball', label: 'Bowling' },
    { value: 'fa-solid fa-person-swimming', label: 'Swimming' },
    { value: 'fa-solid fa-dumbbell', label: 'Gym / Fitness' },
  ];

  const filteredSports = sports.filter(sport => {
    const matchesOrg = selectedOrgFilter === 'All' || sport.orgId === selectedOrgFilter;
    const matchesSearch = sport.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOrg && matchesSearch;
  });

  return (
    <div className="view active">
      <div className="view-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Sports Configuration</h1>
          <p className="subtitle">Manage configured sports, booking schedules, and link them to venues</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => openModal('create')}>
            <i className="fa-solid fa-plus"></i> Add Sport
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
              {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
            </select>
          </div>
        </div>
        <div className="search-bar" style={{ width: '280px' }}>
          <i className="fa-solid fa-search"></i>
          <input type="text" placeholder="Search sport name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="widget">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Fetching active sports configurations...</p>
          </div>
        ) : filteredSports.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-volleyball"></i>
            <p>No sports configured. Add a sport to organize scheduling.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Sport</th>
                  <th>Organisation</th>
                  <th>Venue / Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSports.map((sport) => (
                  <tr key={sport._id}>
                    <td>
                      <div className="client-cell">
                        <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' }}>
                          <i className={getSportIconClass(sport)} style={{ fontSize: '0.95rem' }}></i>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sport.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="code-badge" style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{getOrgName(sport.orgId, orgs)}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-map-location-dot" style={{ marginRight: '6px', color: 'var(--accent-purple)', opacity: 0.8 }}></i>
                        {getVenueName(sport.venueId, venues)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ color: 'var(--accent-blue)' }} onClick={() => openModal('edit', sport)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn-text" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(sport)}>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Configure Sport' : 'Update Sport'}>
        <form onSubmit={handleSubmit} className="modal-form">
          {formError && (
            <div className="form-error-banner">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{formError}</span>
            </div>
          )}
          <div className="form-group">
            <label>Sport Name</label>
            <input type="text" name="name" value={form.name} onChange={handleInputChange} required placeholder="e.g. Badminton" />
          </div>
          <div className="form-group">
            <label>Sport Icon</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select name="icon" value={form.icon} onChange={handleInputChange} style={{ flex: 1 }}>
                {iconOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <i className={form.icon || getSportIconClass({ name: form.name })}></i>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Organisation</label>
            <select name="orgId" value={form.orgId} onChange={handleInputChange} required>
              {orgs.map(o => (<option key={o._id} value={o._id}>{o.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Location Venue</label>
            <select name="venueId" value={form.venueId} onChange={handleInputChange} required>
              {venues.map(v => (<option key={v._id} value={v._id}>{v.name}</option>))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner-mini"></span> : modalMode === 'create' ? 'Create Sport' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
