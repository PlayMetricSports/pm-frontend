import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import UsersPage from './page';
import { api } from '@/lib/api';

// Mock useAuth
let mockAuthUser = {
  email: 'admin@playmetric.in',
  userType: 'admin',
  organization: 'Sportizo',
};

vi.mock('@/components/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    loading: false,
    isAdmin: mockAuthUser?.userType === 'admin' || mockAuthUser?.isAdmin === 'yes',
  }),
}));

// Mock API layer
vi.mock('@/lib/api', () => ({
  api: {
    getEmployees: vi.fn(),
    getMetadata: vi.fn(),
    getUserRoles: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    getOrganisations: vi.fn(),
  },
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

describe('Users Page Directory tests', () => {
  const mockEmployees = [
    {
      _id: '1',
      firstName: 'Rohan',
      lastName: 'Mehta',
      email: 'rohan@playmetric.in',
      employeeCode: 'EV-101',
      userRole: 'admin',
      department: 'administration',
      mobileNumber: '9876543210',
    },
    {
      _id: '2',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram@playmetric.in',
      employeeCode: 'EV-103',
      userRole: 'coach',
      department: 'coaching',
      mobileNumber: '9876543212',
    },
    {
      _id: '3',
      firstName: 'Anjali',
      lastName: 'Desai',
      email: 'anjali@playmetric.in',
      employeeCode: 'EV-102',
      userRole: 'operations',
      department: 'operations',
      mobileNumber: '9876543211',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = {
      email: 'admin@playmetric.in',
      userType: 'admin',
      organization: 'Sportizo',
    };
    api.getEmployees.mockResolvedValue({ success: true, data: mockEmployees });
    api.getMetadata.mockResolvedValue({ success: true, data: { userDeptList: [] } });
    api.getUserRoles.mockResolvedValue({ success: true, data: { userRole: [] } });
    api.getOrganisations.mockResolvedValue({ success: true, data: [{ name: 'Sportizo' }, { name: 'PlayArena' }] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render page title and headers', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Users & Staff')).toBeInTheDocument();
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    });
  });

  it('should fetch and render employees list on mount', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
      expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
      expect(screen.getByText('Anjali Desai')).toBeInTheDocument();
    });
  });

  it('should filter staff list based on tab selection', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    });

    // Click on Administrators tab
    const adminTab = screen.getByRole('button', { name: 'Administrators' });
    fireEvent.click(adminTab);

    // Rohan Mehta should be visible, others filtered out
    expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    expect(screen.queryByText('Vikram Singh')).not.toBeInTheDocument();
    expect(screen.queryByText('Anjali Desai')).not.toBeInTheDocument();
  });

  it('should filter staff list based on search queries input', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search staff...');
    fireEvent.change(searchInput, { target: { value: 'Vikram' } });

    // Only Vikram should remain
    expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
    expect(screen.queryByText('Rohan Mehta')).not.toBeInTheDocument();
    expect(screen.queryByText('Anjali Desai')).not.toBeInTheDocument();
  });

  it('should render organization select dropdown for admin with options', async () => {
    // Current user is admin (default setup)
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    });

    const inviteBtn = screen.getByRole('button', { name: 'Invite Staff' });
    fireEvent.click(inviteBtn);

    // Select coach to enable the organization dropdown
    const roleSelect = screen.getByLabelText('Role', { selector: 'select' });
    fireEvent.change(roleSelect, { target: { value: 'coach' } });

    // Verify modal is open and shows Organization select dropdown
    const orgSelect = screen.getByLabelText('Organization');
    expect(orgSelect).toBeInTheDocument();
    expect(orgSelect).not.toBeDisabled();

    // Verify default value is organisationsList[0] ("Sportizo")
    expect(orgSelect.value).toBe('Sportizo');

    // Verify options are present
    expect(screen.getByRole('option', { name: 'Sportizo' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'PlayArena' })).toBeInTheDocument();
  });

  it('should lock organization dropdown selector to the parent org for normal employee', async () => {
    // Current user is standard employee
    mockAuthUser = {
      email: 'rohan.coach@playmetric.in',
      userType: 'employee',
      organization: 'PlayArena',
    };

    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('Rohan Mehta')).toBeInTheDocument();
    });

    const inviteBtn = screen.getByRole('button', { name: 'Invite Staff' });
    fireEvent.click(inviteBtn);

    // Select coach to enable the organization dropdown
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'coach' } });

    // Verify organization dropdown is disabled/locked
    const orgSelect = screen.getByLabelText('Organization');
    expect(orgSelect).toBeDisabled();

    // Verify option is set to user.organization ("PlayArena")
    expect(orgSelect.value).toBe('PlayArena');
  });
});
