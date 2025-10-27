/**
 * Mock Water Quality Data
 * 
 * Comprehensive mock data for water quality monitoring system
 * Includes realistic sensor readings across multiple regions and time periods
 */

// Helper function to generate random values within a range
const randomInRange = (min, max, decimals = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

// Helper function to generate timestamps
const generateTimestamp = (daysAgo, hoursOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursOffset);
  return date.toISOString();
};

// Regions with their typical water quality characteristics
const regions = [
  {
    name: 'North Coast',
    tempRange: [18, 24],
    phRange: [7.2, 8.1],
    turbidityRange: [0.5, 2.8],
    qualityRange: [75, 95]
  },
  {
    name: 'Central Valley',
    tempRange: [22, 28],
    phRange: [6.8, 7.6],
    turbidityRange: [1.2, 4.5],
    qualityRange: [65, 85]
  },
  {
    name: 'Mountain Region',
    tempRange: [15, 21],
    phRange: [7.0, 7.8],
    turbidityRange: [0.3, 1.8],
    qualityRange: [80, 98]
  },
  {
    name: 'Desert Basin',
    tempRange: [25, 32],
    phRange: [7.5, 8.3],
    turbidityRange: [2.0, 6.2],
    qualityRange: [55, 75]
  },
  {
    name: 'Urban Metro',
    tempRange: [20, 26],
    phRange: [6.9, 7.4],
    turbidityRange: [1.8, 5.1],
    qualityRange: [60, 80]
  }
];

// Generate sensor IDs for each region
const generateSensorIds = (region, count = 3) => {
  const regionCode = region.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  return Array.from({ length: count }, (_, i) => `${regionCode}-WQ-${String(i + 1).padStart(3, '0')}`);
};

// Generate mock data
const generateMockData = () => {
  const data = [];
  const currentDate = new Date();
  
  // Generate data for the last 30 days
  for (let day = 0; day < 30; day++) {
    regions.forEach(region => {
      const sensorIds = generateSensorIds(region.name);
      
      // Generate 4 readings per day per sensor (every 6 hours)
      for (let reading = 0; reading < 4; reading++) {
        sensorIds.forEach(sensorId => {
          const timestamp = generateTimestamp(day, reading * 6);
          
          // Add some realistic variation and occasional anomalies
          const isAnomaly = Math.random() < 0.05; // 5% chance of anomaly
          const variationFactor = isAnomaly ? 1.5 : 1.0;
          
          const temperature = randomInRange(
            region.tempRange[0] / variationFactor,
            region.tempRange[1] * variationFactor,
            1
          );
          
          const pH = randomInRange(
            region.phRange[0] / (isAnomaly ? 1.2 : 1.0),
            region.phRange[1] * (isAnomaly ? 1.2 : 1.0),
            2
          );
          
          const turbidity = randomInRange(
            region.turbidityRange[0],
            region.turbidityRange[1] * variationFactor,
            2
          );
          
          // Calculate quality index based on parameters
          let qualityIndex = randomInRange(region.qualityRange[0], region.qualityRange[1], 1);
          
          // Adjust quality based on parameter values
          if (pH < 6.5 || pH > 8.5) qualityIndex *= 0.8;
          if (turbidity > 4.0) qualityIndex *= 0.9;
          if (temperature < 10 || temperature > 35) qualityIndex *= 0.85;
          
          qualityIndex = Math.max(0, Math.min(100, qualityIndex));
          
          data.push({
            timestamp,
            region: region.name,
            sensor_id: sensorId,
            temperature,
            pH,
            turbidity,
            region_avg_quality_index: qualityIndex,
            // Additional metadata
            location: {
              latitude: randomInRange(32.5, 42.0, 6),
              longitude: randomInRange(-124.4, -114.1, 6)
            },
            sensor_status: isAnomaly ? 'warning' : 'normal',
            last_calibration: generateTimestamp(randomInRange(1, 30), 0),
            data_quality: isAnomaly ? 'questionable' : 'good'
          });
        });
      }
    });
  }
  
  // Sort by timestamp (newest first)
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Generate the mock data
export const mockWaterQualityData = generateMockData();

// Export additional mock data for specific scenarios
export const mockRegionalSummary = regions.map(region => ({
  region: region.name,
  sensor_count: 3,
  avg_temperature: randomInRange(region.tempRange[0], region.tempRange[1], 1),
  avg_ph: randomInRange(region.phRange[0], region.phRange[1], 2),
  avg_turbidity: randomInRange(region.turbidityRange[0], region.turbidityRange[1], 2),
  avg_quality_index: randomInRange(region.qualityRange[0], region.qualityRange[1], 1),
  last_updated: new Date().toISOString(),
  status: 'active'
}));

// Mock API response structure
export const mockApiResponse = {
  success: true,
  data: mockWaterQualityData,
  metadata: {
    total_records: mockWaterQualityData.length,
    regions: regions.length,
    sensors: regions.length * 3,
    date_range: {
      start: mockWaterQualityData[mockWaterQualityData.length - 1]?.timestamp,
      end: mockWaterQualityData[0]?.timestamp
    },
    last_updated: new Date().toISOString()
  },
  regional_summary: mockRegionalSummary
};

// Export individual regions for filtering
export const availableRegions = regions.map(r => r.name);

// Export sensor information
export const sensorInfo = regions.flatMap(region => 
  generateSensorIds(region.name).map(sensorId => ({
    sensor_id: sensorId,
    region: region.name,
    type: 'Multi-parameter Water Quality Sensor',
    manufacturer: 'AquaTech Solutions',
    model: 'WQ-Pro-2024',
    installation_date: generateTimestamp(randomInRange(30, 365), 0),
    last_maintenance: generateTimestamp(randomInRange(1, 30), 0),
    status: 'active',
    location: {
      latitude: randomInRange(32.5, 42.0, 6),
      longitude: randomInRange(-124.4, -114.1, 6),
      elevation: randomInRange(0, 2000, 0),
      description: `Water quality monitoring station in ${region.name}`
    }
  }))
);

// Export quality thresholds for reference
export const qualityThresholds = {
  temperature: {
    min: 10,
    max: 30,
    optimal_min: 18,
    optimal_max: 25,
    unit: '°C'
  },
  pH: {
    min: 6.5,
    max: 8.5,
    optimal_min: 7.0,
    optimal_max: 8.0,
    unit: 'pH units'
  },
  turbidity: {
    min: 0,
    max: 4.0,
    optimal_max: 1.0,
    unit: 'NTU'
  },
  quality_index: {
    excellent: 80,
    good: 60,
    fair: 40,
    poor: 0
  }
};

export default mockWaterQualityData;
