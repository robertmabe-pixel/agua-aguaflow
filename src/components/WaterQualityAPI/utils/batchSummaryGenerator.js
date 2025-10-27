/**
 * Batch Summary Generator
 * 
 * Generates timestamped batch summaries of water quality data
 * Supports different time intervals (hourly, daily, weekly, monthly)
 */

import { calculateStatistics } from './dataAggregator';

/**
 * Generate batch summaries grouped by time intervals
 * @param {Array} data - Array of water quality readings
 * @param {string} interval - Time interval ('hourly', 'daily', 'weekly', 'monthly')
 * @param {Object} options - Additional options for summary generation
 * @returns {Array} Array of batch summaries with timestamps
 */
export const generateBatchSummaries = (data, interval = 'daily', options = {}) => {
  if (!data || data.length === 0) {
    return [];
  }

  const {
    includeRegionalBreakdown = false,
    includeSensorBreakdown = false,
    includeQualityDistribution = true,
    includeAnomalies = false
  } = options;

  // Group data by time intervals
  const groupedData = groupDataByInterval(data, interval);
  
  // Generate summaries for each group
  const summaries = Object.keys(groupedData)
    .sort((a, b) => new Date(b) - new Date(a)) // Sort by timestamp descending
    .map(timestamp => {
      const batchData = groupedData[timestamp];
      const summary = generateSingleBatchSummary(batchData, timestamp, interval);
      
      // Add optional breakdowns
      if (includeRegionalBreakdown) {
        summary.regional_breakdown = generateRegionalBreakdown(batchData);
      }
      
      if (includeSensorBreakdown) {
        summary.sensor_breakdown = generateSensorBreakdown(batchData);
      }
      
      if (includeQualityDistribution) {
        summary.quality_distribution = generateQualityDistribution(batchData);
      }
      
      if (includeAnomalies) {
        summary.anomalies = detectBatchAnomalies(batchData);
      }
      
      return summary;
    });

  return summaries;
};

/**
 * Group data by time intervals
 * @param {Array} data - Array of water quality readings
 * @param {string} interval - Time interval
 * @returns {Object} Grouped data by timestamp keys
 */
const groupDataByInterval = (data, interval) => {
  const groups = {};
  
  data.forEach(reading => {
    const timestamp = new Date(reading.timestamp);
    const groupKey = getIntervalKey(timestamp, interval);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(reading);
  });
  
  return groups;
};

/**
 * Get the appropriate interval key for grouping
 * @param {Date} timestamp - Timestamp to process
 * @param {string} interval - Time interval
 * @returns {string} Interval key
 */
const getIntervalKey = (timestamp, interval) => {
  const year = timestamp.getFullYear();
  const month = timestamp.getMonth();
  const date = timestamp.getDate();
  const hour = timestamp.getHours();
  
  switch (interval) {
    case 'hourly':
      return new Date(year, month, date, hour).toISOString();
    case 'daily':
      return new Date(year, month, date).toISOString();
    case 'weekly':
      // Get the start of the week (Sunday)
      const dayOfWeek = timestamp.getDay();
      const weekStart = new Date(year, month, date - dayOfWeek);
      return weekStart.toISOString();
    case 'monthly':
      return new Date(year, month, 1).toISOString();
    default:
      return new Date(year, month, date).toISOString();
  }
};

/**
 * Generate a single batch summary
 * @param {Array} batchData - Data for this batch
 * @param {string} timestamp - Batch timestamp
 * @param {string} interval - Time interval
 * @returns {Object} Batch summary
 */
const generateSingleBatchSummary = (batchData, timestamp, interval) => {
  const temperatures = batchData.map(r => r.temperature).filter(v => v != null);
  const phValues = batchData.map(r => r.pH).filter(v => v != null);
  const turbidityValues = batchData.map(r => r.turbidity).filter(v => v != null);
  const qualityIndices = batchData.map(r => r.region_avg_quality_index).filter(v => v != null);
  
  const temperatureStats = calculateStatistics(temperatures);
  const phStats = calculateStatistics(phValues);
  const turbidityStats = calculateStatistics(turbidityValues);
  const qualityStats = calculateStatistics(qualityIndices);
  
  // Get unique regions and sensors
  const uniqueRegions = [...new Set(batchData.map(r => r.region))];
  const uniqueSensors = [...new Set(batchData.map(r => r.sensor_id))];
  
  // Calculate data completeness
  const expectedReadings = calculateExpectedReadings(uniqueSensors.length, interval);
  const actualReadings = batchData.length;
  const completeness = expectedReadings > 0 ? (actualReadings / expectedReadings * 100) : 100;
  
  return {
    timestamp,
    interval,
    period_start: timestamp,
    period_end: calculatePeriodEnd(timestamp, interval),
    total_readings: batchData.length,
    regions_count: uniqueRegions.length,
    sensors_count: uniqueSensors.length,
    data_completeness_percentage: parseFloat(completeness.toFixed(1)),
    
    // Parameter statistics
    temperature: {
      average: parseFloat(temperatureStats.average.toFixed(1)),
      min: parseFloat(temperatureStats.min.toFixed(1)),
      max: parseFloat(temperatureStats.max.toFixed(1)),
      median: parseFloat(temperatureStats.median.toFixed(1)),
      std_dev: parseFloat(temperatureStats.stdDev.toFixed(2))
    },
    
    pH: {
      average: parseFloat(phStats.average.toFixed(2)),
      min: parseFloat(phStats.min.toFixed(2)),
      max: parseFloat(phStats.max.toFixed(2)),
      median: parseFloat(phStats.median.toFixed(2)),
      std_dev: parseFloat(phStats.stdDev.toFixed(3))
    },
    
    turbidity: {
      average: parseFloat(turbidityStats.average.toFixed(2)),
      min: parseFloat(turbidityStats.min.toFixed(2)),
      max: parseFloat(turbidityStats.max.toFixed(2)),
      median: parseFloat(turbidityStats.median.toFixed(2)),
      std_dev: parseFloat(turbidityStats.stdDev.toFixed(3))
    },
    
    region_avg_quality_index: {
      average: parseFloat(qualityStats.average.toFixed(1)),
      min: parseFloat(qualityStats.min.toFixed(1)),
      max: parseFloat(qualityStats.max.toFixed(1)),
      median: parseFloat(qualityStats.median.toFixed(1)),
      std_dev: parseFloat(qualityStats.stdDev.toFixed(2))
    },
    
    // Overall quality assessment
    overall_quality_rating: getQualityRating(qualityStats.average),
    
    // Metadata
    regions: uniqueRegions,
    sensors: uniqueSensors,
    generated_at: new Date().toISOString()
  };
};

/**
 * Calculate the end of a time period
 * @param {string} startTimestamp - Start timestamp
 * @param {string} interval - Time interval
 * @returns {string} End timestamp
 */
const calculatePeriodEnd = (startTimestamp, interval) => {
  const start = new Date(startTimestamp);
  let end;
  
  switch (interval) {
    case 'hourly':
      end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      break;
    case 'daily':
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // +1 day
      break;
    case 'weekly':
      end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      break;
    case 'monthly':
      end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
      break;
    default:
      end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // Default to +1 day
  }
  
  return end.toISOString();
};

/**
 * Calculate expected number of readings for a time period
 * @param {number} sensorCount - Number of sensors
 * @param {string} interval - Time interval
 * @returns {number} Expected readings
 */
const calculateExpectedReadings = (sensorCount, interval) => {
  const readingsPerSensorPerHour = 0.25; // Assuming 1 reading every 4 hours
  
  let hoursInInterval;
  switch (interval) {
    case 'hourly':
      hoursInInterval = 1;
      break;
    case 'daily':
      hoursInInterval = 24;
      break;
    case 'weekly':
      hoursInInterval = 24 * 7;
      break;
    case 'monthly':
      hoursInInterval = 24 * 30; // Approximate
      break;
    default:
      hoursInInterval = 24;
  }
  
  return Math.ceil(sensorCount * readingsPerSensorPerHour * hoursInInterval);
};

/**
 * Generate regional breakdown for a batch
 * @param {Array} batchData - Data for this batch
 * @returns {Object} Regional breakdown
 */
const generateRegionalBreakdown = (batchData) => {
  const regionGroups = batchData.reduce((groups, reading) => {
    const region = reading.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(reading);
    return groups;
  }, {});
  
  const breakdown = {};
  
  Object.keys(regionGroups).forEach(region => {
    const regionData = regionGroups[region];
    const temperatures = regionData.map(r => r.temperature).filter(v => v != null);
    const phValues = regionData.map(r => r.pH).filter(v => v != null);
    const turbidityValues = regionData.map(r => r.turbidity).filter(v => v != null);
    const qualityIndices = regionData.map(r => r.region_avg_quality_index).filter(v => v != null);
    
    breakdown[region] = {
      readings_count: regionData.length,
      sensors_count: [...new Set(regionData.map(r => r.sensor_id))].length,
      temperature_avg: temperatures.length > 0 ? parseFloat((temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)) : 0,
      pH_avg: phValues.length > 0 ? parseFloat((phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2)) : 0,
      turbidity_avg: turbidityValues.length > 0 ? parseFloat((turbidityValues.reduce((a, b) => a + b, 0) / turbidityValues.length).toFixed(2)) : 0,
      quality_index_avg: qualityIndices.length > 0 ? parseFloat((qualityIndices.reduce((a, b) => a + b, 0) / qualityIndices.length).toFixed(1)) : 0,
      quality_rating: getQualityRating(qualityIndices.length > 0 ? qualityIndices.reduce((a, b) => a + b, 0) / qualityIndices.length : 0)
    };
  });
  
  return breakdown;
};

/**
 * Generate sensor breakdown for a batch
 * @param {Array} batchData - Data for this batch
 * @returns {Object} Sensor breakdown
 */
const generateSensorBreakdown = (batchData) => {
  const sensorGroups = batchData.reduce((groups, reading) => {
    const sensorId = reading.sensor_id;
    if (!groups[sensorId]) {
      groups[sensorId] = [];
    }
    groups[sensorId].push(reading);
    return groups;
  }, {});
  
  const breakdown = {};
  
  Object.keys(sensorGroups).forEach(sensorId => {
    const sensorData = sensorGroups[sensorId];
    const temperatures = sensorData.map(r => r.temperature).filter(v => v != null);
    const phValues = sensorData.map(r => r.pH).filter(v => v != null);
    const turbidityValues = sensorData.map(r => r.turbidity).filter(v => v != null);
    const qualityIndices = sensorData.map(r => r.region_avg_quality_index).filter(v => v != null);
    
    breakdown[sensorId] = {
      region: sensorData[0]?.region,
      readings_count: sensorData.length,
      temperature_avg: temperatures.length > 0 ? parseFloat((temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)) : 0,
      pH_avg: phValues.length > 0 ? parseFloat((phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(2)) : 0,
      turbidity_avg: turbidityValues.length > 0 ? parseFloat((turbidityValues.reduce((a, b) => a + b, 0) / turbidityValues.length).toFixed(2)) : 0,
      quality_index_avg: qualityIndices.length > 0 ? parseFloat((qualityIndices.reduce((a, b) => a + b, 0) / qualityIndices.length).toFixed(1)) : 0,
      last_reading: sensorData.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      ).timestamp
    };
  });
  
  return breakdown;
};

/**
 * Generate quality distribution for a batch
 * @param {Array} batchData - Data for this batch
 * @returns {Object} Quality distribution
 */
const generateQualityDistribution = (batchData) => {
  const qualityIndices = batchData.map(r => r.region_avg_quality_index).filter(v => v != null);
  
  if (qualityIndices.length === 0) {
    return {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      total: 0
    };
  }
  
  const distribution = qualityIndices.reduce((dist, index) => {
    if (index >= 80) dist.excellent++;
    else if (index >= 60) dist.good++;
    else if (index >= 40) dist.fair++;
    else dist.poor++;
    return dist;
  }, { excellent: 0, good: 0, fair: 0, poor: 0 });
  
  return {
    ...distribution,
    total: qualityIndices.length,
    percentages: {
      excellent: parseFloat((distribution.excellent / qualityIndices.length * 100).toFixed(1)),
      good: parseFloat((distribution.good / qualityIndices.length * 100).toFixed(1)),
      fair: parseFloat((distribution.fair / qualityIndices.length * 100).toFixed(1)),
      poor: parseFloat((distribution.poor / qualityIndices.length * 100).toFixed(1))
    }
  };
};

/**
 * Detect anomalies in a batch
 * @param {Array} batchData - Data for this batch
 * @returns {Array} Array of anomalous readings
 */
const detectBatchAnomalies = (batchData) => {
  const anomalies = [];
  
  batchData.forEach(reading => {
    const issues = [];
    
    // Temperature anomalies
    if (reading.temperature < 10 || reading.temperature > 35) {
      issues.push('temperature_out_of_range');
    }
    
    // pH anomalies
    if (reading.pH < 6.0 || reading.pH > 9.0) {
      issues.push('pH_out_of_range');
    }
    
    // Turbidity anomalies
    if (reading.turbidity > 10.0) {
      issues.push('high_turbidity');
    }
    
    // Quality index anomalies
    if (reading.region_avg_quality_index < 30) {
      issues.push('poor_quality_index');
    }
    
    if (issues.length > 0) {
      anomalies.push({
        timestamp: reading.timestamp,
        sensor_id: reading.sensor_id,
        region: reading.region,
        issues,
        values: {
          temperature: reading.temperature,
          pH: reading.pH,
          turbidity: reading.turbidity,
          quality_index: reading.region_avg_quality_index
        }
      });
    }
  });
  
  return anomalies;
};

/**
 * Get quality rating from quality index
 * @param {number} qualityIndex - Quality index value
 * @returns {string} Quality rating
 */
const getQualityRating = (qualityIndex) => {
  if (qualityIndex >= 80) return 'excellent';
  if (qualityIndex >= 60) return 'good';
  if (qualityIndex >= 40) return 'fair';
  return 'poor';
};

export default {
  generateBatchSummaries,
  generateSingleBatchSummary: generateSingleBatchSummary,
  generateRegionalBreakdown,
  generateSensorBreakdown,
  generateQualityDistribution,
  detectBatchAnomalies
};
