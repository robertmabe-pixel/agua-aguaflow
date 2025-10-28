/**
 * Tests for Water Quality Forecasting Engine
 */

import { 
  generateWaterQualityForecast, 
  generateRegionalForecasts,
  ForecastCache 
} from '../forecastingEngine';

// Mock data for testing
const mockHistoricalData = [
  {
    timestamp: '2025-10-21T00:00:00.000Z',
    region: 'North Coast',
    sensor_id: 'NOR-WQ-001',
    temperature: 22.5,
    pH: 7.8,
    turbidity: 1.2,
    region_avg_quality_index: 85.3
  },
  {
    timestamp: '2025-10-22T00:00:00.000Z',
    region: 'North Coast',
    sensor_id: 'NOR-WQ-001',
    temperature: 23.1,
    pH: 7.7,
    turbidity: 1.4,
    region_avg_quality_index: 84.8
  },
  {
    timestamp: '2025-10-23T00:00:00.000Z',
    region: 'North Coast',
    sensor_id: 'NOR-WQ-001',
    temperature: 22.8,
    pH: 7.9,
    turbidity: 1.1,
    region_avg_quality_index: 86.1
  },
  {
    timestamp: '2025-10-24T00:00:00.000Z',
    region: 'Central Valley',
    sensor_id: 'CEN-WQ-001',
    temperature: 25.2,
    pH: 7.2,
    turbidity: 2.8,
    region_avg_quality_index: 72.5
  },
  {
    timestamp: '2025-10-25T00:00:00.000Z',
    region: 'Central Valley',
    sensor_id: 'CEN-WQ-001',
    temperature: 24.9,
    pH: 7.3,
    turbidity: 2.6,
    region_avg_quality_index: 73.8
  },
  {
    timestamp: '2025-10-26T00:00:00.000Z',
    region: 'North Coast',
    sensor_id: 'NOR-WQ-001',
    temperature: 22.3,
    pH: 7.8,
    turbidity: 1.3,
    region_avg_quality_index: 85.7
  },
  {
    timestamp: '2025-10-27T00:00:00.000Z',
    region: 'North Coast',
    sensor_id: 'NOR-WQ-001',
    temperature: 22.6,
    pH: 7.6,
    turbidity: 1.5,
    region_avg_quality_index: 84.2
  },
  {
    timestamp: '2025-10-28T00:00:00.000Z',
    region: 'Central Valley',
    sensor_id: 'CEN-WQ-001',
    temperature: 25.8,
    pH: 7.1,
    turbidity: 3.2,
    region_avg_quality_index: 71.3
  }
];

describe('Water Quality Forecasting Engine', () => {
  describe('generateWaterQualityForecast', () => {
    test('should generate forecast for sufficient data', () => {
      const result = generateWaterQualityForecast(mockHistoricalData);
      
      expect(result.success).toBe(true);
      expect(result.forecast_quality_index).toHaveLength(7);
      expect(result.trend).toMatch(/^(improving|stable|declining)$/);
      expect(result.summary).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should generate forecast for specific region', () => {
      const result = generateWaterQualityForecast(mockHistoricalData, 'North Coast');
      
      expect(result.success).toBe(true);
      expect(result.metadata.region).toBe('North Coast');
      expect(result.forecast_quality_index).toHaveLength(7);
    });

    test('should fail with insufficient data', () => {
      const insufficientData = mockHistoricalData.slice(0, 3);
      const result = generateWaterQualityForecast(insufficientData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient historical data');
      expect(result.forecast_quality_index).toHaveLength(0);
      expect(result.trend).toBe('unknown');
    });

    test('should include confidence intervals', () => {
      const result = generateWaterQualityForecast(mockHistoricalData);
      
      expect(result.success).toBe(true);
      result.forecast_quality_index.forEach(forecast => {
        expect(forecast.confidence_interval).toBeDefined();
        expect(forecast.confidence_interval.lower).toBeGreaterThanOrEqual(0);
        expect(forecast.confidence_interval.upper).toBeLessThanOrEqual(100);
        expect(forecast.confidence_interval.confidence_level).toBeGreaterThan(0);
        expect(forecast.confidence_interval.confidence_level).toBeLessThanOrEqual(1);
      });
    });

    test('should have decreasing confidence over time', () => {
      const result = generateWaterQualityForecast(mockHistoricalData);
      
      expect(result.success).toBe(true);
      const confidenceLevels = result.forecast_quality_index.map(f => f.confidence_interval.confidence_level);
      
      // Check that confidence generally decreases (allowing for some variation)
      expect(confidenceLevels[0]).toBeGreaterThan(confidenceLevels[6]);
    });

    test('should generate valid forecast dates', () => {
      const result = generateWaterQualityForecast(mockHistoricalData);
      
      expect(result.success).toBe(true);
      const today = new Date();
      
      result.forecast_quality_index.forEach((forecast, index) => {
        const forecastDate = new Date(forecast.date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() + index + 1);
        
        expect(forecastDate.getDate()).toBe(expectedDate.getDate());
        expect(forecast.day_offset).toBe(index + 1);
      });
    });

    test('should bound quality index values', () => {
      const result = generateWaterQualityForecast(mockHistoricalData);
      
      expect(result.success).toBe(true);
      result.forecast_quality_index.forEach(forecast => {
        expect(forecast.quality_index).toBeGreaterThanOrEqual(0);
        expect(forecast.quality_index).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('generateRegionalForecasts', () => {
    test('should generate forecasts for all regions', () => {
      const result = generateRegionalForecasts(mockHistoricalData);
      
      expect(result.success).toBe(true);
      expect(result.regional_forecasts).toBeDefined();
      expect(result.regional_forecasts['North Coast']).toBeDefined();
      expect(result.regional_forecasts['Central Valley']).toBeDefined();
      expect(result.regional_forecasts.overall).toBeDefined();
      expect(result.regions).toContain('North Coast');
      expect(result.regions).toContain('Central Valley');
    });

    test('should include generation timestamp', () => {
      const result = generateRegionalForecasts(mockHistoricalData);
      
      expect(result.success).toBe(true);
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at)).toBeInstanceOf(Date);
    });
  });

  describe('ForecastCache', () => {
    let cache;

    beforeEach(() => {
      cache = new ForecastCache(1); // 1 minute TTL for testing
    });

    test('should store and retrieve cached data', () => {
      const testData = { forecast: 'test' };
      cache.set('test-region', testData);
      
      const retrieved = cache.get('test-region');
      expect(retrieved).toEqual(testData);
    });

    test('should return null for non-existent keys', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    test('should handle cache expiration', (done) => {
      const testData = { forecast: 'test' };
      const shortCache = new ForecastCache(0.01); // Very short TTL
      
      shortCache.set('test-region', testData);
      
      // Should be available immediately
      expect(shortCache.get('test-region')).toEqual(testData);
      
      // Should expire after TTL
      setTimeout(() => {
        expect(shortCache.get('test-region')).toBeNull();
        done();
      }, 1000); // Wait longer than TTL
    });

    test('should generate consistent cache keys', () => {
      const key1 = cache.generateKey('region1', { param: 'value' });
      const key2 = cache.generateKey('region1', { param: 'value' });
      const key3 = cache.generateKey('region2', { param: 'value' });
      
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
    });

    test('should clear all cached data', () => {
      cache.set('region1', { data: 'test1' });
      cache.set('region2', { data: 'test2' });
      
      expect(cache.size()).toBe(2);
      
      cache.clear();
      
      expect(cache.size()).toBe(0);
      expect(cache.get('region1')).toBeNull();
      expect(cache.get('region2')).toBeNull();
    });

    test('should track cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('region1', { data: 'test1' });
      expect(cache.size()).toBe(1);
      
      cache.set('region2', { data: 'test2' });
      expect(cache.size()).toBe(2);
      
      cache.set('region1', { data: 'updated' }); // Update existing
      expect(cache.size()).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty data array', () => {
      const result = generateWaterQualityForecast([]);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient historical data');
    });

    test('should handle data with missing fields', () => {
      const incompleteData = [
        { timestamp: '2025-10-21T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-22T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-23T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-24T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-25T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-26T00:00:00.000Z', region: 'Test' },
        { timestamp: '2025-10-27T00:00:00.000Z', region: 'Test' }
      ];
      
      // Should handle gracefully even with missing quality index
      const result = generateWaterQualityForecast(incompleteData);
      expect(result).toBeDefined();
    });

    test('should handle single region data', () => {
      const singleRegionData = mockHistoricalData.filter(d => d.region === 'North Coast');
      const result = generateWaterQualityForecast(singleRegionData, 'North Coast');
      
      expect(result.success).toBe(true);
      expect(result.metadata.region).toBe('North Coast');
    });

    test('should handle extreme quality index values', () => {
      const extremeData = mockHistoricalData.map((item, index) => ({
        ...item,
        region_avg_quality_index: index % 2 === 0 ? 0 : 100 // Alternating extreme values
      }));
      
      const result = generateWaterQualityForecast(extremeData);
      
      expect(result.success).toBe(true);
      // Should still produce bounded forecasts
      result.forecast_quality_index.forEach(forecast => {
        expect(forecast.quality_index).toBeGreaterThanOrEqual(0);
        expect(forecast.quality_index).toBeLessThanOrEqual(100);
      });
    });
  });
});
