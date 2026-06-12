import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LayoutWrapper from './LayoutWrapper';
import { usePathname } from 'next/navigation';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock child components to verify they render
vi.mock('./Sidebar', () => ({
  default: () => <div data-testid="sidebar-mock">Sidebar</div>,
}));

vi.mock('./Header', () => ({
  default: () => <div data-testid="header-mock">Header</div>,
}));

vi.mock('./AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider-mock">{children}</div>,
  AuthGuard: ({ children }) => <div data-testid="auth-guard-mock">{children}</div>,
  useAuth: () => ({ user: { email: 'test@example.com' }, loading: false }),
}));

vi.mock('./Toast', () => ({
  ToastProvider: ({ children }) => <div data-testid="toast-provider-mock">{children}</div>,
}));

describe('LayoutWrapper Component tests', () => {
  it('should render only providers without Layout for login page', () => {
    usePathname.mockReturnValue('/login');
    render(
      <LayoutWrapper>
        <div data-testid="page-content">Login Page Content</div>
      </LayoutWrapper>
    );

    expect(screen.getByTestId('auth-provider-mock')).toBeInTheDocument();
    expect(screen.getByTestId('auth-guard-mock')).toBeInTheDocument();
    expect(screen.getByTestId('toast-provider-mock')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();

    // Should NOT render Sidebar and Header
    expect(screen.queryByTestId('sidebar-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header-mock')).not.toBeInTheDocument();
  });

  it('should render full layout (Sidebar, Header, App Container) for non-login pages', () => {
    usePathname.mockReturnValue('/dashboard');
    render(
      <LayoutWrapper>
        <div data-testid="page-content">Dashboard Content</div>
      </LayoutWrapper>
    );

    expect(screen.getByTestId('auth-provider-mock')).toBeInTheDocument();
    expect(screen.getByTestId('auth-guard-mock')).toBeInTheDocument();
    expect(screen.getByTestId('toast-provider-mock')).toBeInTheDocument();
    
    // Should render layout components
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });
});
