import React, { useState } from 'react';
import WaterUsageWidget from '../components/WaterUsageWidget';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Comprehensive examples of WaterUsageWidget usage
 * This file demonstrates various configurations and use cases
 */

const WaterUsageWidgetExample = () => {
  const { theme, isDark } = useTheme();
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Example error handler
  const handleError = (error) => {
    console.error('Water usage widget error:', error);
    // You could show a toast notification, log to analytics, etc.
  };

  return (
    <div style={{ 
      padding: '2rem',
      backgroundColor: 'var(--color-bg-primary)',
      minHeight: '100vh'
    }}>
      <div className="container">
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="text-3xl font-bold text-primary">
            WaterUsageWidget Examples
          </h1>
          <p className="text-secondary" style={{ marginTop: '1rem' }}>
            Comprehensive examples showing different configurations and use cases
          </p>
          <p className="text-sm text-tertiary" style={{ marginTop: '0.5rem' }}>
            Current theme: <strong>{theme}</strong> mode
          </p>
        </header>

        {/* Basic Usage Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            1. Basic Usage
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Default configuration with all features enabled and mock data.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
          }}>
            <WaterUsageWidget />
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary className="text-sm font-medium text-secondary" style={{ cursor: 'pointer' }}>
              View Code
            </summary>
            <pre style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
{`import WaterUsageWidget from './components/WaterUsageWidget';

function App() {
  return (
    <WaterUsageWidget />
  );
}`}
            </pre>
          </details>
        </section>

        {/* Custom Configuration Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            2. Custom Configuration
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Customized title, height, and refresh interval with statistics disabled.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
          }}>
            <WaterUsageWidget
              title="Industrial Water Monitor"
              height={300}
              refreshInterval={60000}
              showStatistics={false}
              onError={handleError}
            />
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary className="text-sm font-medium text-secondary" style={{ cursor: 'pointer' }}>
              View Code
            </summary>
            <pre style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
{`<WaterUsageWidget
  title="Industrial Water Monitor"
  height={300}
  refreshInterval={60000}
  showStatistics={false}
  onError={handleError}
/>`}
            </pre>
          </details>
        </section>

        {/* Minimal Configuration Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            3. Minimal Configuration
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Compact widget with daily average disabled and reduced height.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
          }}>
            <WaterUsageWidget
              title="Quick Monitor"
              height={250}
              showDailyAverage={false}
              refreshInterval={null} // Disable auto-refresh
            />
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary className="text-sm font-medium text-secondary" style={{ cursor: 'pointer' }}>
              View Code
            </summary>
            <pre style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
{`<WaterUsageWidget
  title="Quick Monitor"
  height={250}
  showDailyAverage={false}
  refreshInterval={null} // Disable auto-refresh
/>`}
            </pre>
          </details>
        </section>

        {/* Multiple Widgets Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            4. Multiple Widgets Dashboard
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Multiple widgets with different configurations for a comprehensive dashboard.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
          }}>
            <WaterUsageWidget
              title="Building A - Main Supply"
              height={300}
              refreshInterval={15000}
            />
            <WaterUsageWidget
              title="Building B - Secondary"
              height={300}
              refreshInterval={15000}
              showDailyAverage={false}
            />
            <WaterUsageWidget
              title="Emergency Reserve"
              height={300}
              refreshInterval={30000}
              showStatistics={false}
            />
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary className="text-sm font-medium text-secondary" style={{ cursor: 'pointer' }}>
              View Code
            </summary>
            <pre style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
{`<div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
  <WaterUsageWidget
    title="Building A - Main Supply"
    height={300}
    refreshInterval={15000}
  />
  <WaterUsageWidget
    title="Building B - Secondary"
    height={300}
    refreshInterval={15000}
    showDailyAverage={false}
  />
  <WaterUsageWidget
    title="Emergency Reserve"
    height={300}
    refreshInterval={30000}
    showStatistics={false}
  />
</div>`}
            </pre>
          </details>
        </section>

        {/* Interactive Configuration Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            5. Interactive Configuration
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Try different configurations with the controls below.
          </p>

          <div style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem'
          }}>
            <h3 className="text-lg font-medium text-primary" style={{ marginBottom: '1rem' }}>
              Configuration Controls
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
            }}>
              <div>
                <label className="text-sm font-medium text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Custom API Endpoint (optional)
                </label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://api.example.com/water-usage"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Refresh Interval (ms)
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={0}>No auto-refresh</option>
                  <option value={5000}>5 seconds</option>
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
          }}>
            <WaterUsageWidget
              title="Interactive Configuration Demo"
              apiEndpoint={customEndpoint || null}
              refreshInterval={refreshInterval || null}
              onError={handleError}
            />
          </div>
        </section>

        {/* Theme Demonstration */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            6. Dark Mode Integration
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            The widget automatically adapts to your theme preference. 
            Use the theme toggle in the header to see the difference!
          </p>
          
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
          }}>
            <WaterUsageWidget
              title={`${isDark ? 'Dark' : 'Light'} Mode Demo`}
              height={350}
            />
          </div>

          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }}>
            <p className="text-secondary">
              <strong>Theme Features:</strong>
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li className="text-secondary">✅ Automatic system preference detection</li>
              <li className="text-secondary">✅ Manual theme override with localStorage persistence</li>
              <li className="text-secondary">✅ Smooth transitions between themes</li>
              <li className="text-secondary">✅ Chart colors adapt to theme</li>
              <li className="text-secondary">✅ WCAG compliant color contrast</li>
            </ul>
          </div>
        </section>

        {/* API Integration Example */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 className="text-2xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
            7. API Integration
          </h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Example of how to integrate with a real API endpoint.
          </p>

          <details>
            <summary className="text-sm font-medium text-secondary" style={{ cursor: 'pointer', marginBottom: '1rem' }}>
              View API Integration Code
            </summary>
            <pre style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
{`// Example API endpoint that returns water usage data
// Expected format:
[
  {
    "time": "10:00",
    "usage": 12.5,
    "timestamp": 1640995200000
  },
  {
    "time": "11:00", 
    "usage": 8.3,
    "timestamp": 1640998800000
  }
  // ... more data points
]

// Usage with API
<WaterUsageWidget
  title="Live Water Monitor"
  apiEndpoint="https://api.yourcompany.com/water-usage"
  refreshInterval={30000}
  onError={(error) => {
    console.error('API Error:', error);
    // Handle error (show notification, fallback, etc.)
  }}
/>`}
            </pre>
          </details>
        </section>

        <footer style={{ 
          marginTop: '4rem',
          padding: '2rem',
          borderTop: '1px solid var(--color-border-primary)',
          textAlign: 'center'
        }}>
          <p className="text-tertiary text-sm">
            For more information, see the component documentation and README.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WaterUsageWidgetExample;
