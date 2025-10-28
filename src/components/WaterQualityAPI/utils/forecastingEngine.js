/**
 * Water Quality Forecasting Engine
 * 
 * Provides predictive analytics for water quality metrics using historical trends
 * and statistical analysis to forecast quality index for the next 7 days.
 */

/**
 * Calculate linear regression for trend analysis
 * @param {Array} data - Array of {x, y} points
 * @returns {Object} - {slope, intercept, r2}
 */
const calculateLinearRegression = (data) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumYY = data.reduce((sum, point) => sum + point.y * point.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = data.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  const ssTot = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, r2 };
};

/**
 * Calculate moving average for smoothing
 * @param {Array} values - Array of numeric values
 * @param {number} window - Window size for moving average
 * @returns {Array} - Smoothed values
 */
const calculateMovingAverage = (values, window = 3) => {
  if (values.length < window) return values;
  
  const smoothed = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(values.length, start + window);
    const slice = values.slice(start, end);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    smoothed.push(avg);
  }
  return smoothed;
};

/**
 * Detect seasonal patterns in water quality data
 * @param {Array} historicalData - Historical water quality readings
 * @returns {Object} - Seasonal adjustment factors
 */
const detectSeasonalPatterns = (historicalData) => {
  const dayOfWeekPatterns = new Array(7).fill(0);
  const dayOfWeekCounts = new Array(7).fill(0);
  
  historicalData.forEach(reading => {
    const date = new Date(reading.timestamp);
    const dayOfWeek = date.getDay();
    dayOfWeekPatterns[dayOfWeek] += reading.region_avg_quality_index;
    dayOfWeekCounts[dayOfWeek]++;
  });

  // Calculate average quality index for each day of week
  const weeklyPattern = dayOfWeekPatterns.map((sum, index) => 
    dayOfWeekCounts[index] > 0 ? sum / dayOfWeekCounts[index] : 0
  );

  const overallAverage = weeklyPattern.reduce((sum, val) => sum + val, 0) / 7;
  const seasonalFactors = weeklyPattern.map(avg => 
    overallAverage > 0 ? avg / overallAverage : 1
  );

  return {
    weeklyPattern,
    seasonalFactors,
    overallAverage
  };
};

/**
 * Determine trend direction based on recent data
 * @param {Array} recentValues - Recent quality index values
 * @param {number} slope - Linear regression slope
 * @returns {string} - "improving", "stable", or "declining"
 */
const determineTrend = (recentValues, slope) => {
  const threshold = 0.5; // Quality index points per day
  
  if (Math.abs(slope) < threshold) {
    return "stable";
  }
  
  return slope > 0 ? "improving" : "declining";
};

/**
 * Add confidence intervals to forecasts
 * @param {Array} historicalData - Historical data for error calculation
 * @param {Array} forecasts - Forecast values
 * @returns {Array} - Forecasts with confidence intervals
 */
const addConfidenceIntervals = (historicalData, forecasts) => {
  // Calculate historical prediction error (simplified approach)
  const errors = [];
  for (let i = 1; i < Math.min(historicalData.length, 30); i++) {
    const actual = historicalData[i].region_avg_quality_index;
    const predicted = historicalData[i - 1].region_avg_quality_index;
    errors.push(Math.abs(actual - predicted));
  }

  const avgError = errors.length > 0 ? 
    errors.reduce((sum, err) => sum + err, 0) / errors.length : 5;
  
  const stdError = errors.length > 1 ? 
    Math.sqrt(errors.reduce((sum, err) => sum + Math.pow(err - avgError, 2), 0) / (errors.length - 1)) : 3;

  return forecasts.map((forecast, index) => {
    // Confidence decreases with forecast distance
    const confidenceDecay = Math.exp(-index * 0.1);
    const margin = stdError * 1.96 * (1 + index * 0.2) * confidenceDecay;
    
    return {
      ...forecast,
      confidence_interval: {
        lower: Math.max(0, forecast.quality_index - margin),
        upper: Math.min(100, forecast.quality_index + margin),
        confidence_level: Math.max(0.5, 0.95 * confidenceDecay)
      }
    };
  });
};

/**
 * Generate 7-day water quality forecast
 * @param {Array} historicalData - Historical water quality readings (sorted by timestamp desc)
 * @param {string} region - Specific region to forecast (optional)
 * @returns {Object} - Forecast results with trend analysis
 */
export const generateWaterQualityForecast = (historicalData, region = null) => {
  try {
    // Filter data by region if specified
    let data = region ? 
      historicalData.filter(reading => reading.region === region) : 
      historicalData;

    // Sort by timestamp ascending for analysis
    data = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (data.length < 7) {
      throw new Error('Insufficient historical data for forecasting (minimum 7 data points required)');
    }

    // Use last 30 days of data for forecasting
    const recentData = data.slice(-30);
    
    // Prepare data for regression analysis
    const regressionData = recentData.map((reading, index) => ({
      x: index,
      y: reading.region_avg_quality_index
    }));

    // Calculate trend using linear regression
    const regression = calculateLinearRegression(regressionData);
    
    // Detect seasonal patterns
    const seasonalAnalysis = detectSeasonalPatterns(recentData);
    
    // Generate base forecast using trend
    const baseDate = new Date(recentData[recentData.length - 1].timestamp);
    const forecasts = [];
    
    for (let day = 1; day <= 7; day++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setDate(forecastDate.getDate() + day);
      
      // Base prediction from linear trend
      const basePrediction = regression.slope * (recentData.length - 1 + day) + regression.intercept;
      
      // Apply seasonal adjustment
      const dayOfWeek = forecastDate.getDay();
      const seasonalFactor = seasonalAnalysis.seasonalFactors[dayOfWeek] || 1;
      
      // Apply moving average smoothing to recent values for stability
      const recentValues = recentData.slice(-7).map(r => r.region_avg_quality_index);
      const smoothedRecent = calculateMovingAverage(recentValues, 3);
      const recentAvg = smoothedRecent[smoothedRecent.length - 1];
      
      // Combine trend and seasonal factors with recent average
      let qualityIndex = (basePrediction * 0.6) + (recentAvg * seasonalFactor * 0.4);
      
      // Add some realistic noise and bounds
      const noise = (Math.random() - 0.5) * 2; // ±1 point random variation
      qualityIndex = Math.max(0, Math.min(100, qualityIndex + noise));
      
      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        timestamp: forecastDate.toISOString(),
        quality_index: Math.round(qualityIndex * 10) / 10, // Round to 1 decimal
        day_offset: day,
        seasonal_factor: seasonalFactor,
        trend_component: basePrediction,
        base_component: recentAvg
      });
    }

    // Add confidence intervals
    const forecastsWithConfidence = addConfidenceIntervals(recentData, forecasts);
    
    // Determine overall trend
    const recentQualityValues = recentData.slice(-7).map(r => r.region_avg_quality_index);
    const trend = determineTrend(recentQualityValues, regression.slope);
    
    // Calculate forecast summary statistics
    const forecastValues = forecastsWithConfidence.map(f => f.quality_index);
    const avgForecast = forecastValues.reduce((sum, val) => sum + val, 0) / forecastValues.length;
    const currentQuality = recentData[recentData.length - 1].region_avg_quality_index;
    const expectedChange = avgForecast - currentQuality;

    return {
      success: true,
      forecast_quality_index: forecastsWithConfidence,
      trend,
      summary: {
        current_quality_index: currentQuality,
        average_forecast: Math.round(avgForecast * 10) / 10,
        expected_change: Math.round(expectedChange * 10) / 10,
        trend_strength: Math.abs(regression.slope),
        confidence: Math.min(1, Math.max(0, regression.r2)),
        data_points_used: recentData.length,
        forecast_period: '7 days'
      },
      metadata: {
        region: region || 'all_regions',
        generated_at: new Date().toISOString(),
        model_version: '1.0.0',
        algorithm: 'linear_regression_with_seasonal_adjustment'
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      forecast_quality_index: [],
      trend: "unknown"
    };
  }
};

/**
 * Generate regional forecast comparison
 * @param {Array} historicalData - Historical water quality readings
 * @returns {Object} - Forecasts for all regions
 */
export const generateRegionalForecasts = (historicalData) => {
  const regions = [...new Set(historicalData.map(reading => reading.region))];
  const regionalForecasts = {};

  regions.forEach(region => {
    regionalForecasts[region] = generateWaterQualityForecast(historicalData, region);
  });

  // Generate overall forecast
  regionalForecasts.overall = generateWaterQualityForecast(historicalData);

  return {
    success: true,
    regional_forecasts: regionalForecasts,
    regions: regions,
    generated_at: new Date().toISOString()
  };
};

/**
 * Cache management for forecasts
 */
export class ForecastCache {
  constructor(ttlMinutes = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  generateKey(region, params = {}) {
    const keyData = { region, ...params };
    return JSON.stringify(keyData);
  }

  get(region, params = {}) {
    const key = this.generateKey(region, params);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(region, data, params = {}) {
    const key = this.generateKey(region, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
export const forecastCache = new ForecastCache(60); // 1 hour TTL
