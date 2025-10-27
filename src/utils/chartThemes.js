/**
 * Chart theme utilities for Recharts integration with dark mode
 */

// Get CSS custom property value
const getCSSVariable = (variable) => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Light theme chart configuration
export const lightChartTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  grid: {
    stroke: '#e2e8f0',
    strokeDasharray: '3 3',
    opacity: 0.3
  },
  axis: {
    stroke: '#64748b',
    fontSize: 12,
    tick: { fill: '#64748b' }
  },
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    color: '#1e293b'
  },
  background: '#ffffff'
};

// Dark theme chart configuration
export const darkChartTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#34d399',
    tertiary: '#fbbf24',
    quaternary: '#a78bfa',
    success: '#22c55e',
    warning: '#eab308',
    error: '#f87171',
    info: '#60a5fa'
  },
  grid: {
    stroke: '#374151',
    strokeDasharray: '3 3',
    opacity: 0.3
  },
  axis: {
    stroke: '#9ca3af',
    fontSize: 12,
    tick: { fill: '#9ca3af' }
  },
  tooltip: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    color: '#f8fafc'
  },
  background: '#1f2937'
};

// Get current theme configuration
export const getCurrentChartTheme = (isDark = false) => {
  return isDark ? darkChartTheme : lightChartTheme;
};

// Get dynamic theme configuration using CSS variables
export const getDynamicChartTheme = () => {
  return {
    colors: {
      primary: getCSSVariable('--color-chart-primary') || '#2563eb',
      secondary: getCSSVariable('--color-chart-secondary') || '#10b981',
      tertiary: getCSSVariable('--color-chart-tertiary') || '#f59e0b',
      quaternary: getCSSVariable('--color-chart-quaternary') || '#8b5cf6',
      success: getCSSVariable('--color-success') || '#10b981',
      warning: getCSSVariable('--color-warning') || '#f59e0b',
      error: getCSSVariable('--color-error') || '#ef4444',
      info: getCSSVariable('--color-info') || '#3b82f6'
    },
    grid: {
      stroke: getCSSVariable('--color-chart-grid') || '#e2e8f0',
      strokeDasharray: '3 3',
      opacity: 0.3
    },
    axis: {
      stroke: getCSSVariable('--color-chart-text') || '#64748b',
      fontSize: 12,
      tick: { fill: getCSSVariable('--color-chart-text') || '#64748b' }
    },
    tooltip: {
      backgroundColor: getCSSVariable('--color-bg-card') || '#ffffff',
      border: `1px solid ${getCSSVariable('--color-border-primary') || '#e2e8f0'}`,
      borderRadius: getCSSVariable('--radius-md') || '6px',
      boxShadow: getCSSVariable('--shadow-lg') || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      color: getCSSVariable('--color-text-primary') || '#1e293b'
    },
    background: getCSSVariable('--color-chart-bg') || '#ffffff'
  };
};

// Color palette for multiple data series
export const getChartColorPalette = (isDark = false) => {
  const theme = getCurrentChartTheme(isDark);
  return [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.tertiary,
    theme.colors.quaternary,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
    theme.colors.info
  ];
};

// Get dynamic color palette using CSS variables
export const getDynamicColorPalette = () => {
  return [
    getCSSVariable('--color-chart-primary') || '#2563eb',
    getCSSVariable('--color-chart-secondary') || '#10b981',
    getCSSVariable('--color-chart-tertiary') || '#f59e0b',
    getCSSVariable('--color-chart-quaternary') || '#8b5cf6',
    getCSSVariable('--color-success') || '#10b981',
    getCSSVariable('--color-warning') || '#f59e0b',
    getCSSVariable('--color-error') || '#ef4444',
    getCSSVariable('--color-info') || '#3b82f6'
  ];
};

// Utility function to create theme-aware chart props
export const getChartProps = (isDark = false) => {
  const theme = getCurrentChartTheme(isDark);
  
  return {
    cartesianGrid: {
      stroke: theme.grid.stroke,
      strokeDasharray: theme.grid.strokeDasharray,
      opacity: theme.grid.opacity
    },
    xAxis: {
      stroke: theme.axis.stroke,
      fontSize: theme.axis.fontSize,
      tick: theme.axis.tick
    },
    yAxis: {
      stroke: theme.axis.stroke,
      fontSize: theme.axis.fontSize,
      tick: theme.axis.tick
    },
    tooltip: {
      contentStyle: {
        backgroundColor: theme.tooltip.backgroundColor,
        border: theme.tooltip.border,
        borderRadius: theme.tooltip.borderRadius,
        boxShadow: theme.tooltip.boxShadow,
        color: theme.tooltip.color
      }
    }
  };
};

// Utility function to create dynamic theme-aware chart props
export const getDynamicChartProps = () => {
  const theme = getDynamicChartTheme();
  
  return {
    cartesianGrid: {
      stroke: theme.grid.stroke,
      strokeDasharray: theme.grid.strokeDasharray,
      opacity: theme.grid.opacity
    },
    xAxis: {
      stroke: theme.axis.stroke,
      fontSize: theme.axis.fontSize,
      tick: theme.axis.tick
    },
    yAxis: {
      stroke: theme.axis.stroke,
      fontSize: theme.axis.fontSize,
      tick: theme.axis.tick
    },
    tooltip: {
      contentStyle: {
        backgroundColor: theme.tooltip.backgroundColor,
        border: theme.tooltip.border,
        borderRadius: theme.tooltip.borderRadius,
        boxShadow: theme.tooltip.boxShadow,
        color: theme.tooltip.color
      }
    }
  };
};
