import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import './WaterUsageWidget.css';

// Mock data generator for demonstration
const generateMockData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate realistic water usage patterns
    let usage;
    if (hour >= 6 && hour <= 9) {
      usage = Math.random() * 15 + 10; // Morning peak
    } else if (hour >= 17 && hour <= 21) {
      usage = Math.random() * 12 + 8; // Evening peak
    } else if (hour >= 22 || hour <= 5) {
      usage = Math.random() * 3 + 1; // Night low
    } else {
      usage = Math.random() * 8 + 3; // Day moderate
    }
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      usage: Math.round(usage * 10) / 10,
      timestamp: time.getTime()
    });
  }
  
  return data;
};

const WaterUsageWidget = ({
  title = "Water Usage Monitor",
  refreshInterval = 30000,
  apiEndpoint = null,
  showDailyAverage = true,
  showStatistics = true,
  height = 400,
  onError = null,
  className = ''
}) => {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    average: 0,
    peak: 0,
    minimum: 0
  });

  // Calculate statistics from data
  const calculateStatistics = useCallback((usageData) => {
    if (!usageData || usageData.length === 0) {
      return { total: 0, average: 0, peak: 0, minimum: 0 };
    }

    const values = usageData.map(item => item.usage);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const peak = Math.max(...values);
    const minimum = Math.min(...values);

    return {
      total: Math.round(total * 10) / 10,
      average: Math.round(average * 10) / 10,
      peak: Math.round(peak * 10) / 10,
      minimum: Math.round(minimum * 10) / 10
    };
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let newData;
      if (apiEndpoint) {
        // Fetch from API
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        newData = await response.json();
      } else {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        newData = generateMockData();
      }

      setData(newData);
      setStatistics(calculateStatistics(newData));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, calculateStatistics, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Theme-aware chart colors
  const getChartTheme = () => {
    if (isDark) {
      return {
        lineColor: 'var(--color-chart-primary)',
        gridColor: 'var(--color-chart-grid)',
        textColor: 'var(--color-chart-text)',
        backgroundColor: 'var(--color-chart-bg)',
        tooltipBg: 'var(--color-bg-card)',
        tooltipBorder: 'var(--color-border-primary)'
      };
    }
    
    return {
      lineColor: 'var(--color-chart-primary)',
      gridColor: 'var(--color-chart-grid)',
      textColor: 'var(--color-chart-text)',
      backgroundColor: 'var(--color-chart-bg)',
      tooltipBg: 'var(--color-bg-card)',
      tooltipBorder: 'var(--color-border-primary)'
    };
  };

  const chartTheme = getChartTheme();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="water-usage-tooltip"
          style={{
            backgroundColor: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Time: {label}
          </p>
          <p className="text-sm" style={{ color: chartTheme.lineColor }}>
            Usage: {payload[0].value} L/min
          </p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className={`water-usage-widget error ${className}`}>
        <div className="water-usage-header">
          <h3 className="water-usage-title">{title}</h3>
        </div>
        <div className="water-usage-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h4>Unable to load water usage data</h4>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`water-usage-widget ${className}`}>
      <div className="water-usage-header">
        <div className="header-content">
          <h3 className="water-usage-title">{title}</h3>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button 
          className="refresh-button"
          onClick={fetchData}
          disabled={loading}
          aria-label="Refresh data"
          title="Refresh water usage data"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>
            🔄
          </span>
        </button>
      </div>

      {showStatistics && (
        <div className="water-usage-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{statistics.total} L</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">{statistics.average} L/min</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Peak</span>
            <span className="stat-value">{statistics.peak} L/min</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Minimum</span>
            <span className="stat-value">{statistics.minimum} L/min</span>
          </div>
        </div>
      )}

      <div className="water-usage-chart-container">
        {loading && data.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading water usage data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartTheme.gridColor}
                opacity={0.3}
              />
              <XAxis 
                dataKey="time" 
                stroke={chartTheme.textColor}
                fontSize={12}
                tick={{ fill: chartTheme.textColor }}
              />
              <YAxis 
                stroke={chartTheme.textColor}
                fontSize={12}
                tick={{ fill: chartTheme.textColor }}
                label={{ 
                  value: 'Usage (L/min)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: chartTheme.textColor }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke={chartTheme.lineColor}
                strokeWidth={2}
                dot={{ fill: chartTheme.lineColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartTheme.lineColor, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {showDailyAverage && (
        <div className="daily-average-section">
          <h4 className="section-title">Daily Usage Pattern</h4>
          <div className="daily-average-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data.slice(-12)} // Show last 12 hours
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartTheme.gridColor}
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="time" 
                  stroke={chartTheme.textColor}
                  fontSize={11}
                  tick={{ fill: chartTheme.textColor }}
                />
                <YAxis 
                  stroke={chartTheme.textColor}
                  fontSize={11}
                  tick={{ fill: chartTheme.textColor }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="usage" 
                  fill={chartTheme.lineColor}
                  opacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

WaterUsageWidget.propTypes = {
  title: PropTypes.string,
  refreshInterval: PropTypes.number,
  apiEndpoint: PropTypes.string,
  showDailyAverage: PropTypes.bool,
  showStatistics: PropTypes.bool,
  height: PropTypes.number,
  onError: PropTypes.func,
  className: PropTypes.string
};

export default WaterUsageWidget;
