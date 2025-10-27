import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { availableRegions } from '../mockData/waterQualityMockData';
import './FilterControls.css';

/**
 * FilterControls Component
 * 
 * Provides UI controls for filtering water quality data
 * Supports region, date range, and parameter filtering
 */
const FilterControls = ({
  filters,
  onFilterChange,
  onReset,
  isFiltered,
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Handle region filter change
   */
  const handleRegionChange = (event) => {
    const region = event.target.value;
    onFilterChange({ region });
  };

  /**
   * Handle date range changes
   */
  const handleDateRangeChange = (field, value) => {
    const newDateRange = {
      ...filters.dateRange,
      [field]: value
    };
    onFilterChange({ dateRange: newDateRange });
  };

  /**
   * Handle parameter range changes
   */
  const handleParameterRangeChange = (parameter, field, value) => {
    const numValue = value === '' ? null : parseFloat(value);
    const newParameters = {
      ...filters.parameters,
      [parameter]: {
        ...filters.parameters[parameter],
        [field]: numValue
      }
    };
    onFilterChange({ parameters: newParameters });
  };

  /**
   * Handle quality range changes
   */
  const handleQualityRangeChange = (field, value) => {
    const numValue = parseFloat(value);
    const newQualityRange = {
      ...filters.qualityRange,
      [field]: numValue
    };
    onFilterChange({ qualityRange: newQualityRange });
  };

  /**
   * Get preset date ranges
   */
  const getPresetDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        label: 'Today',
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Last 7 days',
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Last 30 days',
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Last 90 days',
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    ];
  };

  /**
   * Apply preset date range
   */
  const applyPresetDateRange = (preset) => {
    onFilterChange({
      dateRange: {
        start: preset.start,
        end: preset.end
      }
    });
  };

  /**
   * Clear date range
   */
  const clearDateRange = () => {
    onFilterChange({
      dateRange: {
        start: null,
        end: null
      }
    });
  };

  return (
    <div className={`filter-controls ${className}`} {...props}>
      {/* Filter Header */}
      <div className="filter-header">
        <div className="filter-title">
          <h3>Filters</h3>
          {isFiltered && (
            <span className="filter-badge">
              {Object.keys(filters).filter(key => {
                if (key === 'region') return filters.region !== 'all';
                if (key === 'dateRange') return filters.dateRange.start || filters.dateRange.end;
                if (key === 'qualityRange') return filters.qualityRange.min > 0 || filters.qualityRange.max < 100;
                if (key === 'parameters') {
                  const { temperature, pH, turbidity } = filters.parameters;
                  return (temperature.min !== null || temperature.max !== null ||
                          pH.min !== null || pH.max !== null ||
                          turbidity.min !== null || turbidity.max !== null);
                }
                return false;
              }).length} active
            </span>
          )}
        </div>
        <div className="filter-actions">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-button"
            aria-expanded={isExpanded}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="reset-button"
              title="Clear all filters"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="filter-content">
          {/* Basic Filters */}
          <div className="filter-section">
            <div className="filter-row">
              {/* Region Filter */}
              <div className="filter-group">
                <label htmlFor="region-filter">Region</label>
                <select
                  id="region-filter"
                  value={filters.region}
                  onChange={handleRegionChange}
                  className="filter-select"
                >
                  <option value="all">All Regions</option>
                  {availableRegions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Range Filter */}
              <div className="filter-group">
                <label>Quality Index Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.qualityRange.min}
                    onChange={(e) => handleQualityRangeChange('min', e.target.value)}
                    placeholder="Min"
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.qualityRange.max}
                    onChange={(e) => handleQualityRangeChange('max', e.target.value)}
                    placeholder="Max"
                    className="range-input"
                  />
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="filter-group date-filter">
              <label>Date Range</label>
              <div className="date-controls">
                <div className="date-inputs">
                  <input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value || null)}
                    className="date-input"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value || null)}
                    className="date-input"
                  />
                  {(filters.dateRange.start || filters.dateRange.end) && (
                    <button
                      type="button"
                      onClick={clearDateRange}
                      className="clear-date-button"
                      title="Clear date range"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Preset Date Ranges */}
                <div className="date-presets">
                  {getPresetDateRanges().map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => applyPresetDateRange(preset)}
                      className="preset-button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-toggle">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="advanced-toggle-button"
            >
              {showAdvanced ? '▲' : '▼'} Advanced Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="filter-section advanced-filters">
              <h4>Parameter Ranges</h4>
              
              {/* Temperature Range */}
              <div className="filter-group">
                <label>Temperature (°C)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    value={filters.parameters.temperature.min || ''}
                    onChange={(e) => handleParameterRangeChange('temperature', 'min', e.target.value)}
                    placeholder="Min"
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    step="0.1"
                    value={filters.parameters.temperature.max || ''}
                    onChange={(e) => handleParameterRangeChange('temperature', 'max', e.target.value)}
                    placeholder="Max"
                    className="range-input"
                  />
                </div>
              </div>

              {/* pH Range */}
              <div className="filter-group">
                <label>pH Level</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={filters.parameters.pH.min || ''}
                    onChange={(e) => handleParameterRangeChange('pH', 'min', e.target.value)}
                    placeholder="Min"
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={filters.parameters.pH.max || ''}
                    onChange={(e) => handleParameterRangeChange('pH', 'max', e.target.value)}
                    placeholder="Max"
                    className="range-input"
                  />
                </div>
              </div>

              {/* Turbidity Range */}
              <div className="filter-group">
                <label>Turbidity (NTU)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={filters.parameters.turbidity.min || ''}
                    onChange={(e) => handleParameterRangeChange('turbidity', 'min', e.target.value)}
                    placeholder="Min"
                    className="range-input"
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={filters.parameters.turbidity.max || ''}
                    onChange={(e) => handleParameterRangeChange('turbidity', 'max', e.target.value)}
                    placeholder="Max"
                    className="range-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          {isFiltered && (
            <div className="filter-summary">
              <h4>Active Filters:</h4>
              <div className="filter-tags">
                {filters.region !== 'all' && (
                  <span className="filter-tag">
                    Region: {filters.region}
                    <button
                      type="button"
                      onClick={() => onFilterChange({ region: 'all' })}
                      className="remove-filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="filter-tag">
                    Date: {filters.dateRange.start || 'Any'} - {filters.dateRange.end || 'Any'}
                    <button
                      type="button"
                      onClick={clearDateRange}
                      className="remove-filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {(filters.qualityRange.min > 0 || filters.qualityRange.max < 100) && (
                  <span className="filter-tag">
                    Quality: {filters.qualityRange.min}-{filters.qualityRange.max}
                    <button
                      type="button"
                      onClick={() => onFilterChange({ qualityRange: { min: 0, max: 100 } })}
                      className="remove-filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

FilterControls.propTypes = {
  /** Current filter values */
  filters: PropTypes.shape({
    region: PropTypes.string,
    dateRange: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string
    }),
    qualityRange: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number
    }),
    parameters: PropTypes.shape({
      temperature: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      }),
      pH: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      }),
      turbidity: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      })
    })
  }).isRequired,
  /** Callback when filters change */
  onFilterChange: PropTypes.func.isRequired,
  /** Callback to reset all filters */
  onReset: PropTypes.func.isRequired,
  /** Whether any filters are currently active */
  isFiltered: PropTypes.bool,
  /** Additional CSS class name */
  className: PropTypes.string
};

export default FilterControls;
