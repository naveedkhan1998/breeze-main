import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from 'src/test/test-utils';
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
vi.mock('sonner', () => ({
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

// Mock all shadcn/ui components
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div role="menuitem" {...props}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <div />,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <div />,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div
      data-testid="sheet"
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
    >
      {children}
    </div>
  ),
  SheetContent: ({
    children,
    side,
  }: {
    children: React.ReactNode;
    side?: string;
  }) => (
    <div data-testid="sheet-content" data-side={side}>
      {children}
    </div>
  ),
  SheetTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid="sheet-trigger" data-aschild={asChild}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
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
    expect(screen.getByText('Wrapper')).toBeInTheDocument();
  });

  it('renders navigation items for desktop', () => {
    render(<Navbar />);

    // Check desktop navigation links - use getAllByRole for elements that appear multiple times
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);

    const instrumentsLinks = screen.getAllByRole('link', {
      name: /instruments/i,
    });
    expect(instrumentsLinks.length).toBeGreaterThanOrEqual(1);

    const accountLinks = screen.getAllByRole('link', { name: /account/i });
    expect(accountLinks.length).toBeGreaterThanOrEqual(1);

    const aboutLinks = screen.getAllByRole('link', { name: /about/i });
    expect(aboutLinks.length).toBeGreaterThanOrEqual(1);

    const supportLinks = screen.getAllByRole('link', { name: /support/i });
    expect(supportLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders search bar on desktop', () => {
    render(<Navbar />);

    const searchInput = screen.getByPlaceholderText(
      'Search instruments, symbols...'
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeDisabled();
  });

  it('shows mobile menu toggle button', () => {
    render(<Navbar />);

    const sheetTrigger = screen.getByTestId('sheet-trigger');
    expect(sheetTrigger).toBeInTheDocument();

    const menuButton = sheetTrigger.querySelector('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('renders user profile information', () => {
    render(<Navbar />);

    // Check for user name and avatar - use getAllByText for elements that appear multiple times
    const userNameElements = screen.getAllByText('Naveed Khan');
    expect(userNameElements.length).toBeGreaterThanOrEqual(1);

    const premiumElements = screen.getAllByText('Premium');
    expect(premiumElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders mode toggle component', () => {
    render(<Navbar />);

    // Look for theme toggle buttons - there should be desktop and mobile versions
    const themeButtons = screen.getAllByText('Toggle Theme');
    expect(themeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('handles responsive behavior with scroll', () => {
    render(<Navbar />);

    // Test that navbar container exists
    const navbar = document.querySelector('nav.sticky.top-0.z-50.w-full');
    expect(navbar).toBeInTheDocument();
    expect(navbar).toHaveClass('sticky', 'top-0', 'z-50', 'w-full');

    // Mock scroll event
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
    fireEvent.scroll(window);

    // The component should update its classes based on scroll
    expect(navbar).toHaveClass('backdrop-blur-xl');
  });

  it('shows user dropdown menu items', () => {
    render(<Navbar />);

    // Look for dropdown menu content - use getAllByText for items that appear multiple times
    const emailElements = screen.getAllByText('admin@icici.com');
    expect(emailElements.length).toBeGreaterThanOrEqual(1);

    const premiumElements = screen.getAllByText('Premium');
    expect(premiumElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Verified')).toBeInTheDocument();

    // Use getAllByText for elements that appear in both desktop and mobile
    const accountSettingsElements = screen.getAllByText('Account Settings');
    expect(accountSettingsElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Trading Settings')).toBeInTheDocument();
  });

  it('handles logout functionality', () => {
    render(<Navbar />);

    // Find and click the logout button - look for the text within the dropdown menu
    const signOutElements = screen.getAllByText('Sign Out');
    expect(signOutElements.length).toBeGreaterThanOrEqual(1);

    // Click the first sign out button (desktop dropdown)
    fireEvent.click(signOutElements[0]);

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders mobile search in sheet content', () => {
    render(<Navbar />);

    // The mobile search should be in the sheet content
    const mobileSearchPlaceholder = screen.getByPlaceholderText(
      'Search instruments...'
    );
    expect(mobileSearchPlaceholder).toBeInTheDocument();
    expect(mobileSearchPlaceholder).toBeDisabled();
  });

  it('renders mobile navigation items with descriptions', () => {
    render(<Navbar />);

    // Check for mobile navigation descriptions
    expect(screen.getByText('Overview & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Trading Instruments')).toBeInTheDocument();
    expect(screen.getByText('Account Management')).toBeInTheDocument();
    expect(screen.getByText('Developer Information')).toBeInTheDocument();
    expect(screen.getByText('Help & Contact')).toBeInTheDocument();
  });

  it('renders user profile information in mobile sheet', () => {
    render(<Navbar />);

    // Check for mobile sheet user information
    expect(screen.getByText('Premium Account')).toBeInTheDocument();

    // Check that user name appears in both desktop and mobile
    const userNameElements = screen.getAllByText('Naveed Khan');
    expect(userNameElements.length).toBeGreaterThanOrEqual(2); // Desktop and mobile
  });
});
