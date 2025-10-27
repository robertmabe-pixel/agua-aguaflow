/**
 * useWaterQualityFilters Hook
 * 
 * Custom React hook for managing water quality data filters
 * Handles date range and region filtering with validation
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing water quality filters
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and management functions
 */
export const useWaterQualityFilters = (initialFilters = {}) => {
  const defaultFilters = {
    region: 'all',
    dateRange: {
      start: null,
      end: null
    },
    sensors: [],
    qualityRange: {
      min: 0,
      max: 100
    },
    parameters: {
      temperature: { min: null, max: null },
      pH: { min: null, max: null },
      turbidity: { min: null, max: null }
    }
  };

  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters
  });

  /**
   * Update a specific filter
   * @param {string} filterKey - The filter key to update
   * @param {*} value - The new value
   */
  const updateFilter = useCallback((filterKey, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: value
    }));
  }, []);

  /**
   * Update multiple filters at once
   * @param {Object} newFilters - Object containing filter updates
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  /**
   * Update date range filter
   * @param {string} start - Start date (ISO string)
   * @param {string} end - End date (ISO string)
   */
  const updateDateRange = useCallback((start, end) => {
    // Validate date range
    if (start && end && new Date(start) > new Date(end)) {
      console.warn('Start date cannot be after end date');
      return;
    }

    setFilters(prevFilters => ({
      ...prevFilters,
      dateRange: { start, end }
    }));
  }, []);

  /**
   * Update region filter
   * @param {string} region - Region name or 'all'
   */
  const updateRegion = useCallback((region) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      region
    }));
  }, []);

  /**
   * Update sensor filter
   * @param {Array} sensors - Array of sensor IDs
   */
  const updateSensors = useCallback((sensors) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      sensors: Array.isArray(sensors) ? sensors : []
    }));
  }, []);

  /**
   * Update quality range filter
   * @param {number} min - Minimum quality index
   * @param {number} max - Maximum quality index
   */
  const updateQualityRange = useCallback((min, max) => {
    // Validate range
    if (min > max) {
      console.warn('Minimum quality cannot be greater than maximum');
      return;
    }

    setFilters(prevFilters => ({
      ...prevFilters,
      qualityRange: { min, max }
    }));
  }, []);

  /**
   * Update parameter range filter
   * @param {string} parameter - Parameter name (temperature, pH, turbidity)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  const updateParameterRange = useCallback((parameter, min, max) => {
    // Validate range
    if (min !== null && max !== null && min > max) {
      console.warn(`Minimum ${parameter} cannot be greater than maximum`);
      return;
    }

    setFilters(prevFilters => ({
      ...prevFilters,
      parameters: {
        ...prevFilters.parameters,
        [parameter]: { min, max }
      }
    }));
  }, []);

  /**
   * Reset all filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      ...initialFilters
    });
  }, [initialFilters]);

  /**
   * Reset a specific filter to its default value
   * @param {string} filterKey - The filter key to reset
   */
  const resetFilter = useCallback((filterKey) => {
    const defaultValue = defaultFilters[filterKey];
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: defaultValue
    }));
  }, []);

  /**
   * Check if any filters are currently active
   */
  const isFiltered = useMemo(() => {
    // Check region filter
    if (filters.region !== 'all') return true;

    // Check date range filter
    if (filters.dateRange.start || filters.dateRange.end) return true;

    // Check sensor filter
    if (filters.sensors.length > 0) return true;

    // Check quality range filter
    if (filters.qualityRange.min > 0 || filters.qualityRange.max < 100) return true;

    // Check parameter filters
    const { temperature, pH, turbidity } = filters.parameters;
    if (temperature.min !== null || temperature.max !== null) return true;
    if (pH.min !== null || pH.max !== null) return true;
    if (turbidity.min !== null || turbidity.max !== null) return true;

    return false;
  }, [filters]);

  /**
   * Get active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.region !== 'all') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.sensors.length > 0) count++;
    if (filters.qualityRange.min > 0 || filters.qualityRange.max < 100) count++;

    const { temperature, pH, turbidity } = filters.parameters;
    if (temperature.min !== null || temperature.max !== null) count++;
    if (pH.min !== null || pH.max !== null) count++;
    if (turbidity.min !== null || turbidity.max !== null) count++;

    return count;
  }, [filters]);

  /**
   * Validate current filters
   * @returns {Object} Validation result with isValid and errors
   */
  const validateFilters = useCallback(() => {
    const errors = [];

    // Validate date range
    if (filters.dateRange.start && filters.dateRange.end) {
      if (new Date(filters.dateRange.start) > new Date(filters.dateRange.end)) {
        errors.push('Start date cannot be after end date');
      }
    }

    // Validate quality range
    if (filters.qualityRange.min > filters.qualityRange.max) {
      errors.push('Minimum quality cannot be greater than maximum quality');
    }

    // Validate parameter ranges
    const { temperature, pH, turbidity } = filters.parameters;
    
    if (temperature.min !== null && temperature.max !== null && temperature.min > temperature.max) {
      errors.push('Minimum temperature cannot be greater than maximum temperature');
    }
    
    if (pH.min !== null && pH.max !== null && pH.min > pH.max) {
      errors.push('Minimum pH cannot be greater than maximum pH');
    }
    
    if (turbidity.min !== null && turbidity.max !== null && turbidity.min > turbidity.max) {
      errors.push('Minimum turbidity cannot be greater than maximum turbidity');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [filters]);

  /**
   * Get filter summary for display
   */
  const getFilterSummary = useCallback(() => {
    const summary = [];

    if (filters.region !== 'all') {
      summary.push(`Region: ${filters.region}`);
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      const start = filters.dateRange.start ? new Date(filters.dateRange.start).toLocaleDateString() : 'Any';
      const end = filters.dateRange.end ? new Date(filters.dateRange.end).toLocaleDateString() : 'Any';
      summary.push(`Date: ${start} - ${end}`);
    }

    if (filters.sensors.length > 0) {
      summary.push(`Sensors: ${filters.sensors.length} selected`);
    }

    if (filters.qualityRange.min > 0 || filters.qualityRange.max < 100) {
      summary.push(`Quality: ${filters.qualityRange.min}-${filters.qualityRange.max}`);
    }

    const { temperature, pH, turbidity } = filters.parameters;
    
    if (temperature.min !== null || temperature.max !== null) {
      const min = temperature.min !== null ? temperature.min : 'Any';
      const max = temperature.max !== null ? temperature.max : 'Any';
      summary.push(`Temperature: ${min}-${max}°C`);
    }
    
    if (pH.min !== null || pH.max !== null) {
      const min = pH.min !== null ? pH.min : 'Any';
      const max = pH.max !== null ? pH.max : 'Any';
      summary.push(`pH: ${min}-${max}`);
    }
    
    if (turbidity.min !== null || turbidity.max !== null) {
      const min = turbidity.min !== null ? turbidity.min : 'Any';
      const max = turbidity.max !== null ? turbidity.max : 'Any';
      summary.push(`Turbidity: ${min}-${max} NTU`);
    }

    return summary;
  }, [filters]);

  /**
   * Apply filters to data array
   * @param {Array} data - Array of water quality readings
   * @returns {Array} Filtered data array
   */
  const applyFilters = useCallback((data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter(reading => {
      // Region filter
      if (filters.region !== 'all' && reading.region !== filters.region) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const readingDate = new Date(reading.timestamp);
        
        if (filters.dateRange.start && readingDate < new Date(filters.dateRange.start)) {
          return false;
        }
        
        if (filters.dateRange.end && readingDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Sensor filter
      if (filters.sensors.length > 0 && !filters.sensors.includes(reading.sensor_id)) {
        return false;
      }

      // Quality range filter
      if (reading.region_avg_quality_index < filters.qualityRange.min || 
          reading.region_avg_quality_index > filters.qualityRange.max) {
        return false;
      }

      // Parameter filters
      const { temperature, pH, turbidity } = filters.parameters;
      
      if (temperature.min !== null && reading.temperature < temperature.min) return false;
      if (temperature.max !== null && reading.temperature > temperature.max) return false;
      if (pH.min !== null && reading.pH < pH.min) return false;
      if (pH.max !== null && reading.pH > pH.max) return false;
      if (turbidity.min !== null && reading.turbidity < turbidity.min) return false;
      if (turbidity.max !== null && reading.turbidity > turbidity.max) return false;

      return true;
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    updateDateRange,
    updateRegion,
    updateSensors,
    updateQualityRange,
    updateParameterRange,
    resetFilters,
    resetFilter,
    isFiltered,
    activeFilterCount,
    validateFilters,
    getFilterSummary,
    applyFilters
  };
};

export default useWaterQualityFilters;
