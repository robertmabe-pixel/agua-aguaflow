import React from 'react';
import WaterQualityAPI from '../components/WaterQualityAPI';

/**
 * WaterQualityExample Component
 * 
 * Example usage of the WaterQualityAPI component
 * Demonstrates various configuration options and callbacks
 */
const WaterQualityExample = () => {
  /**
   * Handle data updates
   */
  const handleDataUpdate = (data) => {
    console.log('Water quality data updated:', data);
  };

  /**
   * Handle errors
   */
  const handleError = (error) => {
    console.error('Water quality API error:', error);
  };

  return (
    <div className="water-quality-example">
      <h1>Water Quality API Examples</h1>
      
      {/* Basic Usage */}
      <section>
        <h2>Basic Usage</h2>
        <WaterQualityAPI
          apiEndpoint="/api/water-quality"
          onDataUpdate={handleDataUpdate}
          onError={handleError}
        />
      </section>

      {/* Advanced Configuration */}
      <section>
        <h2>Advanced Configuration</h2>
        <WaterQualityAPI
          apiEndpoint="/api/water-quality/advanced"
          refreshInterval={60000} // 1 minute
          autoRefresh={true}
          showFilters={true}
          showBatchSummaries={true}
          defaultRegion="North Coast"
          defaultDateRange={{
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
            end: new Date().toISOString().split('T')[0] // today
          }}
          onDataUpdate={handleDataUpdate}
          onError={handleError}
          className="advanced-water-quality"
        />
      </section>

      {/* Minimal Configuration */}
      <section>
        <h2>Minimal Configuration</h2>
        <WaterQualityAPI
          showFilters={false}
          showBatchSummaries={false}
          autoRefresh={false}
        />
      </section>

      {/* Custom Styling */}
      <section>
        <h2>Custom Styling</h2>
        <div style={{ 
          background: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '12px',
          border: '2px solid #0ea5e9'
        }}>
          <WaterQualityAPI
            className="custom-styled"
            defaultRegion="Mountain Region"
          />
        </div>
      </section>

      {/* Integration Example */}
      <section>
        <h2>Integration with Dashboard</h2>
        <div className="dashboard-integration">
          <div className="dashboard-header">
            <h3>Environmental Monitoring Dashboard</h3>
            <p>Real-time water quality monitoring across all regions</p>
          </div>
          
          <WaterQualityAPI
            apiEndpoint="/api/dashboard/water-quality"
            refreshInterval={30000} // 30 seconds
            showFilters={true}
            showBatchSummaries={true}
            onDataUpdate={(data) => {
              console.log('Dashboard data update:', data);
              // Update dashboard metrics, send alerts, etc.
            }}
            onError={(error) => {
              console.error('Dashboard error:', error);
              // Show error notification, fallback to cached data, etc.
            }}
          />
        </div>
      </section>

      {/* API Response Schema Documentation */}
      <section>
        <h2>API Response Schema</h2>
        <div className="schema-documentation">
          <h3>Expected API Response Format:</h3>
          <pre style={{ 
            background: '#f3f4f6', 
            padding: '16px', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
{`{
  "success": true,
  "data": [
    {
      "timestamp": "2024-10-27T22:42:36.000Z",
      "region": "North Coast",
      "sensor_id": "NOR-WQ-001",
      "temperature": 22.5,
      "pH": 7.8,
      "turbidity": 1.2,
      "region_avg_quality_index": 85.3,
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "sensor_status": "normal",
      "data_quality": "good"
    }
  ],
  "metadata": {
    "total_records": 1800,
    "regions": 5,
    "sensors": 15,
    "date_range": {
      "start": "2024-09-27T22:42:36.000Z",
      "end": "2024-10-27T22:42:36.000Z"
    },
    "last_updated": "2024-10-27T22:42:36.000Z"
  }
}`}
          </pre>
        </div>
      </section>

      {/* Query Parameters Documentation */}
      <section>
        <h2>Supported Query Parameters</h2>
        <div className="query-params-documentation">
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Parameter</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>region</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>string</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>Filter by region name</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>North Coast</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>start_date</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>string</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>Start date (YYYY-MM-DD)</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>2024-10-01</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>end_date</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>string</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>End date (YYYY-MM-DD)</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>2024-10-27</td>
              </tr>
              <tr>
                <td style={{ padding: '12px' }}>sensor_id</td>
                <td style={{ padding: '12px' }}>string</td>
                <td style={{ padding: '12px' }}>Filter by specific sensor</td>
                <td style={{ padding: '12px' }}>NOR-WQ-001</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default WaterQualityExample;
