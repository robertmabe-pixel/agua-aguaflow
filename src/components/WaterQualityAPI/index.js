/**
 * WaterQualityAPI Component Export
 * 
 * Main entry point for the Water Quality API component
 */

export { default } from './WaterQualityAPI';
export { default as WaterQualityAPI } from './WaterQualityAPI';

// Export sub-components
export { default as FilterControls } from './components/FilterControls';
export { default as BatchSummaryDisplay } from './components/BatchSummaryDisplay';

// Export hooks
export { useWaterQualityFilters } from './hooks/useWaterQualityFilters';

// Export utilities
export * from './utils/dataAggregator';
export * from './utils/batchSummaryGenerator';

// Export mock data
export * from './mockData/waterQualityMockData';
