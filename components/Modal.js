'use client';

import { useEffect, useCallback } from 'react';

/**
 * Reusable Modal component with:
 * - Backdrop click to close
 * - Escape key to close
 * - Slide-in animation
 * - Consistent styling (uses globals.css .modal-* classes)
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Called when modal should close
 * @param {string} props.title - Modal header title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {string} [props.maxWidth='500px'] - Max width of modal content
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
