import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import RolesPermissionsPage from './page';
import { api } from '@/lib/api';

// Mock API layer
vi.mock('@/lib/api', () => ({
  api: {
    getUserRoles: vi.fn(),
    getActionMenu: vi.fn(),
    getActions: vi.fn(),
    createUserRole: vi.fn(),
    updateUserRoleActions: vi.fn(),
  },
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('Roles and Permissions Page tests', () => {
  const mockRoles = [
    { _id: 'role1', userRoleName: 'Coach', userRoleKey: 'coach', userType: 'employee', isAdmin: 'no' },
    { _id: 'role2', userRoleName: 'Admin', userRoleKey: 'admin', userType: 'admin', isAdmin: 'yes' },
    { _id: 'role3', userRoleName: 'Operations', userRoleKey: 'operations', userType: 'employee', isAdmin: 'no' }
  ];

  const mockActionMenu = [
    {
      subSystemName: 'Core System',
      subSystemKey: 'core',
      modules: [
        {
          moduleName: 'Staff Panel',
          moduleKey: 'staff',
          subModules: [
            { subModuleName: 'View Staff', subModuleKey: 'view-staff', actionKey: 'act_view_staff' },
            { subModuleName: 'Edit Staff', subModuleKey: 'edit-staff', actionKey: 'act_edit_staff' }
          ]
        }
      ]
    }
  ];

  const mockActions = [
    { _id: 'act1', actionKey: 'act_view_staff', userRoleKey: 'coach' },
    { _id: 'act2', actionKey: 'act_view_staff', userRoleKey: 'operations' },
    { _id: 'act3', actionKey: 'act_edit_staff', userRoleKey: 'operations' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getUserRoles.mockResolvedValue({ success: true, data: { userRole: mockRoles } });
    api.getActionMenu.mockResolvedValue({ success: true, data: { actionMenu: mockActionMenu } });
    api.getActions.mockResolvedValue({ success: true, data: { actions: mockActions } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render roles list and select the first role (Coach) by default', { timeout: 15000 }, async () => {
    render(<RolesPermissionsPage />);

    // Wait for the roles and permission tree to load
    await waitFor(() => {
      expect(screen.getAllByText('Coach').length).toBeGreaterThan(0);
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    // Subsystem and modules should render
    expect(screen.getByText('Subsystem: Core System')).toBeInTheDocument();
    expect(screen.getByText('Module: Staff Panel')).toBeInTheDocument();

    // Verify checked checkboxes for Coach (first role):
    // act_view_staff should be checked, act_edit_staff should be unchecked
    const checkboxes = screen.getAllByRole('checkbox');
    const viewCheckbox = checkboxes[0];
    const editCheckbox = checkboxes[1];

    expect(viewCheckbox).toBeChecked();
    expect(editCheckbox).not.toBeChecked();
  });

  it('should switch selected role and update checkbox states locally and instantaneously', async () => {
    render(<RolesPermissionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    // Click on Operations role
    const operationsRoleItem = screen.getByText('Operations').closest('.role-item');
    fireEvent.click(operationsRoleItem);

    // Verify both checkboxes are now checked for Operations role
    const checkboxes = screen.getAllByRole('checkbox');
    const viewCheckbox = checkboxes[0];
    const editCheckbox = checkboxes[1];

    expect(viewCheckbox).toBeChecked();
    expect(editCheckbox).toBeChecked();
  });

  it('should toggle permission checkboxes on click', async () => {
    render(<RolesPermissionsPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')[0]).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const viewCheckbox = checkboxes[0];
    const editCheckbox = checkboxes[1];

    // Toggle unchecked checkbox to checked
    fireEvent.click(editCheckbox);
    expect(editCheckbox).toBeChecked();

    // Toggle checked checkbox to unchecked
    fireEvent.click(viewCheckbox);
    expect(viewCheckbox).not.toBeChecked();
  });

  it('should save updated permissions successfully', async () => {
    api.updateUserRoleActions.mockResolvedValueOnce({ success: true });
    // When refreshing actions mapping after save
    api.getActions.mockResolvedValue({ success: true, data: { actions: mockActions } });

    render(<RolesPermissionsPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')[1]).toBeInTheDocument();
    });

    const editCheckbox = screen.getAllByRole('checkbox')[1];
    
    // Check "Edit Staff" for Coach (initially unchecked)
    fireEvent.click(editCheckbox);
    expect(editCheckbox).toBeChecked();

    const saveButton = screen.getByRole('button', { name: /Save Permissions/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateUserRoleActions).toHaveBeenCalledWith(
        'role1',
        expect.objectContaining({
          userRoleName: 'Coach',
          userRoleKey: 'coach',
          userType: 'employee',
          actionIds: expect.arrayContaining(['act_view_staff', 'act_edit_staff'])
        })
      );
    });

    // Check for success banner
    expect(await screen.findByText('Permissions updated successfully!')).toBeInTheDocument();
  });

  it('should show the Create Role modal, submit inputs, and fetch roles again', async () => {
    api.createUserRole.mockResolvedValueOnce({ success: true });
    
    render(<RolesPermissionsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Role/i })).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /Create Role/i });
    fireEvent.click(createButton);

    // Check modal shows up
    expect(screen.getByText('Create New Role')).toBeInTheDocument();

    // Fill the form
    const nameInput = screen.getByPlaceholderText('e.g. Venue Manager');
    const keyInput = screen.getByPlaceholderText('e.g. venue-manager');
    const typeSelect = screen.getByRole('combobox');

    fireEvent.change(nameInput, { target: { value: 'Venue Manager' } });
    // The key input auto-generates on name change but can be overridden
    expect(keyInput.value).toBe('venue-manager');

    fireEvent.change(typeSelect, { target: { value: 'admin' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createUserRole).toHaveBeenCalledWith({
        userRoleName: 'Venue Manager',
        userRoleKey: 'venue-manager',
        userType: 'admin'
      });
    });

    // Modal should close and roles list should refresh
    await waitFor(() => {
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument();
      expect(api.getUserRoles).toHaveBeenCalled();
    });
  });
});
