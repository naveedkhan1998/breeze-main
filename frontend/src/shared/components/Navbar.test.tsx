import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from 'src/test/test-utils';
import Navbar from './Navbar';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      [key: string]: unknown;
    }) => (
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

// Mock sonner
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

    // Get all home links and check the desktop one
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    
    // The first home link should be the desktop version
    const desktopHomeLink = homeLinks[0];
    expect(desktopHomeLink).toBeInTheDocument();
    expect(desktopHomeLink).toHaveAttribute('href', '/');

    // Check other navigation items exist (they will also have duplicates)
    expect(screen.getAllByRole('link', { name: /instruments/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /accounts/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows mobile menu toggle button', () => {
    render(<Navbar />);

    // Look for hamburger menu button
    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(
      button =>
        button.querySelector('svg') &&
        (button.textContent === '' ||
          !button.textContent?.includes('Toggle Theme'))
    );
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', async () => {
    render(<Navbar />);

    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(
      button =>
        button.querySelector('svg') &&
        (button.textContent === '' ||
          !button.textContent?.includes('Toggle Theme'))
    );

    expect(hamburgerButton).toBeInTheDocument();

    // Check that mobile menu container is not visible initially
    const mobileMenuContainer = document.querySelector('.fixed.top-16.left-0.right-0');
    expect(mobileMenuContainer).toHaveClass('opacity-0', '-translate-y-full', 'pointer-events-none');

    // Click to open menu
    fireEvent.click(hamburgerButton!);

    // Wait for mobile menu to appear
    await waitFor(() => {
      const updatedMobileMenuContainer = document.querySelector('.fixed.top-16.left-0.right-0');
      expect(updatedMobileMenuContainer).toHaveClass('opacity-100', 'translate-y-0');
      expect(updatedMobileMenuContainer).not.toHaveClass('pointer-events-none');
    });
  });

  it('renders mode toggle component', () => {
    render(<Navbar />);

    // Look for theme toggle button - there are two (desktop and mobile)
    const themeButtons = screen.getAllByText('Toggle Theme');
    expect(themeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('handles responsive behavior', () => {
    render(<Navbar />);

    // Target the main navbar container by its actual classes
    const navbar = document.querySelector('nav.sticky.top-0.z-50.w-full');
    expect(navbar).toBeInTheDocument();

    // Test that responsive classes are applied
    expect(navbar).toHaveClass('sticky', 'top-0', 'z-50', 'w-full');
  });

  it('closes mobile menu when navigation item is clicked', async () => {
    render(<Navbar />);

    // Open mobile menu
    const menuButtons = screen.getAllByRole('button');
    const hamburgerButton = menuButtons.find(
      button =>
        button.querySelector('svg') &&
        (button.textContent === '' ||
          !button.textContent?.includes('Toggle Theme'))
    );

    fireEvent.click(hamburgerButton!);

    // Wait for menu to open
    await waitFor(() => {
      const mobileMenuContainer = document.querySelector('.fixed.top-16.left-0.right-0');
      expect(mobileMenuContainer).toHaveClass('opacity-100', 'translate-y-0');
    });

    // Click on a navigation item in the mobile menu
    const mobileMenuContainer = document.querySelector('.fixed.top-16.left-0.right-0');
    const homeLink = mobileMenuContainer?.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
    fireEvent.click(homeLink!);

    // Menu should close
    await waitFor(() => {
      const updatedMobileMenuContainer = document.querySelector('.fixed.top-16.left-0.right-0');
      expect(updatedMobileMenuContainer).toHaveClass('opacity-0', '-translate-y-full', 'pointer-events-none');
    });
  });
});
