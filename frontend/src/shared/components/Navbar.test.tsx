import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from 'src/test/test-utils';
import Navbar from './Navbar';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock the Redux hooks
const mockDispatch = vi.fn();
const mockSelector = vi.fn();

vi.mock('src/app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockSelector(),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the auth slice
vi.mock('src/features/auth/authSlice', () => ({
  getCurrentToken: vi.fn(),
  logOut: vi.fn(),
}));

// Mock ModeToggle component
vi.mock('./ModeToggle', () => ({
  ModeToggle: () => <button>Toggle Theme</button>,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window scroll
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    // Mock authenticated state by default
    mockSelector.mockReturnValue('mock-token');
  });

  it('renders nothing when user is not authenticated', () => {
    mockSelector.mockReturnValue(null);
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the logo and brand name when authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText('ICICI Breeze')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /logo/i })).toBeInTheDocument();
  });

  it('renders navigation items for desktop', () => {
    render(<Navbar />);
    
    // Check if navigation items are present
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    
    expect(screen.getByRole('link', { name: /instruments/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /accounts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('shows mobile menu toggle button', () => {
    render(<Navbar />);
    
    // Look for hamburger menu button
    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(button => 
      button.querySelector('svg') && 
      (button.textContent === '' || !button.textContent?.includes('Toggle Theme'))
    );
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', async () => {
    render(<Navbar />);
    
    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(button => 
      button.querySelector('svg') && 
      (button.textContent === '' || !button.textContent?.includes('Toggle Theme'))
    );
    
    expect(hamburgerButton).toBeInTheDocument();
    
    // Initially mobile menu should not be visible
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    
    // Click to open menu
    fireEvent.click(hamburgerButton!);
    
    // Wait for mobile menu to appear
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('applies scroll styling when page is scrolled', () => {
    render(<Navbar />);
    
    const navbar = screen.getByRole('navigation');
    
    // Initially should not have shadow
    expect(navbar).not.toHaveClass('shadow-md');
    
    // Simulate scroll beyond threshold
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
    fireEvent.scroll(window);
    
    // After scroll, should have shadow styling
    expect(navbar).toHaveClass('shadow-md');
  });

  it('renders mode toggle component', () => {
    render(<Navbar />);
    
    // Look for theme toggle button
    const themeButton = screen.getByText('Toggle Theme');
    expect(themeButton).toBeInTheDocument();
  });

  it('shows user avatar and dropdown', () => {
    render(<Navbar />);
    
    // Look for avatar image
    const avatar = screen.getByRole('img', { name: /profile/i });
    expect(avatar).toBeInTheDocument();
  });

  it('shows logout option in dropdown', async () => {
    render(<Navbar />);
    
    // Find and click avatar/user menu trigger
    const avatar = screen.getByRole('img', { name: /profile/i });
    const avatarButton = avatar.closest('button');
    expect(avatarButton).toBeInTheDocument();
    
    fireEvent.click(avatarButton!);
    
    await waitFor(() => {
      const logoutOption = screen.getByText('Sign Out');
      expect(logoutOption).toBeInTheDocument();
    });
  });

  it('calls signOut when logout is clicked', async () => {
    render(<Navbar />);
    
    // Open dropdown
    const avatar = screen.getByRole('img', { name: /profile/i });
    const avatarButton = avatar.closest('button');
    fireEvent.click(avatarButton!);
    
    await waitFor(() => {
      const logoutOption = screen.getByText('Sign Out');
      fireEvent.click(logoutOption);
    });
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles responsive behavior', () => {
    render(<Navbar />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
    
    // Test that responsive classes are applied
    expect(navbar).toHaveClass('sticky', 'top-0', 'z-30', 'w-full');
  });

  it('closes mobile menu when navigation item is clicked', async () => {
    render(<Navbar />);
    
    // Open mobile menu
    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(button => 
      button.querySelector('svg') && 
      (button.textContent === '' || !button.textContent?.includes('Toggle Theme'))
    );
    
    fireEvent.click(hamburgerButton!);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
    
    // Click on a navigation item
    const homeLink = screen.getAllByRole('link', { name: /home/i })[1]; // Mobile version
    fireEvent.click(homeLink);
    
    // Menu should close (Sign Out button should disappear from mobile menu)
    await waitFor(() => {
      const signOutButtons = screen.queryAllByText('Sign Out');
      // Should only have the desktop dropdown version, not the mobile version
      expect(signOutButtons.length).toBeLessThanOrEqual(1);
    });
  });
});
