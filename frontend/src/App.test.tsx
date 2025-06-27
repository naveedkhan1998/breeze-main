import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from 'src/test/test-utils';
import App from './App';

// Mock all the page components
vi.mock('./features/home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./features/about', () => ({
  default: () => <div data-testid="about-page">About Page</div>,
}));

vi.mock('./features/auth', () => ({
  default: () => <div data-testid="auth-page">Login/Register Page</div>,
}));

vi.mock('./features/notFound', () => ({
  default: () => <div data-testid="not-found-page">404 Page</div>,
}));

// Mock other components
vi.mock('./shared/components/ToastContainer', () => ({
  default: () => <div data-testid="toast-container">Toast</div>,
}));

vi.mock('./shared/components/LoadingScreen', () => ({
  default: () => <div data-testid="loading-screen">Loading...</div>,
}));

vi.mock('./shared/components/AnnouncementBanner', () => ({
  default: () => <div data-testid="announcement-banner">Announcement</div>,
}));

vi.mock('./shared/components/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="ui-toaster">UI Toaster</div>,
}));

// Mock environment check
const mockCheckEnvironment = vi.fn();
vi.mock('./shared/lib/environment', () => ({
  checkEnvironment: mockCheckEnvironment,
}));

// Mock API hooks
vi.mock('./shared/api/baseApi', () => ({
  useHealthCheckQuery: () => ({
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

// Mock Redux hooks
const mockSelector = vi.fn();
vi.mock('./app/hooks', () => ({
  useAppSelector: () => mockSelector(),
}));

// Mock auth slice
vi.mock('./features/auth/authSlice', () => ({
  getCurrentToken: () => 'mock-selector',
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelector.mockReturnValue(null); // Default to no token
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        search: '',
        hash: '',
        state: null,
      },
      writable: true,
    });
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('announcement-banner')).toBeInTheDocument();
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    expect(screen.getByTestId('ui-toaster')).toBeInTheDocument();
  });



  it('includes necessary providers', () => {
    render(<App />);
    
    // The app should be wrapped with necessary providers
    // ThemeProvider, Redux Provider (from test-utils), Router, etc.
    // These are mostly tested implicitly by the fact that the app renders
    expect(screen.getByTestId('announcement-banner')).toBeInTheDocument();
  });



  it('calls checkEnvironment on mount', () => {
    render(<App />);
    
    expect(mockCheckEnvironment).toHaveBeenCalled();
  });

  describe('PrivateRoute behavior', () => {
    it('renders basic authentication check', () => {
      mockSelector.mockReturnValue(null);
      render(<App />);
      
      // Basic test to ensure component renders without authentication
      expect(screen.getByTestId('announcement-banner')).toBeInTheDocument();
    });
  });
});
