import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import VenuesPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getOrganisations: vi.fn(),
    getVenues: vi.fn(),
    createVenue: vi.fn(),
    updateVenue: vi.fn(),
    deleteVenue: vi.fn(),
  },
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('Venues Page tests', () => {
  const mockOrgs = [{ _id: 'org1', name: 'Org One' }];
  const mockVenues = [{ _id: 'v1', name: 'Venue Alpha', orgId: 'org1', address: '123 Alpha St' }];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOrganisations.mockResolvedValue({ success: true, data: { organisations: mockOrgs } });
    api.getVenues.mockResolvedValue({ success: true, data: mockVenues });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the loading state initially and then the table', async () => {
    render(<VenuesPage />);
    expect(screen.getByText('Fetching venues list...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Venue Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Fetching venues list...')).not.toBeInTheDocument();
    });
  });

  it('should filter venues by search query', async () => {
    render(<VenuesPage />);
    await waitFor(() => {
      expect(screen.getByText('Venue Alpha')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search venue name or address...');
    
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Venue Alpha')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Beta' } });
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Venue Alpha')).not.toBeInTheDocument();
      expect(screen.getByText('No venues found matching search criteria.')).toBeInTheDocument();
    });
  });

  it('should show the create modal and submit a new venue', async () => {
    api.createVenue.mockResolvedValueOnce({ success: true, data: { _id: 'v2', name: 'Venue Beta', orgId: 'org1', address: '456 Beta Ave' } });
    
    render(<VenuesPage />);
    await waitFor(() => {
      expect(screen.getByText('Venue Alpha')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Venue/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: 'Add Venue' })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Badminton Central Court');
    const addressInput = screen.getByPlaceholderText('e.g. 12 Sport City Road, Bangalore');
    
    fireEvent.change(nameInput, { target: { value: 'Venue Beta' } });
    fireEvent.change(addressInput, { target: { value: '456 Beta Ave' } });
    
    const form = screen.getByRole('button', { name: 'Create Venue' }).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.createVenue).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Venue Beta',
        address: '456 Beta Ave',
      }));
      expect(api.getVenues).toHaveBeenCalledTimes(2);
    });
  });
});
