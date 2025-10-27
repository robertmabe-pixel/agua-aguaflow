import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CustomerFeedbackWidget from '../CustomerFeedbackWidget';
import InventoryTracker from '../InventoryTracker';
import SalesAnalytics from '../SalesAnalytics';
import './Dashboard.css';

/**
 * Dashboard - Main dashboard component with integrated customer feedback
 * 
 * Features:
 * - Displays aggregated customer sentiment
 * - Integrates CustomerFeedbackWidget
 * - Real-time feedback updates
 * - Responsive layout
 * - Error handling and loading states
 */
const Dashboard = ({
  feedbackApiEndpoint = '/api/feedback',
  inventoryApiEndpoint = '/api/inventory/real-time',
  salesApiEndpoint = '/api/sales/performance',
  className = '',
  showFeedbackWidget = true,
  showInventoryTracker = true,
  showSalesAnalytics = true,
  refreshInterval = 300000, // 5 minutes
  inventoryRefreshInterval = 10000, // 10 seconds
  salesRefreshInterval = 60000, // 60 seconds
  onFeedbackUpdate = null,
  onInventoryUpdate = null,
  onSalesUpdate = null
}) => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'good',
    lastUpdated: new Date()
  });
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Simulate dashboard data fetch (replace with actual API call)
      const mockDashboardData = {
        totalUsers: 1247,
        activeUsers: 89,
        systemHealth: 'good',
        lastUpdated: new Date()
      };
      
      setDashboardData(mockDashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  // Fetch feedback summary for dashboard display
  const fetchFeedbackSummary = async () => {
    try {
      const response = await fetch(`${feedbackApiEndpoint}/aggregated`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedbackSummary(data);
    } catch (err) {
      console.error('Error fetching feedback summary:', err);
      // Don't set error for feedback summary as it's not critical for dashboard
    }
  };

  // Handle feedback submission callback
  const handleFeedbackSubmitted = (feedbackData) => {
    // Refresh feedback summary when new feedback is submitted
    fetchFeedbackSummary();
    
    // Call parent callback if provided
    if (onFeedbackUpdate) {
      onFeedbackUpdate(feedbackData);
    }
  };

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchFeedbackSummary()
      ]);
      setIsLoading(false);
    };

    initializeDashboard();

    // Set up refresh interval
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchDashboardData();
        fetchFeedbackSummary();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [feedbackApiEndpoint, refreshInterval]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`dashboard loading ${className}`}>
        <div className="dashboard-loading">
          <div className="loading-spinner large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`dashboard error ${className}`}>
        <div className="dashboard-error">
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate sentiment trend
  const getSentimentTrend = () => {
    if (!feedbackSummary) return null;
    
    const { averageRating } = feedbackSummary;
    if (averageRating >= 4) return 'positive';
    if (averageRating <= 2) return 'negative';
    return 'neutral';
  };

  const sentimentTrend = getSentimentTrend();

  return (
    <div className={`dashboard ${className}`}>
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <h1>AguaFlow Dashboard</h1>
        <div className="last-updated">
          Last updated: {dashboardData.lastUpdated.toLocaleTimeString()}
        </div>
      </header>

      {/* Key Metrics */}
      <section className="dashboard-metrics">
        <div className="metric-card">
          <h3>Total Users</h3>
          <div className="metric-value">{dashboardData.totalUsers.toLocaleString()}</div>
        </div>
        
        <div className="metric-card">
          <h3>Active Users</h3>
          <div className="metric-value">{dashboardData.activeUsers}</div>
        </div>
        
        <div className="metric-card">
          <h3>System Health</h3>
          <div className={`metric-value health-${dashboardData.systemHealth}`}>
            {dashboardData.systemHealth.charAt(0).toUpperCase() + dashboardData.systemHealth.slice(1)}
          </div>
        </div>

        {/* Customer Sentiment Summary */}
        {feedbackSummary && (
          <div className="metric-card sentiment-card">
            <h3>Customer Sentiment</h3>
            <div className={`metric-value sentiment-${sentimentTrend}`}>
              <div className="sentiment-rating">
                {feedbackSummary.averageRating.toFixed(1)} ★
              </div>
              <div className="sentiment-label">
                {sentimentTrend?.charAt(0).toUpperCase() + sentimentTrend?.slice(1)}
              </div>
              <div className="sentiment-count">
                {feedbackSummary.totalFeedbacks} reviews
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Sales Performance Analytics */}
        {showSalesAnalytics && (
          <section className="dashboard-section sales-analytics-section">
            <SalesAnalytics
              apiEndpoint={salesApiEndpoint}
              refreshInterval={salesRefreshInterval}
              onDataUpdate={onSalesUpdate}
              className="dashboard-sales-analytics"
            />
          </section>
        )}

        {/* Real-Time Inventory Tracker */}
        {showInventoryTracker && (
          <section className="dashboard-section inventory-section">
            <InventoryTracker
              apiEndpoint={inventoryApiEndpoint}
              refreshInterval={inventoryRefreshInterval}
              onInventoryUpdate={onInventoryUpdate}
              className="dashboard-inventory-tracker"
            />
          </section>
        )}

        {/* Water Usage Widget Placeholder */}
        <section className="dashboard-section">
          <h2>Water Usage Overview</h2>
          <div className="widget-placeholder">
            <p>Water Usage Widget would be displayed here</p>
            <small>This integrates with the existing WaterUsageWidget component</small>
          </div>
        </section>

        {/* Customer Feedback Section */}
        {showFeedbackWidget && (
          <section className="dashboard-section feedback-section">
            <h2>Customer Feedback</h2>
            <CustomerFeedbackWidget
              apiEndpoint={feedbackApiEndpoint}
              onFeedbackSubmitted={handleFeedbackSubmitted}
              showAggregatedData={true}
              autoRefresh={true}
              refreshInterval={refreshInterval}
              className="dashboard-feedback-widget"
            />
          </section>
        )}

        {/* Additional Dashboard Sections */}
        <section className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
            <p>Recent system activity would be displayed here</p>
          </div>
        </section>
      </main>

      {/* Dashboard Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 AguaFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

Dashboard.propTypes = {
  /** API endpoint for feedback operations */
  feedbackApiEndpoint: PropTypes.string,
  /** API endpoint for inventory operations */
  inventoryApiEndpoint: PropTypes.string,
  /** API endpoint for sales performance data */
  salesApiEndpoint: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Whether to show the feedback widget */
  showFeedbackWidget: PropTypes.bool,
  /** Whether to show the inventory tracker */
  showInventoryTracker: PropTypes.bool,
  /** Whether to show the sales analytics module */
  showSalesAnalytics: PropTypes.bool,
  /** Auto-refresh interval for dashboard data in milliseconds */
  refreshInterval: PropTypes.number,
  /** Auto-refresh interval for inventory data in milliseconds */
  inventoryRefreshInterval: PropTypes.number,
  /** Auto-refresh interval for sales data in milliseconds (default: 60000 = 60 seconds) */
  salesRefreshInterval: PropTypes.number,
  /** Callback function called when feedback is updated */
  onFeedbackUpdate: PropTypes.func,
  /** Callback function called when inventory is updated */
  onInventoryUpdate: PropTypes.func,
  /** Callback function called when sales data is updated */
  onSalesUpdate: PropTypes.func
};

export default Dashboard;
