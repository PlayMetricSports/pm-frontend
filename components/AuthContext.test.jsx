import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, AuthGuard, useAuth } from './AuthContext';
import { api } from '@/lib/api';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/',
}));

// Mock API layer
vi.mock('@/lib/api', () => ({
  api: {
    verifyAuth: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'mock-token'),
  setAuthToken: vi.fn(),
}));

// Test Consumer component
function TestConsumer() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-email">{user?.email || 'no-email'}</span>
      <span data-testid="user-role">{user?.userRoleName || 'no-role'}</span>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext and AuthGuard tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthProvider Initialization', () => {
    it('should initialize with a user when verifyAuth succeeds', async () => {
      api.verifyAuth.mockResolvedValueOnce({
        success: true,
        user: { email: 'aritra@playmetric.in', userRoleName: 'Admin', userType: 'admin' },
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      });
      expect(screen.getByTestId('user-email').textContent).toBe('aritra@playmetric.in');
      expect(screen.getByTestId('user-role').textContent).toBe('Admin');
    });

    it('should use fallback admin user when verifyAuth fails but token exists', async () => {
      api.verifyAuth.mockRejectedValueOnce(new Error('Network error'));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-state').textContent).toBe('authenticated');
      });
      expect(screen.getByTestId('user-email').textContent).toBe('aritra.naharay@gmail.com');
    });
  });

  describe('AuthGuard Route Restrictions', () => {
    it('should render children if user has required permissions', async () => {
      // Mock authenticated admin user
      api.verifyAuth.mockResolvedValueOnce({
        success: true,
        user: { email: 'admin@playmetric.in', userType: 'admin', userRoleName: 'Admin', isAdmin: 'yes' },
      });

      render(
        <AuthProvider>
          <AuthGuard>
            <div data-testid="secured-content">Guarded Page Content</div>
          </AuthGuard>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('secured-content')).toBeInTheDocument();
      });
    });
  });
});
