import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import TimeslotPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getOrganisations: vi.fn(),
    getTimeslots: vi.fn(),
    createTimeslot: vi.fn(),
    updateTimeslot: vi.fn(),
    deleteTimeslot: vi.fn(),
  },
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe('Timeslot Page tests', () => {
  const mockOrgs = [{ _id: 'org1', name: 'Global Sports Academy' }];
  const mockSlots = [{ _id: 'slot1', slotIndex: 1, orgId: 'org1', startTime: '10:00', endTime: '11:00' }];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOrganisations.mockResolvedValue({ success: true, data: { organisations: mockOrgs } });
    api.getTimeslots.mockResolvedValue({ success: true, data: { timeslots: mockSlots } });
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the loading state and then the table', async () => {
    render(<TimeslotPage />);
    expect(screen.getByText(/Loading timeslots.../i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading timeslots.../i)).not.toBeInTheDocument();
    });

    expect(screen.getAllByText(/Slot #/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText('Global Sports Academy')[0]).toBeInTheDocument();
  });

  it('should handle creating a new timeslot', async () => {
    api.createTimeslot.mockResolvedValueOnce({ success: true, data: { _id: 'slot2', slotIndex: 2, orgId: 'org1', startTime: '12:00', endTime: '13:00' } });
    
    const { container } = render(<TimeslotPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading timeslots.../i)).not.toBeInTheDocument();
    });
    expect(screen.getAllByText(/Slot #/i)[0]).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Create Timeslot/i }));

    const slotIndexInput = container.querySelector('input[name="slotIndex"]');
    const orgSelect = container.querySelector('select[name="orgId"]');
    const startTimeInput = container.querySelector('input[name="startTime"]');
    const endTimeInput = container.querySelector('input[name="endTime"]');
    
    fireEvent.change(slotIndexInput, { target: { value: '2', name: 'slotIndex' } });
    fireEvent.change(orgSelect, { target: { value: 'org1', name: 'orgId' } });
    fireEvent.change(startTimeInput, { target: { value: '12:00', name: 'startTime' } });
    fireEvent.change(endTimeInput, { target: { value: '13:00', name: 'endTime' } });
    
    const form = screen.getByRole('button', { name: 'Create Slot' }).closest('form');
    
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(api.createTimeslot).toHaveBeenCalledWith(expect.objectContaining({ 
        slotIndex: 2,
        orgId: 'org1',
        startTime: '12:00',
        endTime: '13:00'
      }));
      expect(api.getTimeslots).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle API failure gracefully', async () => {
    api.getTimeslots.mockRejectedValueOnce(new Error('API Down'));
    
    render(<TimeslotPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch timeslots from API/i)).toBeInTheDocument();
    });
  });
});
