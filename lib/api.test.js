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
  });
});
