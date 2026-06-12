import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import ActionsPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getSubsystems: vi.fn(),
    getModules: vi.fn(),
    getSubmodules: vi.fn(),
    getActions: vi.fn(),
    getUserRoles: vi.fn(),
  },
}));

describe('actions Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getSubsystems.mockResolvedValue({ success: true, data: { subSystems: [] } });
    api.getModules.mockResolvedValue({ success: true, data: { modules: [] } });
    api.getSubmodules.mockResolvedValue({ success: true, data: { modules: [] } });
    api.getActions.mockResolvedValue({ success: true, data: { actions: [] } });
    api.getUserRoles.mockResolvedValue({ success: true, data: { userRole: [] } });
  });

  it('should render without crashing', async () => {
    await act(async () => {
      render(<ActionsPage />);
    });
    expect(screen.getByText('Actions & Hierarchy')).toBeInTheDocument();
  });
});
