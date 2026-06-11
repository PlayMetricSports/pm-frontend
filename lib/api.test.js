import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, getAuthToken, setAuthToken } from './api';

describe('API Service Layer tests', () => {
  beforeEach(() => {
    // Clear cookies before each test
    if (typeof document !== 'undefined') {
      document.cookie = 'pm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    // Mock global fetch
    global.fetch = vi.fn();
    
    // Mock localStorage
    if (typeof window !== 'undefined') {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cookie Helpers', () => {
    it('should set and get auth token correctly', () => {
      setAuthToken('test-token-123');
      expect(getAuthToken()).toBe('test-token-123');
    });

    it('should clear token correctly', () => {
      setAuthToken('test-token-123');
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('apiFetch and endpoints', () => {
    it('should fetch employees successfully', async () => {
      const mockData = { success: true, data: [{ firstName: 'Aritra' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      setAuthToken('my-bearer-token');
      const response = await api.getEmployees();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/staff/employee'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-bearer-token',
          }),
        })
      );
      expect(response).toEqual(mockData);
    });

    it('should throw an error on api error responses', async () => {
      const errorMsg = 'Invalid parameters';
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: errorMsg }),
      });

      await expect(api.getEmployees()).rejects.toThrow(errorMsg);
    });

    it('should execute login and return response correctly', async () => {
      const loginResponse = {
        success: true,
        data: {
          token: 'logged-in-token-xyz',
          email: 'test@playmetric.in',
        },
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => loginResponse,
      });

      // Mock verifyAuth call that is chained inside api.login
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { user: { email: 'test@playmetric.in' } } }),
      });

      const res = await api.login('test@playmetric.in', 'password123');

      expect(getAuthToken()).toBe('logged-in-token-xyz');
      expect(res).toEqual(loginResponse);
    });

    it('should handle Organisation CRUD operations', async () => {
      // getOrganisations
      const mockOrgs = { success: true, data: [{ name: 'Sportizo' }] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockOrgs,
      });
      const orgsRes = await api.getOrganisations();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/org'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(orgsRes).toEqual(mockOrgs);

      // getOrganisation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ name: 'Sportizo' }),
      });
      await api.getOrganisation('123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/org/123'),
        expect.objectContaining({ method: 'GET' })
      );

      // createOrganisation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });
      await api.createOrganisation({ name: 'NewOrg' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/org/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'NewOrg' }),
        })
      );

      // updateOrganisation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.updateOrganisation('123', { name: 'UpdatedOrg' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/org/123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'UpdatedOrg' }),
        })
      );

      // deleteOrganisation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.deleteOrganisation('123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/org/123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should handle Venue CRUD operations', async () => {
      // getVenues
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.getVenues('org-123', 'stadium');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/venue?orgId=org-123&search=stadium'),
        expect.objectContaining({ method: 'GET' })
      );

      // createVenue
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });
      await api.createVenue({ name: 'Court A', orgId: 'org-123' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/venue/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Court A', orgId: 'org-123' }),
        })
      );

      // deleteVenue
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.deleteVenue('v-123', { name: 'Court A' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/venue/v-123'),
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ name: 'Court A' }),
        })
      );
    });

    it('should handle Sport CRUD operations', async () => {
      // getSports
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.getSports('org-123', 'badminton');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/sport?orgId=org-123&search=badminton'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle Timeslot CRUD operations', async () => {
      // getTimeslots
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      await api.getTimeslots('org-123');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/timeslot?orgId=org-123'),
        expect.objectContaining({ method: 'GET' })
      );

      // createTimeslot
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });
      await api.createTimeslot({ slotIndex: 1, orgId: 'org-123', startTime: '11:00', endTime: '12:00' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/organisation/timeslot/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ slotIndex: 1, orgId: 'org-123', startTime: '11:00', endTime: '12:00' }),
        })
      );
    });
  });
});
