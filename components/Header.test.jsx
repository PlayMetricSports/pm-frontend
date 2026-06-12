import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Header from './Header';
import { useAuth } from './AuthContext';

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Header Component tests', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render default admin user details if no user provided', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(<Header />);
    
    // Default name
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    // Default role
    expect(screen.getByText('Academy Owner')).toBeInTheDocument();
  });

  it('should render user display name and role when user object is present', () => {
    useAuth.mockReturnValue({
      user: { firstName: 'Jane', lastName: 'Doe', designation: 'Head Coach' },
      logout: mockLogout,
    });
    render(<Header />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Head Coach')).toBeInTheDocument();
  });

  it('should toggle theme on button click', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    const { container } = render(<Header />);
    
    const themeBtn = screen.getByLabelText('Toggle Theme');
    expect(themeBtn).toBeInTheDocument();
    
    // Mock document element
    const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');
    
    act(() => {
      fireEvent.click(themeBtn);
    });
    
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    
    // Click again to toggle back
    act(() => {
      fireEvent.click(themeBtn);
    });
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should open dropdown on profile click and trigger logout', () => {
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
    render(<Header />);
    
    const profile = screen.getByText('Admin User').closest('.user-profile');
    
    // Dropdown items should not be visible initially
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    
    fireEvent.click(profile);
    
    // Dropdown should be open
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    
    // Click Sign Out
    fireEvent.click(screen.getByText('Sign Out'));
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    // Dropdown should close after click
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });
});
