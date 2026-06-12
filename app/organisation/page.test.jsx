import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import OrganisationPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getOrganisations: vi.fn(),
    getTimeslots: vi.fn(),
    createOrganisation: vi.fn(),
    updateOrganisation: vi.fn(),
    deleteOrganisation: vi.fn(),
  },
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('Organisation Page tests', () => {
  const mockOrgs = [{ _id: 'org1', name: 'Global Sports Academy', email: 'contact@gsa.com', contactNumber: '1234567890' }];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOrganisations.mockResolvedValue({ success: true, data: { organisations: mockOrgs } });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the loading state and then the table', async () => {
    render(<OrganisationPage />);
    expect(screen.getByText('Loading organisations...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Global Sports Academy')).toBeInTheDocument();
      expect(screen.queryByText('Loading organisations...')).not.toBeInTheDocument();
    });
  });



  it('should handle creating a new organisation', async () => {
    api.createOrganisation.mockResolvedValueOnce({ success: true, data: { _id: 'org2', name: 'Local Club' } });
    render(<OrganisationPage />);
    await waitFor(() => {
      expect(screen.getByText('Global Sports Academy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Organisation/i }));

    const nameInput = screen.getByPlaceholderText('e.g. Sportizo');
    const domainInput = screen.getByPlaceholderText('e.g. sportizo.playmetric.com');
    const subDomainInput = screen.getByPlaceholderText('e.g. sportizo');
    
    fireEvent.change(nameInput, { target: { value: 'Local Club' } });
    fireEvent.change(domainInput, { target: { value: 'local.playmetric.com' } });
    fireEvent.change(subDomainInput, { target: { value: 'local' } });
    
    const form = screen.getByRole('button', { name: 'Create Organisation' }).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.createOrganisation).toHaveBeenCalledWith(expect.objectContaining({ 
        name: 'Local Club',
        domainUrl: 'local.playmetric.com',
        orgSubDomain: 'local'
      }));
      expect(api.getOrganisations).toHaveBeenCalledTimes(2);
    });
  });
});
