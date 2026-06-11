'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

/**
 * Toast notification provider. Wrap your app with this to enable toast notifications.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Employee created successfully', 'success');
 *   showToast('Failed to save changes', 'error');
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => dismissToast(toast.id)}
          >
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' :
              toast.type === 'error' ? 'fa-circle-xmark' :
              toast.type === 'warning' ? 'fa-triangle-exclamation' :
              'fa-circle-info'
            }`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 99999;
          display: flex;
          flex-direction: column-reverse;
          gap: 0.75rem;
          pointer-events: none;
        }

        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          transition: opacity 0.2s, transform 0.2s;
        }

        .toast:hover {
          transform: translateX(-4px);
        }

        .toast-success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #10b981;
        }

        .toast-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
        }

        .toast-warning {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.25);
          color: #f59e0b;
        }

        .toast-info {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          color: #3b82f6;
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op if used outside provider (graceful degradation)
    return { showToast: () => {} };
  }
  return context;
}
