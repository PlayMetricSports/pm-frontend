import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import SportsPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getOrganisations: vi.fn(),
    getSports: vi.fn(),
    getVenues: vi.fn(),
    createSport: vi.fn(),
    updateSport: vi.fn(),
    deleteSport: vi.fn(),
  },
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('Sports Page tests', () => {
  const mockOrgs = [{ _id: 'org1', name: 'Org One' }];
  const mockSports = [{ _id: 's1', name: 'Rugby', orgId: 'org1', activeStatus: 'active' }];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOrganisations.mockResolvedValue({ success: true, data: { organisations: mockOrgs } });
    api.getSports.mockResolvedValue({ success: true, data: mockSports });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the loading state and then the table', async () => {
    render(<SportsPage />);
    expect(screen.getByText('Fetching active sports configurations...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Rugby')).toBeInTheDocument();
      expect(screen.queryByText('Fetching active sports configurations...')).not.toBeInTheDocument();
    });
  });

  it('should filter sports by search query', async () => {
    render(<SportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rugby')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search sport name...');
    
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Rugb' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Rugby')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Tennis' } });
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Rugby')).not.toBeInTheDocument();
    });
  });

  it('should handle creating a new sport', async () => {
    api.createSport.mockResolvedValueOnce({ success: true, data: { _id: 's2', name: 'Tennis', orgId: 'org1' } });
    render(<SportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Rugby')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Sport/i }));

    const nameInput = screen.getByPlaceholderText('e.g. Badminton');
    fireEvent.change(nameInput, { target: { value: 'Tennis' } });
    
    const form = screen.getByRole('button', { name: 'Create Sport' }).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.createSport).toHaveBeenCalledWith(expect.objectContaining({ name: 'Tennis' }));
      expect(api.getSports).toHaveBeenCalledTimes(2);
    });
  });
});
