import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Header from '../components/Header';
import useAuthStore from '../store/authStore';

describe('Header', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      fullName: '',
      avatarUrl: null,
      token: null,
      role: null,
    });
  });

  it('показывает кнопку "Войти" для гостя', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('показывает имя пользователя после входа', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      fullName: 'Иванов Иван',
      role: 'User',
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('Иванов')).toBeInTheDocument();
    expect(screen.getByText('Иван')).toBeInTheDocument();
  });
});