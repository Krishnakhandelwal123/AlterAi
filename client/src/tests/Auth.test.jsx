import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../pages/Auth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '../hooks/useAuth';

describe('Auth page', () => {
  it('renders all oauth buttons', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
      signInWithTwitter: vi.fn()
    });

    render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );

    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with x/i)).toBeInTheDocument();
  });
});
