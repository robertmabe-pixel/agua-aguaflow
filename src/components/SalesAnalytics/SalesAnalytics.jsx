import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './SalesAnalytics.css';

/**
 * SalesAnalytics - Comprehensive sales performance analytics module
 * 
 * Features:
 * - Real-time sales performance data visualization
 * - Total sales tracking with trend analysis
 * - Conversion rate monitoring
 * - Top 5 products performance display
 * - Auto-refresh every 60 seconds
 * - Error handling and loading states
 * - Responsive charts using Recharts
 * 
 * @component
 * @example
 * <SalesAnalytics 
 *   apiEndpoint="/api/sales/performance"
 *   refreshInterval={60000}
 *   onDataUpdate={(data) => console.log('Sales data updated:', data)}
 * />
 */
const SalesAnalytics = ({
  apiEndpoint = '/api/sales/performance',
  refreshInterval = 60000, // 60 seconds
  className = '',
  onDataUpdate = null,
  showTotalSales = true,
  showConversionRate = true,
  showTopProducts = true,
  dateRange = '7d' // 7d, 30d, 90d
}) => {
  // State management
  const [salesData, setSalesData] = useState({
    totalSales: [],
    conversionRate: [],
    topProducts: [],
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetches sales performance data from the API
   * Handles data transformation and error states
   */
  const fetchSalesData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`${apiEndpoint}?range=${dateRange}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform and validate data structure
      const transformedData = {
        totalSales: data.totalSales || [],
        conversionRate: data.conversionRate || [],
        topProducts: data.topProducts || [],
        summary: {
          totalRevenue: data.summary?.totalRevenue || 0,
          totalOrders: data.summary?.totalOrders || 0,
          averageOrderValue: data.summary?.averageOrderValue || 0,
          conversionRate: data.summary?.conversionRate || 0
        }
      };
      
      setSalesData(transformedData);
      setLastUpdated(new Date());
      
      // Call parent callback if provided
      if (onDataUpdate) {
        onDataUpdate(transformedData);
      }
      
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError(`Failed to load sales data: ${err.message}`);
      
      // Fallback to mock data for development/demo purposes
      if (process.env.NODE_ENV === 'development') {
        setSalesData(getMockSalesData());
        setLastUpdated(new Date());
      }
    }
  }, [apiEndpoint, dateRange, onDataUpdate]);

  /**
   * Generates mock sales data for development and testing
   * @returns {Object} Mock sales data structure
   */
  const getMockSalesData = () => {
    const dates = [];
    const today = new Date();
    
    // Generate last 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return {
      totalSales: dates.map((date, index) => ({
        date,
        sales: Math.floor(Math.random() * 50000) + 20000,
        orders: Math.floor(Math.random() * 200) + 50
      })),
      conversionRate: dates.map((date, index) => ({
        date,
        rate: (Math.random() * 5 + 2).toFixed(2),
        visitors: Math.floor(Math.random() * 5000) + 1000,
        conversions: Math.floor(Math.random() * 200) + 50
      })),
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
  };

  // Initialize component and set up auto-refresh
  useEffect(() => {
    // Initial data fetch
    const initializeData = async () => {
      setIsLoading(true);
      await fetchSalesData();
      setIsLoading(false);
    };

    initializeData();

    // Set up auto-refresh interval
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSalesData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSalesData, refreshInterval]);

  /**
   * Formats currency values for display
   * @param {number} value - The numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  /**
   * Formats percentage values for display
   * @param {number} value - The numeric value to format
   * @returns {string} Formatted percentage string
   */
  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  /**
   * Gets trend indicator based on growth value
   * @param {number} growth - Growth percentage
   * @returns {Object} Trend object with class and symbol
   */
  const getTrendIndicator = (growth) => {
    if (growth > 0) {
      return { class: 'positive', symbol: '↗', text: `+${growth}%` };
    } else if (growth < 0) {
      return { class: 'negative', symbol: '↘', text: `${growth}%` };
    }
    return { class: 'neutral', symbol: '→', text: '0%' };
  };

  // Color palette for charts
  const chartColors = {
    primary: '#2563eb',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const pieColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  // Loading state
  if (isLoading) {
    return (
      <div className={`sales-analytics loading ${className}`}>
        <div className="sales-analytics-loading">
          <div className="loading-spinner large"></div>
          <p>Loading sales analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && process.env.NODE_ENV !== 'development') {
    return (
      <div className={`sales-analytics error ${className}`}>
        <div className="sales-analytics-error">
          <h3>Sales Analytics Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchSalesData()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`sales-analytics ${className}`}>
      {/* Header */}
      <header className="sales-analytics-header">
        <h2>Sales Performance Analytics</h2>
        <div className="last-updated">
          {lastUpdated && (
            <>
              Last updated: {lastUpdated.toLocaleTimeString()}
              <span className="auto-refresh-indicator">
                Auto-refresh: {refreshInterval / 1000}s
              </span>
            </>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <section className="sales-summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <div className="summary-value">
            {formatCurrency(salesData.summary.totalRevenue)}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>Total Orders</h3>
          <div className="summary-value">
            {salesData.summary.totalOrders.toLocaleString()}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>Avg Order Value</h3>
          <div className="summary-value">
            {formatCurrency(salesData.summary.averageOrderValue)}
          </div>
        </div>
        
        <div className="summary-card">
          <h3>Conversion Rate</h3>
          <div className="summary-value">
            {formatPercentage(salesData.summary.conversionRate)}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="sales-charts">
        {/* Total Sales Chart */}
        {showTotalSales && salesData.totalSales.length > 0 && (
          <div className="chart-container">
            <h3>Total Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.totalSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis 
                  yAxisId="sales"
                  orientation="left"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="orders"
                  orientation="right"
                />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(value) : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="sales"
                  type="monotone" 
                  dataKey="sales" 
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  name="Sales"
                />
                <Line 
                  yAxisId="orders"
                  type="monotone" 
                  dataKey="orders" 
                  stroke={chartColors.secondary}
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversion Rate Chart */}
        {showConversionRate && salesData.conversionRate.length > 0 && (
          <div className="chart-container">
            <h3>Conversion Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.conversionRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis 
                  yAxisId="rate"
                  orientation="left"
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="visitors"
                  orientation="right"
                />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'rate' ? `${value}%` : value.toLocaleString(),
                    name === 'rate' ? 'Conversion Rate' : 
                    name === 'visitors' ? 'Visitors' : 'Conversions'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="rate"
                  type="monotone" 
                  dataKey="rate" 
                  stroke={chartColors.accent}
                  strokeWidth={3}
                  name="Conversion Rate (%)"
                />
                <Bar 
                  yAxisId="visitors"
                  dataKey="visitors" 
                  fill={chartColors.info}
                  opacity={0.3}
                  name="Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products Chart */}
        {showTopProducts && salesData.topProducts.length > 0 && (
          <div className="chart-container">
            <h3>Top 5 Products Performance</h3>
            <div className="top-products-section">
              {/* Bar Chart */}
              <div className="top-products-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      tickFormatter={formatCurrency}
                    />
                    <YAxis 
                      yAxisId="sales"
                      orientation="right"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                        name === 'revenue' ? 'Revenue' : 'Units Sold'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="revenue"
                      dataKey="revenue" 
                      fill={chartColors.primary}
                      name="Revenue"
                    />
                    <Bar 
                      yAxisId="sales"
                      dataKey="sales" 
                      fill={chartColors.secondary}
                      name="Units Sold"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="top-products-pie">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {salesData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Products Table */}
            <div className="top-products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.topProducts.map((product, index) => {
                    const trend = getTrendIndicator(product.growth);
                    return (
                      <tr key={index}>
                        <td className="product-name">{product.name}</td>
                        <td>{product.sales.toLocaleString()}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                        <td className={`growth ${trend.class}`}>
                          <span className="trend-symbol">{trend.symbol}</span>
                          {trend.text}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Development Notice */}
      {error && process.env.NODE_ENV === 'development' && (
        <div className="dev-notice">
          <p>⚠️ Development Mode: Using mock data due to API error</p>
          <small>{error}</small>
        </div>
      )}
    </div>
  );
};

SalesAnalytics.propTypes = {
  /** API endpoint for sales performance data */
  apiEndpoint: PropTypes.string,
  /** Auto-refresh interval in milliseconds (default: 60000 = 60 seconds) */
  refreshInterval: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Callback function called when data is updated */
  onDataUpdate: PropTypes.func,
  /** Whether to show total sales chart */
  showTotalSales: PropTypes.bool,
  /** Whether to show conversion rate chart */
  showConversionRate: PropTypes.bool,
  /** Whether to show top products section */
  showTopProducts: PropTypes.bool,
  /** Date range for data (7d, 30d, 90d) */
  dateRange: PropTypes.oneOf(['7d', '30d', '90d'])
};

export default SalesAnalytics;
