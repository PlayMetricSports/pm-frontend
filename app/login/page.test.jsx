import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from './page';
import { useAuth } from '@/components/AuthContext';

vi.mock('@/components/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Page tests', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
    // Process env mock
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
  });

  it('should render login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should show error when fields are empty on submit', async () => {
    render(<LoginPage />);
    
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);
    
    // We are preventing default and showing error via state
    // But since inputs are "required", the browser handles it natively if we use form submit.
    // However, our code checks `if (!email || !password) setError(...)`
    // Let's trigger submit on the form directly to bypass native validation for testing this logic
    const form = submitBtn.closest('form');
    fireEvent.submit(form);

    expect(await screen.findByText('Please fill in all fields')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login function with credentials on submit', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const form = screen.getByRole('button', { name: /Sign In/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.submit(form);
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should display error message if login throws an error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const form = screen.getByRole('button', { name: /Sign In/i }).closest('form');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-pass' } });
    
    fireEvent.submit(form);
    
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should fill demo credentials when clicking demo card in demo mode', () => {
    render(<LoginPage />);
    
    const demoCard = screen.getByText('Click to fill demo credentials');
    fireEvent.click(demoCard);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    expect(emailInput.value).toBe('aritra.naharay@gmail.com');
    expect(passwordInput.value).toBe('PMetrix@123');
  });
});
