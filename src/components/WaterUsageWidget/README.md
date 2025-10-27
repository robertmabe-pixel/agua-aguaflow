# WaterUsageWidget Component

A comprehensive React component for water quality monitoring and usage visualization with full dark mode support.

## Features

- **Real-time Data Visualization**: Interactive charts showing water usage trends using Recharts
- **Dark Mode Support**: Automatic theme detection and manual override with localStorage persistence
- **Statistics Dashboard**: Key metrics including total, average, peak, and minimum usage
- **Daily Usage Patterns**: Bar chart showing usage patterns over time
- **Auto-refresh**: Configurable refresh intervals for live data updates
- **Error Handling**: Robust error states with retry functionality
- **Responsive Design**: Mobile-friendly layout with adaptive styling
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Customizable**: Extensive configuration options for styling and behavior

## Installation

```bash
npm install recharts prop-types
```

## Basic Usage

```jsx
import React from 'react';
import WaterUsageWidget from './components/WaterUsageWidget';

function App() {
  return (
    <div className="App">
      <WaterUsageWidget />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Water Usage Monitor"` | Widget title displayed in header |
| `refreshInterval` | `number` | `30000` | Auto-refresh interval in milliseconds. Set to `null` to disable |
| `apiEndpoint` | `string` | `null` | API endpoint URL. Uses mock data if not provided |
| `showDailyAverage` | `boolean` | `true` | Show/hide daily usage pattern chart |
| `showStatistics` | `boolean` | `true` | Show/hide statistics section |
| `height` | `number` | `400` | Height of the main chart in pixels |
| `onError` | `function` | `null` | Error callback function `(error) => void` |
| `className` | `string` | `""` | Additional CSS classes |

## API Data Format

If using a custom API endpoint, the data should be returned in the following format:

```json
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
]
```

### Required Fields

- `time`: Display time string (e.g., "10:00", "2:30 PM")
- `usage`: Water usage value in liters per minute
- `timestamp`: Unix timestamp for sorting and processing

## Examples

### Basic Widget

```jsx
<WaterUsageWidget />
```

### Custom Configuration

```jsx
<WaterUsageWidget
  title="Industrial Water Monitor"
  height={300}
  refreshInterval={60000}
  showStatistics={false}
  onError={(error) => console.error('Widget error:', error)}
/>
```

### API Integration

```jsx
<WaterUsageWidget
  title="Live Water Monitor"
  apiEndpoint="https://api.yourcompany.com/water-usage"
  refreshInterval={15000}
  onError={(error) => {
    // Handle error (show notification, log to analytics, etc.)
    console.error('API Error:', error);
  }}
/>
```

### Minimal Configuration

```jsx
<WaterUsageWidget
  title="Quick Monitor"
  height={250}
  showDailyAverage={false}
  refreshInterval={null} // Disable auto-refresh
/>
```

### Multiple Widgets Dashboard

```jsx
<div style={{ 
  display: 'grid', 
  gap: '2rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
}}>
  <WaterUsageWidget
    title="Building A - Main Supply"
    refreshInterval={15000}
  />
  <WaterUsageWidget
    title="Building B - Secondary"
    refreshInterval={15000}
    showDailyAverage={false}
  />
  <WaterUsageWidget
    title="Emergency Reserve"
    refreshInterval={30000}
    showStatistics={false}
  />
</div>
```

## Dark Mode Integration

The widget automatically integrates with the theme system:

```jsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <WaterUsageWidget />
    </ThemeProvider>
  );
}
```

### Theme Features

- ✅ Automatic system preference detection
- ✅ Manual theme override with localStorage persistence  
- ✅ Smooth transitions between themes
- ✅ Chart colors adapt to theme
- ✅ WCAG compliant color contrast
- ✅ Responsive design in both themes

## Styling

The component uses CSS custom properties for theming. You can override these in your CSS:

```css
.water-usage-widget {
  --color-primary: #your-color;
  --color-bg-card: #your-bg-color;
  /* ... other custom properties */
}
```

### Available CSS Custom Properties

- `--color-bg-card`: Widget background color
- `--color-text-primary`: Primary text color
- `--color-border-primary`: Border color
- `--color-chart-primary`: Primary chart color
- `--color-chart-grid`: Chart grid color
- `--color-chart-text`: Chart text color
- `--color-chart-bg`: Chart background color

## Accessibility

The component follows WCAG 2.1 guidelines:

- Proper ARIA labels and roles
- Keyboard navigation support
- High contrast mode support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Error Handling

The widget provides comprehensive error handling:

```jsx
<WaterUsageWidget
  onError={(error) => {
    // Log error
    console.error('Water usage widget error:', error);
    
    // Show user notification
    showNotification('Failed to load water usage data', 'error');
    
    // Send to analytics
    analytics.track('widget_error', { error: error.message });
  }}
/>
```

### Error States

- Network errors (API unavailable)
- Invalid data format
- Timeout errors
- CORS issues

## Performance

- Optimized re-renders with React.memo and useCallback
- Efficient chart updates with Recharts
- Configurable refresh intervals
- Lazy loading of chart components
- Memory leak prevention with proper cleanup

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

The component includes comprehensive tests:

```bash
npm test -- WaterUsageWidget
```

Test coverage includes:
- Component rendering
- Theme switching
- API integration
- Error handling
- User interactions
- Accessibility

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test in both light and dark themes

## License

MIT License - see LICENSE file for details.
