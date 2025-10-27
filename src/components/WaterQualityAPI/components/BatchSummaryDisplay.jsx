import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './BatchSummaryDisplay.css';

/**
 * BatchSummaryDisplay Component
 * 
 * Displays timestamped batch summaries of water quality data
 * Shows aggregated metrics and trends over time
 */
const BatchSummaryDisplay = ({
  summaries,
  onSummaryClick,
  showTrends = true,
  maxSummaries = 10,
  className = '',
  ...props
}) => {
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Limit and sort summaries
  const displaySummaries = summaries
    .slice(0, maxSummaries)
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortBy === 'timestamp') {
        const comparison = new Date(aValue) - new Date(bValue);
        return sortOrder === 'desc' ? -comparison : comparison;
      }
      
      const comparison = aValue - bValue;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  /**
   * Handle summary expansion
   */
  const handleSummaryClick = (summary, index) => {
    setExpandedSummary(expandedSummary === index ? null : index);
    if (onSummaryClick) {
      onSummaryClick(summary);
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp, interval) => {
    const date = new Date(timestamp);
    
    switch (interval) {
      case 'hourly':
        return date.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      case 'daily':
        return date.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      case 'weekly':
        const endDate = new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000);
        return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric'
        });
      default:
        return date.toLocaleDateString();
    }
  };

  /**
   * Get quality rating color
   */
  const getQualityColor = (rating) => {
    switch (rating) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  /**
   * Calculate trend indicator
   */
  const calculateTrend = (current, previous, parameter) => {
    if (!previous || !current[parameter] || !previous[parameter]) {
      return { direction: 'stable', percentage: 0 };
    }

    const currentValue = current[parameter].average;
    const previousValue = previous[parameter].average;
    const change = ((currentValue - previousValue) / previousValue) * 100;

    let direction = 'stable';
    if (Math.abs(change) > 2) {
      direction = change > 0 ? 'up' : 'down';
    }

    return {
      direction,
      percentage: Math.abs(change)
    };
  };

  /**
   * Render trend indicator
   */
  const renderTrendIndicator = (trend) => {
    const { direction, percentage } = trend;
    
    if (direction === 'stable') {
      return <span className="trend-indicator stable">→</span>;
    }
    
    return (
      <span className={`trend-indicator ${direction}`}>
        {direction === 'up' ? '↗' : '↘'}
        <span className="trend-percentage">{percentage.toFixed(1)}%</span>
      </span>
    );
  };

  if (!summaries || summaries.length === 0) {
    return (
      <div className={`batch-summary-display empty ${className}`} {...props}>
        <div className="empty-state">
          <h3>No Batch Summaries Available</h3>
          <p>Batch summaries will appear here once data is processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`batch-summary-display ${className}`} {...props}>
      {/* Header */}
      <div className="summary-header">
        <h3>Batch Summaries</h3>
        <div className="summary-controls">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="timestamp-desc">Newest First</option>
            <option value="timestamp-asc">Oldest First</option>
            <option value="region_avg_quality_index-desc">Highest Quality</option>
            <option value="region_avg_quality_index-asc">Lowest Quality</option>
            <option value="total_readings-desc">Most Readings</option>
            <option value="total_readings-asc">Fewest Readings</option>
          </select>
        </div>
      </div>

      {/* Summary List */}
      <div className="summary-list">
        {displaySummaries.map((summary, index) => {
          const isExpanded = expandedSummary === index;
          const previousSummary = index < displaySummaries.length - 1 ? displaySummaries[index + 1] : null;
          
          return (
            <div
              key={`${summary.timestamp}-${index}`}
              className={`summary-card ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Summary Header */}
              <div
                className="summary-card-header"
                onClick={() => handleSummaryClick(summary, index)}
              >
                <div className="summary-title">
                  <h4>{formatTimestamp(summary.timestamp, summary.interval)}</h4>
                  <span className="summary-interval">{summary.interval}</span>
                </div>
                
                <div className="summary-overview">
                  <div className="overview-item">
                    <span className="overview-label">Quality</span>
                    <span
                      className="overview-value quality-rating"
                      style={{ color: getQualityColor(summary.overall_quality_rating) }}
                    >
                      {summary.region_avg_quality_index.average.toFixed(1)}
                      {showTrends && previousSummary && renderTrendIndicator(
                        calculateTrend(summary, previousSummary, 'region_avg_quality_index')
                      )}
                    </span>
                  </div>
                  
                  <div className="overview-item">
                    <span className="overview-label">Readings</span>
                    <span className="overview-value">{summary.total_readings}</span>
                  </div>
                  
                  <div className="overview-item">
                    <span className="overview-label">Completeness</span>
                    <span className="overview-value">{summary.data_completeness_percentage}%</span>
                  </div>
                </div>
                
                <div className="expand-indicator">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="summary-card-content">
                  {/* Parameter Details */}
                  <div className="parameter-details">
                    <div className="parameter-grid">
                      <div className="parameter-item">
                        <h5>Temperature</h5>
                        <div className="parameter-stats">
                          <span className="stat-value">{summary.temperature.average}°C</span>
                          <span className="stat-range">
                            {summary.temperature.min}°C - {summary.temperature.max}°C
                          </span>
                          {showTrends && previousSummary && renderTrendIndicator(
                            calculateTrend(summary, previousSummary, 'temperature')
                          )}
                        </div>
                      </div>
                      
                      <div className="parameter-item">
                        <h5>pH Level</h5>
                        <div className="parameter-stats">
                          <span className="stat-value">{summary.pH.average}</span>
                          <span className="stat-range">
                            {summary.pH.min} - {summary.pH.max}
                          </span>
                          {showTrends && previousSummary && renderTrendIndicator(
                            calculateTrend(summary, previousSummary, 'pH')
                          )}
                        </div>
                      </div>
                      
                      <div className="parameter-item">
                        <h5>Turbidity</h5>
                        <div className="parameter-stats">
                          <span className="stat-value">{summary.turbidity.average} NTU</span>
                          <span className="stat-range">
                            {summary.turbidity.min} - {summary.turbidity.max} NTU
                          </span>
                          {showTrends && previousSummary && renderTrendIndicator(
                            calculateTrend(summary, previousSummary, 'turbidity')
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quality Distribution */}
                  {summary.quality_distribution && (
                    <div className="quality-distribution">
                      <h5>Quality Distribution</h5>
                      <div className="distribution-bars">
                        {Object.entries(summary.quality_distribution.percentages).map(([rating, percentage]) => (
                          <div key={rating} className="distribution-bar">
                            <span className="distribution-label">{rating}</span>
                            <div className="distribution-track">
                              <div
                                className={`distribution-fill ${rating}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="distribution-percentage">{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regional Breakdown */}
                  {summary.regional_breakdown && (
                    <div className="regional-breakdown">
                      <h5>Regional Breakdown</h5>
                      <div className="region-grid">
                        {Object.entries(summary.regional_breakdown).map(([region, data]) => (
                          <div key={region} className="region-item">
                            <h6>{region}</h6>
                            <div className="region-stats">
                              <span>Quality: {data.quality_index_avg}</span>
                              <span>Readings: {data.readings_count}</span>
                              <span>Sensors: {data.sensors_count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="summary-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">Period:</span>
                      <span className="metadata-value">
                        {new Date(summary.period_start).toLocaleString()} - {new Date(summary.period_end).toLocaleString()}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Regions:</span>
                      <span className="metadata-value">{summary.regions.join(', ')}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Sensors:</span>
                      <span className="metadata-value">{summary.sensors_count} active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {summaries.length > maxSummaries && (
        <div className="show-more">
          <p>Showing {maxSummaries} of {summaries.length} summaries</p>
        </div>
      )}
    </div>
  );
};

BatchSummaryDisplay.propTypes = {
  /** Array of batch summary objects */
  summaries: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.string.isRequired,
    interval: PropTypes.string.isRequired,
    total_readings: PropTypes.number.isRequired,
    overall_quality_rating: PropTypes.string,
    temperature: PropTypes.object,
    pH: PropTypes.object,
    turbidity: PropTypes.object,
    region_avg_quality_index: PropTypes.object,
    quality_distribution: PropTypes.object,
    regional_breakdown: PropTypes.object,
    regions: PropTypes.array,
    sensors_count: PropTypes.number
  })).isRequired,
  /** Callback when a summary is clicked */
  onSummaryClick: PropTypes.func,
  /** Whether to show trend indicators */
  showTrends: PropTypes.bool,
  /** Maximum number of summaries to display */
  maxSummaries: PropTypes.number,
  /** Additional CSS class name */
  className: PropTypes.string
};

export default BatchSummaryDisplay;
