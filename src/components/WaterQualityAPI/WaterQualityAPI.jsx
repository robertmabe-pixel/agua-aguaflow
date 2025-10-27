import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import FilterControls from './components/FilterControls';
import BatchSummaryDisplay from './components/BatchSummaryDisplay';
import { useWaterQualityFilters } from './hooks/useWaterQualityFilters';
import { aggregateSensorData } from './utils/dataAggregator';
import { generateBatchSummaries } from './utils/batchSummaryGenerator';
import { mockWaterQualityData } from './mockData/waterQualityMockData';
import './WaterQualityAPI.css';

/**
 * WaterQualityAPI Component
 * 
 * A comprehensive water quality monitoring component that provides:
 * - Real-time water quality metrics (temperature, pH, turbidity, region_avg_quality_index)
 * - Sensor data aggregation across multiple sources
 * - Filtering by date range and region
 * - Timestamped batch summaries
 * - Responsive design with error handling
 * 
 * @param {Object} props - Component props
 * @param {string} props.apiEndpoint - API endpoint for water quality data
 * @param {number} props.refreshInterval - Auto-refresh interval in milliseconds
 * @param {boolean} props.autoRefresh - Enable/disable auto-refresh
 * @param {Function} props.onDataUpdate - Callback when data is updated
 * @param {Function} props.onError - Callback when an error occurs
 * @param {boolean} props.showFilters - Show/hide filter controls
 * @param {boolean} props.showBatchSummaries - Show/hide batch summaries
 * @param {string} props.defaultRegion - Default region filter
 * @param {Object} props.defaultDateRange - Default date range filter
 */
const WaterQualityAPI = ({
  apiEndpoint = '/api/water-quality',
  refreshInterval = 30000, // 30 seconds
  autoRefresh = true,
  onDataUpdate = null,
  onError = null,
  showFilters = true,
  showBatchSummaries = true,
  defaultRegion = 'all',
  defaultDateRange = { start: null, end: null },
  className = '',
  ...props
}) => {
  // State management
  const [data, setData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [batchSummaries, setBatchSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Custom hooks for filtering
  const {
    filters,
    updateFilters,
    resetFilters,
    isFiltered
  } = useWaterQualityFilters({
    region: defaultRegion,
    dateRange: defaultDateRange
  });

  /**
   * Fetch water quality data from API
   */
  const fetchWaterQualityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.region && filters.region !== 'all') {
        queryParams.append('region', filters.region);
      }
      
      if (filters.dateRange.start) {
        queryParams.append('start_date', filters.dateRange.start);
      }
      
      if (filters.dateRange.end) {
        queryParams.append('end_date', filters.dateRange.end);
      }

      const url = `${apiEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter mock data based on current filters
        let filteredData = mockWaterQualityData;
        
        if (filters.region && filters.region !== 'all') {
          filteredData = filteredData.filter(item => item.region === filters.region);
        }
        
        if (filters.dateRange.start || filters.dateRange.end) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.timestamp);
            const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
            
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
          });
        }
        
        setData(filteredData);
        
        // Process aggregated data
        const aggregated = aggregateSensorData(filteredData);
        setAggregatedData(aggregated);
        
        // Generate batch summaries
        const summaries = generateBatchSummaries(filteredData, 'daily');
        setBatchSummaries(summaries);
        
        setLastUpdated(new Date());
        
        // Call onDataUpdate callback if provided
        if (onDataUpdate) {
          onDataUpdate({
            rawData: filteredData,
            aggregatedData: aggregated,
            batchSummaries: summaries
          });
        }
        
        return;
      }

      // Production API call
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Validate response schema
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid API response format');
      }
      
      setData(result.data);
      
      // Process aggregated data
      const aggregated = aggregateSensorData(result.data);
      setAggregatedData(aggregated);
      
      // Generate batch summaries
      const summaries = generateBatchSummaries(result.data, 'daily');
      setBatchSummaries(summaries);
      
      setLastUpdated(new Date());
      
      // Call onDataUpdate callback if provided
      if (onDataUpdate) {
        onDataUpdate({
          rawData: result.data,
          aggregatedData: aggregated,
          batchSummaries: summaries
        });
      }
      
    } catch (err) {
      console.error('Error fetching water quality data:', err);
      setError(err.message);
      
      // Call onError callback if provided
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, filters, onDataUpdate, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchWaterQualityData();
  }, [fetchWaterQualityData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(fetchWaterQualityData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchWaterQualityData, autoRefresh, refreshInterval]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(() => {
    fetchWaterQualityData();
  }, [fetchWaterQualityData]);

  /**
   * Render loading state
   */
  if (loading && !data.length) {
    return (
      <div className={`water-quality-api loading ${className}`} {...props}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading water quality data...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error && !data.length) {
    return (
      <div className={`water-quality-api error ${className}`} {...props}>
        <div className="error-message">
          <h3>⚠️ Error Loading Water Quality Data</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`water-quality-api ${className}`} {...props}>
      {/* Header */}
      <div className="water-quality-header">
        <h2>Water Quality Monitoring</h2>
        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh} 
            className="refresh-button"
            disabled={loading}
          >
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          isFiltered={isFiltered}
        />
      )}

      {/* Main Content */}
      <div className="water-quality-content">
        {/* Current Metrics Overview */}
        {aggregatedData && (
          <div className="metrics-overview">
            <h3>Current Water Quality Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card temperature">
                <h4>Temperature</h4>
                <div className="metric-value">
                  {aggregatedData.temperature.average.toFixed(1)}°C
                </div>
                <div className="metric-range">
                  Range: {aggregatedData.temperature.min.toFixed(1)}°C - {aggregatedData.temperature.max.toFixed(1)}°C
                </div>
              </div>
              
              <div className="metric-card ph">
                <h4>pH Level</h4>
                <div className="metric-value">
                  {aggregatedData.pH.average.toFixed(2)}
                </div>
                <div className="metric-range">
                  Range: {aggregatedData.pH.min.toFixed(2)} - {aggregatedData.pH.max.toFixed(2)}
                </div>
              </div>
              
              <div className="metric-card turbidity">
                <h4>Turbidity</h4>
                <div className="metric-value">
                  {aggregatedData.turbidity.average.toFixed(2)} NTU
                </div>
                <div className="metric-range">
                  Range: {aggregatedData.turbidity.min.toFixed(2)} - {aggregatedData.turbidity.max.toFixed(2)} NTU
                </div>
              </div>
              
              <div className="metric-card quality-index">
                <h4>Regional Quality Index</h4>
                <div className="metric-value">
                  {aggregatedData.region_avg_quality_index.toFixed(1)}
                </div>
                <div className="metric-status">
                  {aggregatedData.region_avg_quality_index >= 80 ? 'Excellent' :
                   aggregatedData.region_avg_quality_index >= 60 ? 'Good' :
                   aggregatedData.region_avg_quality_index >= 40 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Summaries */}
        {showBatchSummaries && batchSummaries.length > 0 && (
          <BatchSummaryDisplay
            summaries={batchSummaries}
            onSummaryClick={(summary) => console.log('Summary clicked:', summary)}
          />
        )}

        {/* Data Table */}
        <div className="data-table-section">
          <h3>Detailed Sensor Readings</h3>
          <div className="table-container">
            <table className="water-quality-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Region</th>
                  <th>Sensor ID</th>
                  <th>Temperature (°C)</th>
                  <th>pH</th>
                  <th>Turbidity (NTU)</th>
                  <th>Quality Index</th>
                </tr>
              </thead>
              <tbody>
                {data.map((reading, index) => (
                  <tr key={`${reading.sensor_id}-${reading.timestamp}-${index}`}>
                    <td>{new Date(reading.timestamp).toLocaleString()}</td>
                    <td>{reading.region}</td>
                    <td>{reading.sensor_id}</td>
                    <td>{reading.temperature.toFixed(1)}</td>
                    <td>{reading.pH.toFixed(2)}</td>
                    <td>{reading.turbidity.toFixed(2)}</td>
                    <td>
                      <span className={`quality-badge ${
                        reading.region_avg_quality_index >= 80 ? 'excellent' :
                        reading.region_avg_quality_index >= 60 ? 'good' :
                        reading.region_avg_quality_index >= 40 ? 'fair' : 'poor'
                      }`}>
                        {reading.region_avg_quality_index.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data Message */}
        {data.length === 0 && !loading && (
          <div className="no-data-message">
            <p>No water quality data available for the selected filters.</p>
            <button onClick={resetFilters} className="reset-filters-button">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-mode-indicator">
          <p>🔧 Development Mode: Using mock data</p>
        </div>
      )}
    </div>
  );
};

WaterQualityAPI.propTypes = {
  /** API endpoint for water quality data */
  apiEndpoint: PropTypes.string,
  /** Auto-refresh interval in milliseconds */
  refreshInterval: PropTypes.number,
  /** Enable/disable auto-refresh */
  autoRefresh: PropTypes.bool,
  /** Callback when data is updated */
  onDataUpdate: PropTypes.func,
  /** Callback when an error occurs */
  onError: PropTypes.func,
  /** Show/hide filter controls */
  showFilters: PropTypes.bool,
  /** Show/hide batch summaries */
  showBatchSummaries: PropTypes.bool,
  /** Default region filter */
  defaultRegion: PropTypes.string,
  /** Default date range filter */
  defaultDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  /** Additional CSS class name */
  className: PropTypes.string
};

export default WaterQualityAPI;
