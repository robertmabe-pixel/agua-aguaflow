import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './InventoryTracker.css';

/**
 * InventoryTracker - Real-time inventory tracking component
 * 
 * Features:
 * - Fetches data from /api/inventory/real-time
 * - Displays inventory by category with color-coded thresholds
 * - Auto-refresh every 10 seconds
 * - Color-coded status indicators (low, medium, high stock)
 * - Error handling and loading states
 * - Responsive design
 */
const InventoryTracker = ({
  apiEndpoint = '/api/inventory/real-time',
  refreshInterval = 10000, // 10 seconds
  className = '',
  onInventoryUpdate = null,
  thresholds = {
    low: 10,
    medium: 50
  }
}) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine stock level based on quantity and thresholds
  const getStockLevel = useCallback((quantity) => {
    if (quantity <= thresholds.low) return 'low';
    if (quantity <= thresholds.medium) return 'medium';
    return 'high';
  }, [thresholds]);

  // Fetch inventory data from API
  const fetchInventoryData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsRefreshing(true);
      }

      // For demo purposes, we'll simulate the API call with mock data
      // In a real implementation, this would be: const response = await fetch(apiEndpoint);
      const mockInventoryData = [
        {
          id: 1,
          category: 'Water Filters',
          items: [
            { id: 101, name: 'Carbon Filter - Standard', quantity: 45, unit: 'units', sku: 'CF-STD-001' },
            { id: 102, name: 'Carbon Filter - Premium', quantity: 8, unit: 'units', sku: 'CF-PRM-001' },
            { id: 103, name: 'Sediment Filter', quantity: 67, unit: 'units', sku: 'SF-001' }
          ]
        },
        {
          id: 2,
          category: 'Testing Kits',
          items: [
            { id: 201, name: 'pH Test Strips', quantity: 23, unit: 'packs', sku: 'PH-TS-001' },
            { id: 202, name: 'Chlorine Test Kit', quantity: 5, unit: 'kits', sku: 'CL-TK-001' },
            { id: 203, name: 'TDS Meter', quantity: 12, unit: 'units', sku: 'TDS-M-001' }
          ]
        },
        {
          id: 3,
          category: 'Chemicals',
          items: [
            { id: 301, name: 'Water Conditioner', quantity: 89, unit: 'bottles', sku: 'WC-001' },
            { id: 302, name: 'pH Adjuster', quantity: 34, unit: 'bottles', sku: 'PH-ADJ-001' },
            { id: 303, name: 'Disinfectant Tablets', quantity: 3, unit: 'boxes', sku: 'DT-001' }
          ]
        },
        {
          id: 4,
          category: 'Equipment',
          items: [
            { id: 401, name: 'Water Pump - 1HP', quantity: 15, unit: 'units', sku: 'WP-1HP-001' },
            { id: 402, name: 'Pressure Tank', quantity: 7, unit: 'units', sku: 'PT-001' },
            { id: 403, name: 'Flow Meter', quantity: 28, unit: 'units', sku: 'FM-001' }
          ]
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add some randomness to simulate real-time changes
      const updatedData = mockInventoryData.map(category => ({
        ...category,
        items: category.items.map(item => ({
          ...item,
          quantity: Math.max(0, item.quantity + Math.floor(Math.random() * 6) - 3) // Random change of -3 to +2
        }))
      }));

      setInventoryData(updatedData);
      setLastUpdated(new Date());
      setError(null);

      // Call parent callback if provided
      if (onInventoryUpdate) {
        onInventoryUpdate(updatedData);
      }

    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [apiEndpoint, onInventoryUpdate]);

  // Initialize component and set up refresh interval
  useEffect(() => {
    fetchInventoryData(true);

    // Set up auto-refresh interval
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchInventoryData(false);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchInventoryData, refreshInterval]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchInventoryData(false);
  };

  // Calculate category summary
  const getCategorySummary = (category) => {
    const totalItems = category.items.length;
    const lowStockItems = category.items.filter(item => getStockLevel(item.quantity) === 'low').length;
    const mediumStockItems = category.items.filter(item => getStockLevel(item.quantity) === 'medium').length;
    const highStockItems = category.items.filter(item => getStockLevel(item.quantity) === 'high').length;

    return {
      totalItems,
      lowStockItems,
      mediumStockItems,
      highStockItems,
      overallStatus: lowStockItems > 0 ? 'low' : mediumStockItems > 0 ? 'medium' : 'high'
    };
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`inventory-tracker loading ${className}`}>
        <div className="inventory-loading">
          <div className="loading-spinner"></div>
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`inventory-tracker error ${className}`}>
        <div className="inventory-error">
          <h3>Inventory Error</h3>
          <p>{error}</p>
          <button onClick={handleManualRefresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`inventory-tracker ${className}`}>
      {/* Header */}
      <div className="inventory-header">
        <h2>Real-Time Inventory Tracker</h2>
        <div className="inventory-controls">
          <div className="last-updated">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
          <button 
            onClick={handleManualRefresh} 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
          >
            {isRefreshing ? '↻' : '⟳'} Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="inventory-legend">
        <div className="legend-item">
          <span className="status-indicator high"></span>
          <span>High Stock (&gt;{thresholds.medium})</span>
        </div>
        <div className="legend-item">
          <span className="status-indicator medium"></span>
          <span>Medium Stock ({thresholds.low + 1}-{thresholds.medium})</span>
        </div>
        <div className="legend-item">
          <span className="status-indicator low"></span>
          <span>Low Stock (≤{thresholds.low})</span>
        </div>
      </div>

      {/* Inventory Categories */}
      <div className="inventory-categories">
        {inventoryData.map(category => {
          const summary = getCategorySummary(category);
          
          return (
            <div key={category.id} className="inventory-category">
              <div className="category-header">
                <h3>{category.category}</h3>
                <div className={`category-status ${summary.overallStatus}`}>
                  <span className="status-indicator"></span>
                  <span className="status-text">
                    {summary.lowStockItems > 0 && `${summary.lowStockItems} low`}
                    {summary.mediumStockItems > 0 && summary.lowStockItems > 0 && ', '}
                    {summary.mediumStockItems > 0 && `${summary.mediumStockItems} medium`}
                    {summary.highStockItems > 0 && (summary.lowStockItems > 0 || summary.mediumStockItems > 0) && ', '}
                    {summary.highStockItems > 0 && `${summary.highStockItems} high`}
                  </span>
                </div>
              </div>
              
              <div className="category-items">
                {category.items.map(item => {
                  const stockLevel = getStockLevel(item.quantity);
                  
                  return (
                    <div key={item.id} className={`inventory-item ${stockLevel}`}>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-sku">SKU: {item.sku}</div>
                      </div>
                      <div className="item-quantity">
                        <span className={`quantity-value ${stockLevel}`}>
                          {item.quantity}
                        </span>
                        <span className="quantity-unit">{item.unit}</span>
                        <span className={`status-indicator ${stockLevel}`}></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-refresh indicator */}
      {refreshInterval > 0 && (
        <div className="auto-refresh-info">
          <small>
            Auto-refreshing every {Math.floor(refreshInterval / 1000)} seconds
            {isRefreshing && <span className="refreshing-indicator"> • Refreshing...</span>}
          </small>
        </div>
      )}
    </div>
  );
};

InventoryTracker.propTypes = {
  /** API endpoint for inventory data */
  apiEndpoint: PropTypes.string,
  /** Auto-refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Callback function called when inventory is updated */
  onInventoryUpdate: PropTypes.func,
  /** Stock level thresholds */
  thresholds: PropTypes.shape({
    low: PropTypes.number,
    medium: PropTypes.number
  })
};

export default InventoryTracker;
