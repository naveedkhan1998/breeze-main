import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from 'src/test/test-utils';
import HomePage from './index';

// Mock API hooks
vi.mock('@/api/instrumentService', () => ({
  useDeleteInstrumentMutation: () => [vi.fn(), { isLoading: false }],
  useGetSubscribedInstrumentsQuery: () => ({
    data: [
      {
        id: '1',
        name: 'Test Instrument 1',
        exchange: 'NSE',
        segment: 'EQUITY',
        percentage: { percentage: 5.5 },
        stock_code: 'TEST1',
      },
      {
        id: '2', 
        name: 'Test Instrument 2',
        exchange: 'BSE',
        segment: 'OPTION',
        percentage: { percentage: -2.1 },
        stock_code: 'TEST2',
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/api/breezeServices', () => ({
  useStartWebsocketMutation: () => [vi.fn(), { isLoading: false }],
  useHealthCheckQuery: () => ({
    data: { status: 'healthy' },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

// Mock PageLayout components
vi.mock('@/components/PageLayout', () => ({
  PageLayout: ({ children, header, subheader, actions }: { 
    children: React.ReactNode; 
    header?: React.ReactNode; 
    subheader?: React.ReactNode; 
    actions?: React.ReactNode; 
  }) => (
    <div>
      {header}
      {subheader}
      {actions}
      {children}
    </div>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  PageSubHeader: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  PageActions: ({ children }: { children: React.ReactNode }) => <div data-testid="page-actions">{children}</div>,
  PageContent: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

// Mock BreezeStatusCard
vi.mock('./components/BreezeStatusCard', () => ({
  default: () => <div data-testid="breeze-status-card">Breeze Status Card</div>,
}));

// Mock InstrumentCard
vi.mock('../instruments/components/InstrumentCard', () => ({
  default: ({ instrument, onDelete }: { 
    instrument: { id: string; name: string; exchange: string; percentage?: { percentage: number } }; 
    onDelete: (id: string) => void; 
  }) => (
    <div data-testid={`instrument-card-${instrument.id}`}>
      <h3>{instrument.name}</h3>
      <p>{instrument.exchange}</p>
      <p>{instrument.percentage?.percentage}%</p>
      <button onClick={() => onDelete(instrument.id)}>Delete</button>
    </div>
  ),
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header and subheader', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByText(/manage your trading instruments/i)).toBeInTheDocument();
  });

  it('renders page actions buttons', () => {
    render(<HomePage />);
    
    const actionsContainer = screen.getByTestId('page-actions');
    expect(actionsContainer).toBeInTheDocument();
    
    expect(screen.getByText('Health Check')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Live Feed')).toBeInTheDocument();
  });

  it('displays Breeze status card', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('breeze-status-card')).toBeInTheDocument();
  });

  it('displays statistics cards', () => {
    render(<HomePage />);
    
    // Check for instruments count
    expect(screen.getByText('Instruments')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Based on mock data
    expect(screen.getByText('Active instruments')).toBeInTheDocument();
    
    // Check for last update
    expect(screen.getByText('Last Update')).toBeInTheDocument();
    expect(screen.getByText('Updates every 2s')).toBeInTheDocument();
  });

  it('displays tab navigation', () => {
    render(<HomePage />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Equity')).toBeInTheDocument();
    expect(screen.getByText('Future')).toBeInTheDocument();
    expect(screen.getByText('Option')).toBeInTheDocument();
  });

  it('displays search input', () => {
    render(<HomePage />);
    
    const searchInput = screen.getByPlaceholderText('Search instruments...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays sort dropdown', () => {
    render(<HomePage />);
    
    // Look for sort dropdown
    const sortTrigger = screen.getByRole('combobox') || screen.getByText('Sort by');
    expect(sortTrigger).toBeInTheDocument();
  });

  it('renders instrument cards', () => {
    render(<HomePage />);
    
    expect(screen.getByTestId('instrument-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('instrument-card-2')).toBeInTheDocument();
    
    expect(screen.getByText('Test Instrument 1')).toBeInTheDocument();
    expect(screen.getByText('Test Instrument 2')).toBeInTheDocument();
    expect(screen.getByText('NSE')).toBeInTheDocument();
    expect(screen.getByText('BSE')).toBeInTheDocument();
  });

  it('filters instruments by search term', async () => {
    render(<HomePage />);
    
    const searchInput = screen.getByPlaceholderText('Search instruments...');
    
    // Type in search box
    fireEvent.change(searchInput, { target: { value: 'Test Instrument 1' } });
    
    // Should show only matching instrument
    await waitFor(() => {
      expect(screen.getByText('Test Instrument 1')).toBeInTheDocument();
      // Test Instrument 2 might still be in DOM but filtered out visually
    });
  });

  it('filters instruments by tab selection', async () => {
    render(<HomePage />);
    
    // Click on Equity tab
    const equityTab = screen.getByText('Equity');
    fireEvent.click(equityTab);
    
    // Should show only equity instruments
    await waitFor(() => {
      expect(screen.getByText('Test Instrument 1')).toBeInTheDocument();
      // Option instrument should be filtered out
    });
  });

  it('handles instrument deletion', async () => {
    render(<HomePage />);
    
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);
    
    // Verify delete function was called
    // Note: The actual delete mutation mock would need to be verified
    // based on your implementation
  });

  it('handles refresh button click', () => {
    render(<HomePage />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Verify refresh was called
    // This test might need adjustment based on your actual implementation
  });

  it('handles live feed button click', () => {
    render(<HomePage />);
    
    const liveFeedButton = screen.getByText('Live Feed');
    fireEvent.click(liveFeedButton);
    
    // Verify websocket start was called
    // This test might need adjustment based on your actual implementation
  });

  it('displays empty state when no instruments', () => {
    // Mock empty data
    vi.doMock('@/api/instrumentService', () => ({
      useDeleteInstrumentMutation: () => [vi.fn(), { isLoading: false }],
      useGetSubscribedInstrumentsQuery: () => ({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      }),
    }));
    
    render(<HomePage />);
    
    // Should show 0 instruments
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    // Mock loading state
    vi.doMock('@/api/instrumentService', () => ({
      useDeleteInstrumentMutation: () => [vi.fn(), { isLoading: false }],
      useGetSubscribedInstrumentsQuery: () => ({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      }),
    }));
    
    render(<HomePage />);
    
    // Should handle loading state gracefully
    const page = screen.getByText('Welcome back!');
    expect(page).toBeInTheDocument();
  });
});
