import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 5000 });

if (typeof window !== 'undefined') {
  // Setup global fetch mock
  global.fetch = vi.fn();

  // Suppress known React test warnings
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('for a non-boolean attribute') || args[0].includes('jsx'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  const createStorageMock = () => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index) => Object.keys(store)[index] || null),
    };
  };

  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
    configurable: true,
  });
}


