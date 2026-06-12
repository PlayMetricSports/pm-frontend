import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastProvider, useToast } from './Toast';

// A test component to trigger toasts
function ToastTester({ message, type, duration }) {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type, duration)}>
      Show Toast
    </button>
  );
}

describe('Toast Component tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should render children correctly', () => {
    render(
      <ToastProvider>
        <div>Test Child</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should show a toast when triggered and auto-dismiss after duration', () => {
    render(
      <ToastProvider>
        <ToastTester message="Success action" type="success" duration={3000} />
      </ToastProvider>
    );
    
    // Trigger toast
    fireEvent.click(screen.getByText('Show Toast'));
    
    // Toast should be visible
    expect(screen.getByText('Success action')).toBeInTheDocument();
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Toast should be removed
    expect(screen.queryByText('Success action')).not.toBeInTheDocument();
  });

  it('should dismiss toast on click', () => {
    render(
      <ToastProvider>
        <ToastTester message="Click to dismiss" type="error" />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Toast'));
    
    const toastMessage = screen.getByText('Click to dismiss');
    expect(toastMessage).toBeInTheDocument();
    
    act(() => {
      fireEvent.click(toastMessage.parentElement);
    });
    
    // Should be removed immediately
    expect(screen.queryByText('Click to dismiss')).not.toBeInTheDocument();
  });

  it('should handle different toast types correctly', () => {
    render(
      <ToastProvider>
        <ToastTester message="Error msg" type="error" />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Toast'));
    
    const toast = screen.getByText('Error msg').parentElement;
    expect(toast).toHaveClass('toast-error');
  });

  it('useToast should degrade gracefully outside provider', () => {
    let contextValue;
    function OutsideConsumer() {
      contextValue = useToast();
      return null;
    }
    
    render(<OutsideConsumer />);
    
    expect(typeof contextValue.showToast).toBe('function');
    // Should not throw when called
    expect(() => contextValue.showToast('Test')).not.toThrow();
  });
});
