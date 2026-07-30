import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, AuthProvider } from '../AuthContext';
import { useContext } from 'react';
import api from '../../utils/axios';
import { vi } from 'vitest';

vi.mock('../../utils/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    }
  };
});

const TestComponent = () => {
  const { user, loading, login, logout, register } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially and then resolves to no user if no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('fetches user if token is present in localStorage', async () => {
    localStorage.setItem('token', 'fake-token');
    api.get.mockResolvedValueOnce({ data: { email: 'test@test.com' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
    
    expect(api.get).toHaveBeenCalledWith('/api/v1/auth/me');
  });

  it('handles login', async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: 'new-token' } });
    api.get.mockResolvedValueOnce({ data: { email: 'test@test.com' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('new-token');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });
  });

  it('handles logout', async () => {
    localStorage.setItem('token', 'fake-token');
    api.get.mockResolvedValueOnce({ data: { email: 'test@test.com' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    });

    await userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });
});
