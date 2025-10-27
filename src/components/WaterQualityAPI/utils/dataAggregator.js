/**
 * Data Aggregator Utility
 * 
 * Provides functions to aggregate sensor data across multiple sources
 * Calculates statistics, regional averages, and quality indices
 */

/**
 * Calculate basic statistics for a numeric array
 * @param {number[]} values - Array of numeric values
 * @returns {Object} Statistics object with min, max, average, median, stdDev
 */
export const calculateStatistics = (values) => {
  if (!values || values.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      stdDev: 0,
      count: 0
    };
  }

  const sortedValues = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = sum / count;

  // Calculate median
  const median = count % 2 === 0
    ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2
    : sortedValues[Math.floor(count / 2)];

  // Calculate standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    min: sortedValues[0],
    max: sortedValues[count - 1],
    average,
    median,
    stdDev,
    count
  };
};

/**
 * Aggregate sensor data across all readings
 * @param {Array} data - Array of water quality readings
 * @returns {Object} Aggregated data with statistics for each parameter
 */
export const aggregateSensorData = (data) => {
  if (!data || data.length === 0) {
    return {
      temperature: { min: 0, max: 0, average: 0, median: 0, stdDev: 0, count: 0 },
      pH: { min: 0, max: 0, average: 0, median: 0, stdDev: 0, count: 0 },
      turbidity: { min: 0, max: 0, average: 0, median: 0, stdDev: 0, count: 0 },
      region_avg_quality_index: 0,
      total_readings: 0,
      regions: [],
      sensors: [],
      date_range: { start: null, end: null }
    };
  }

  // Extract parameter values
  const temperatures = data.map(reading => reading.temperature).filter(val => val != null);
  const phValues = data.map(reading => reading.pH).filter(val => val != null);
  const turbidityValues = data.map(reading => reading.turbidity).filter(val => val != null);
  const qualityIndices = data.map(reading => reading.region_avg_quality_index).filter(val => val != null);

  // Calculate statistics for each parameter
  const temperatureStats = calculateStatistics(temperatures);
  const phStats = calculateStatistics(phValues);
  const turbidityStats = calculateStatistics(turbidityValues);
  const qualityStats = calculateStatistics(qualityIndices);

  // Get unique regions and sensors
  const uniqueRegions = [...new Set(data.map(reading => reading.region))];
  const uniqueSensors = [...new Set(data.map(reading => reading.sensor_id))];

  // Calculate date range
  const timestamps = data.map(reading => new Date(reading.timestamp)).sort((a, b) => a - b);
  const dateRange = {
    start: timestamps[0]?.toISOString() || null,
    end: timestamps[timestamps.length - 1]?.toISOString() || null
  };

  return {
    temperature: temperatureStats,
    pH: phStats,
    turbidity: turbidityStats,
    region_avg_quality_index: qualityStats.average,
    total_readings: data.length,
    regions: uniqueRegions,
    sensors: uniqueSensors,
    date_range: dateRange,
    quality_distribution: calculateQualityDistribution(qualityIndices)
  };
};

/**
 * Aggregate data by region
 * @param {Array} data - Array of water quality readings
 * @returns {Object} Regional aggregation with statistics per region
 */
export const aggregateByRegion = (data) => {
  if (!data || data.length === 0) return {};

  const regionGroups = data.reduce((groups, reading) => {
    const region = reading.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(reading);
    return groups;
  }, {});

  const regionalAggregation = {};

  Object.keys(regionGroups).forEach(region => {
    const regionData = regionGroups[region];
    regionalAggregation[region] = {
      ...aggregateSensorData(regionData),
      sensor_count: [...new Set(regionData.map(r => r.sensor_id))].length,
      latest_reading: regionData.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      )
    };
  });

  return regionalAggregation;
};

/**
 * Aggregate data by sensor
 * @param {Array} data - Array of water quality readings
 * @returns {Object} Sensor aggregation with statistics per sensor
 */
export const aggregateBySensor = (data) => {
  if (!data || data.length === 0) return {};

  const sensorGroups = data.reduce((groups, reading) => {
    const sensorId = reading.sensor_id;
    if (!groups[sensorId]) {
      groups[sensorId] = [];
    }
    groups[sensorId].push(reading);
    return groups;
  }, {});

  const sensorAggregation = {};

  Object.keys(sensorGroups).forEach(sensorId => {
    const sensorData = sensorGroups[sensorId];
    sensorAggregation[sensorId] = {
      ...aggregateSensorData(sensorData),
      region: sensorData[0]?.region,
      latest_reading: sensorData.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      ),
      reading_frequency: calculateReadingFrequency(sensorData)
    };
  });

  return sensorAggregation;
};

/**
 * Calculate quality distribution
 * @param {number[]} qualityIndices - Array of quality index values
 * @returns {Object} Distribution of quality ratings
 */
export const calculateQualityDistribution = (qualityIndices) => {
  if (!qualityIndices || qualityIndices.length === 0) {
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
      excellent: (distribution.excellent / qualityIndices.length * 100).toFixed(1),
      good: (distribution.good / qualityIndices.length * 100).toFixed(1),
      fair: (distribution.fair / qualityIndices.length * 100).toFixed(1),
      poor: (distribution.poor / qualityIndices.length * 100).toFixed(1)
    }
  };
};

/**
 * Calculate reading frequency for a sensor
 * @param {Array} sensorData - Array of readings for a specific sensor
 * @returns {Object} Reading frequency information
 */
export const calculateReadingFrequency = (sensorData) => {
  if (!sensorData || sensorData.length < 2) {
    return {
      average_interval_hours: 0,
      total_readings: sensorData?.length || 0,
      first_reading: sensorData?.[0]?.timestamp || null,
      last_reading: sensorData?.[sensorData.length - 1]?.timestamp || null
    };
  }

  const timestamps = sensorData
    .map(reading => new Date(reading.timestamp))
    .sort((a, b) => a - b);

  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    const intervalMs = timestamps[i] - timestamps[i - 1];
    const intervalHours = intervalMs / (1000 * 60 * 60);
    intervals.push(intervalHours);
  }

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  return {
    average_interval_hours: parseFloat(averageInterval.toFixed(2)),
    total_readings: sensorData.length,
    first_reading: timestamps[0].toISOString(),
    last_reading: timestamps[timestamps.length - 1].toISOString(),
    expected_readings_per_day: parseFloat((24 / averageInterval).toFixed(1))
  };
};

/**
 * Detect anomalies in sensor data
 * @param {Array} data - Array of water quality readings
 * @param {Object} thresholds - Threshold values for each parameter
 * @returns {Array} Array of anomalous readings
 */
export const detectAnomalies = (data, thresholds = {}) => {
  const defaultThresholds = {
    temperature: { min: 10, max: 35 },
    pH: { min: 6.0, max: 9.0 },
    turbidity: { max: 10.0 },
    quality_index: { min: 20 }
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };
  
  return data.filter(reading => {
    const anomalies = [];
    
    if (reading.temperature < finalThresholds.temperature.min || 
        reading.temperature > finalThresholds.temperature.max) {
      anomalies.push('temperature');
    }
    
    if (reading.pH < finalThresholds.pH.min || 
        reading.pH > finalThresholds.pH.max) {
      anomalies.push('pH');
    }
    
    if (reading.turbidity > finalThresholds.turbidity.max) {
      anomalies.push('turbidity');
    }
    
    if (reading.region_avg_quality_index < finalThresholds.quality_index.min) {
      anomalies.push('quality_index');
    }
    
    if (anomalies.length > 0) {
      reading.anomalies = anomalies;
      return true;
    }
    
    return false;
  });
};

/**
 * Calculate trend analysis for time series data
 * @param {Array} data - Array of water quality readings (should be sorted by timestamp)
 * @param {string} parameter - Parameter to analyze ('temperature', 'pH', 'turbidity', 'region_avg_quality_index')
 * @returns {Object} Trend analysis results
 */
export const calculateTrend = (data, parameter) => {
  if (!data || data.length < 2) {
    return {
      trend: 'insufficient_data',
      slope: 0,
      correlation: 0,
      change_percentage: 0
    };
  }

  const values = data.map(reading => reading[parameter]).filter(val => val != null);
  const timestamps = data.map(reading => new Date(reading.timestamp).getTime());

  if (values.length !== timestamps.length || values.length < 2) {
    return {
      trend: 'insufficient_data',
      slope: 0,
      correlation: 0,
      change_percentage: 0
    };
  }

  // Calculate linear regression
  const n = values.length;
  const sumX = timestamps.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);
  const sumYY = values.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  // Calculate percentage change
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const changePercentage = ((lastValue - firstValue) / firstValue) * 100;

  // Determine trend direction
  let trend = 'stable';
  if (Math.abs(changePercentage) > 5) {
    trend = changePercentage > 0 ? 'increasing' : 'decreasing';
  }

  return {
    trend,
    slope: parseFloat(slope.toFixed(6)),
    correlation: parseFloat(correlation.toFixed(3)),
    change_percentage: parseFloat(changePercentage.toFixed(2)),
    first_value: firstValue,
    last_value: lastValue,
    data_points: n
  };
};

export default {
  calculateStatistics,
  aggregateSensorData,
  aggregateByRegion,
  aggregateBySensor,
  calculateQualityDistribution,
  calculateReadingFrequency,
  detectAnomalies,
  calculateTrend
};
