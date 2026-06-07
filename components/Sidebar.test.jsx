import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Sidebar from './Sidebar';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: {
      actionMenu: [
        {
          modules: [
            {
              moduleName: 'Main',
              subModules: [
                { subModuleKey: 'main-dashboard', subModuleName: 'Dashboard', subModuleIcon: 'fa-chart-pie' },
                { subModuleKey: 'users', subModuleName: 'Users & Staff', subModuleIcon: 'fa-user-shield' },
                { subModuleKey: 'user-role', subModuleName: 'User Roles', subModuleIcon: 'fa-users-gear' }
              ]
            }
          ]
        }
      ]
    }
  })
}));

describe('Sidebar active state matching', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('highlights Dashboard when on "/"', () => {
    mockPathname = '/';
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    const usersLink = screen.getByRole('link', { name: /Users & Staff/i });
    const rolesLink = screen.getByRole('link', { name: /User Roles/i });

    expect(dashboardLink.className).toContain('active');
    expect(usersLink.className).not.toContain('active');
    expect(rolesLink.className).not.toContain('active');
  });

  it('highlights only Users & Staff when on "/users"', () => {
    mockPathname = '/users';
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    const usersLink = screen.getByRole('link', { name: /Users & Staff/i });
    const rolesLink = screen.getByRole('link', { name: /User Roles/i });

    expect(dashboardLink.className).not.toContain('active');
    expect(usersLink.className).toContain('active');
    expect(rolesLink.className).not.toContain('active');
  });

  it('highlights only User Roles when on "/users/roles"', () => {
    mockPathname = '/users/roles';
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    const usersLink = screen.getByRole('link', { name: /Users & Staff/i });
    const rolesLink = screen.getByRole('link', { name: /User Roles/i });

    expect(dashboardLink.className).not.toContain('active');
    expect(usersLink.className).not.toContain('active');
    expect(rolesLink.className).toContain('active');
  });

  it('highlights only Users & Staff when on nested user sub-routes like "/users/123/edit"', () => {
    mockPathname = '/users/123/edit';
    render(<Sidebar />);
    
    const usersLink = screen.getByRole('link', { name: /Users & Staff/i });
    const rolesLink = screen.getByRole('link', { name: /User Roles/i });

    expect(usersLink.className).toContain('active');
    expect(rolesLink.className).not.toContain('active');
  });
});
