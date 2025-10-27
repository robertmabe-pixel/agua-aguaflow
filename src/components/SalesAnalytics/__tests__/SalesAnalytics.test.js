import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SalesAnalytics from '../SalesAnalytics';

// Mock recharts components to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock data for testing
const mockSalesData = {
  totalSales: [
    { date: '2025-10-21', sales: 25000, orders: 120 },
    { date: '2025-10-22', sales: 30000, orders: 150 },
    { date: '2025-10-23', sales: 28000, orders: 140 }
  ],
  conversionRate: [
    { date: '2025-10-21', rate: 3.2, visitors: 2500, conversions: 80 },
    { date: '2025-10-22', rate: 3.8, visitors: 3000, conversions: 114 },
    { date: '2025-10-23', rate: 3.5, visitors: 2800, conversions: 98 }
  ],
  topProducts: [
    { name: 'AquaFlow Pro', sales: 15420, revenue: 308400, growth: 12.5 },
    { name: 'Water Monitor Basic', sales: 12350, revenue: 185250, growth: 8.3 },
    { name: 'Smart Sensor Kit', sales: 9870, revenue: 296100, growth: -2.1 },
    { name: 'pH Testing Strips', sales: 8540, revenue: 42700, growth: 15.7 },
    { name: 'Filtration System', sales: 6230, revenue: 311500, growth: 22.4 }
  ],
  summary: {
    totalRevenue: 1143950,
    totalOrders: 52410,
    averageOrderValue: 218.35,
    conversionRate: 3.2
  }
};

describe('SalesAnalytics Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    test('renders loading state initially', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { container } = render(<SalesAnalytics />);
      
      expect(screen.getByText('Loading sales analytics...')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    });

    test('renders component with default props', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
      });

      // Check summary cards
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();

      // Check formatted values
      expect(screen.getByText('$1,143,950')).toBeInTheDocument();
      expect(screen.getByText('52,410')).toBeInTheDocument();
      expect(screen.getByText('$218')).toBeInTheDocument();
      expect(screen.getByText('3.2%')).toBeInTheDocument();
    });

    test('renders with custom className', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      const { container } = render(<SalesAnalytics className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('sales-analytics', 'custom-class');
      });
    });
  });

  describe('API Integration', () => {
    test('calls API with correct endpoint and parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(
        <SalesAnalytics 
          apiEndpoint="/api/custom/sales" 
          dateRange="30d" 
        />
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/custom/sales?range=30d');
      });
    });

    test('handles API success response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
        expect(screen.getByText('$1,143,950')).toBeInTheDocument();
      });
    });

    test('handles API error response', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock NODE_ENV to not be development to test error state
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Analytics Error')).toBeInTheDocument();
        expect(screen.getByText(/Failed to load sales data/)).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    test('falls back to mock data in development mode on API error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Ensure we're in development mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
        expect(screen.getByText(/Development Mode: Using mock data/)).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    test('handles HTTP error status', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Analytics Error')).toBeInTheDocument();
        expect(screen.getByText(/HTTP error! status: 404/)).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Auto-refresh Functionality', () => {
    test('sets up auto-refresh interval', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics refreshInterval={5000} />);

      // Initial call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward time to trigger refresh
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });

    test('disables auto-refresh when interval is 0', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics refreshInterval={0} />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      // Should not call fetch again
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('displays refresh interval in UI', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics refreshInterval={60000} />);

      await waitFor(() => {
        expect(screen.getByText('Auto-refresh: 60s')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Visibility Controls', () => {
    test('hides total sales chart when showTotalSales is false', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics showTotalSales={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Total Sales Trend')).not.toBeInTheDocument();
      });
    });

    test('hides conversion rate chart when showConversionRate is false', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics showConversionRate={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Conversion Rate Trend')).not.toBeInTheDocument();
      });
    });

    test('hides top products section when showTopProducts is false', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics showTopProducts={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Top 5 Products Performance')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    test('formats currency values correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('$1,143,950')).toBeInTheDocument();
        expect(screen.getByText('$218')).toBeInTheDocument();
      });
    });

    test('formats percentage values correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('3.2%')).toBeInTheDocument();
      });
    });

    test('formats number values with commas', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('52,410')).toBeInTheDocument();
        expect(screen.getByText('15,420')).toBeInTheDocument();
      });
    });
  });

  describe('Top Products Table', () => {
    test('renders top products table with correct data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('AquaFlow Pro')).toBeInTheDocument();
        expect(screen.getByText('Water Monitor Basic')).toBeInTheDocument();
        expect(screen.getByText('Smart Sensor Kit')).toBeInTheDocument();
        expect(screen.getByText('pH Testing Strips')).toBeInTheDocument();
        expect(screen.getByText('Filtration System')).toBeInTheDocument();
      });
    });

    test('displays growth indicators correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        // Positive growth
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getByText('+8.3%')).toBeInTheDocument();
        
        // Negative growth
        expect(screen.getByText('-2.1%')).toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    test('calls onDataUpdate callback when data is fetched', async () => {
      const mockCallback = jest.fn();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics onDataUpdate={mockCallback} />);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
          totalSales: expect.any(Array),
          conversionRate: expect.any(Array),
          topProducts: expect.any(Array),
          summary: expect.any(Object)
        }));
      });
    });
  });

  describe('Error Handling', () => {
    test('displays retry button on error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    test('retry button refetches data', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSalesData
        });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Data Validation', () => {
    test('handles missing data gracefully', async () => {
      const incompleteData = {
        summary: {
          totalRevenue: 100000
          // Missing other fields
        }
        // Missing other sections
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
        expect(screen.getByText('$100,000')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // Default values
      });
    });

    test('handles empty arrays gracefully', async () => {
      const emptyData = {
        totalSales: [],
        conversionRate: [],
        topProducts: [],
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          conversionRate: 0
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
        expect(screen.getByText('$0')).toBeInTheDocument();
        expect(screen.getByText('0.0%')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2, name: 'Sales Performance Analytics' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: 'Total Sales Trend' })).toBeInTheDocument();
      });
    });

    test('has accessible table structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSalesData
      });

      render(<SalesAnalytics />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        
        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(4);
        expect(headers[0]).toHaveTextContent('Product');
        expect(headers[1]).toHaveTextContent('Units Sold');
        expect(headers[2]).toHaveTextContent('Revenue');
        expect(headers[3]).toHaveTextContent('Growth');
      });
    });
  });
});
