import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import UsersPage from './page';
import { api } from '@/lib/api';

// Mock API layer
vi.mock('@/lib/api', () => ({
  api: {
    getEmployees: vi.fn(),
    getMetadata: vi.fn(),
    getUserRoles: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
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
    api.getEmployees.mockResolvedValue({ success: true, data: mockEmployees });
    api.getMetadata.mockResolvedValue({ success: true, data: { userDeptList: [] } });
    api.getUserRoles.mockResolvedValue({ success: true, data: { userRole: [] } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render page title and headers', async () => {
    render(<UsersPage />);
    expect(screen.getByText('Users & Staff')).toBeInTheDocument();
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
});
