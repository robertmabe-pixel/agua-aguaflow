# AguaFlow Frontend Components

A comprehensive React component library for water quality monitoring and usage visualization. Built for environmental monitoring and water management applications.

## 🌊 Features

### WaterUsageWidget Component
- **Real-time Data Visualization**: Interactive charts showing water usage trends
- **Daily Averages**: Displays daily usage patterns with statistical analysis
- **Auto-refresh**: Configurable refresh intervals for live data updates
- **Statistics Dashboard**: Key metrics including total, average, peak, and minimum usage
- **Error Handling**: Robust error states with retry functionality
- **Responsive Design**: Mobile-friendly layout with adaptive styling
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Dark Mode Support**: Automatic dark mode detection and styling
- **Customizable**: Extensive configuration options for styling and behavior

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/robertmabe-pixel/agua-aguaflow.git
cd agua-aguaflow

# Install dependencies
npm install

# Start development server
npm start
```

## 🚀 Quick Start

### Basic Usage

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

export default App;
```

### Advanced Configuration

```jsx
import React from 'react';
import WaterUsageWidget from './components/WaterUsageWidget';

function Dashboard() {
  const chartConfig = {
    strokeWidth: 3,
    strokeColor: '#0066cc',
    gridColor: '#f0f0f0'
  };

  return (
    <WaterUsageWidget
      apiEndpoint="/api/v1/water-usage"
      refreshInterval={60000} // 1 minute
      daysToShow={14}
      className="dashboard-widget"
      chartConfig={chartConfig}
    />
  );
}
```

## 📊 Component Props

### WaterUsageWidget

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/water-usage'` | API endpoint URL for fetching data |
| `refreshInterval` | `number` | `300000` | Auto-refresh interval in milliseconds |
| `daysToShow` | `number` | `7` | Number of days to display |
| `className` | `string` | `''` | Additional CSS classes |
| `chartConfig` | `object` | `{}` | Chart styling configuration |

## 🔌 API Integration

The component expects the API to return data in this format:

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-26T00:00:00.000Z",
      "dailyUsage": 150.5,
      "dailyAverage": 145.2
    },
    {
      "date": "2025-10-27T00:00:00.000Z", 
      "dailyUsage": 162.3,
      "dailyAverage": 148.7
    }
  ]
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The component includes comprehensive tests covering:
- ✅ Component rendering and props
- ✅ Data fetching and API integration
- ✅ Error handling and retry functionality
- ✅ User interactions (refresh, retry)
- ✅ Statistics calculations
- ✅ Chart rendering
- ✅ Auto-refresh functionality
- ✅ Accessibility features

## 🎨 Styling

### CSS Classes

```css
.water-usage-widget          /* Main container */
.widget-header              /* Header section */
.usage-statistics           /* Statistics grid */
.chart-container            /* Chart wrapper */
.chart-legend              /* Legend section */
```

### Custom Styling Example

```css
.my-custom-widget {
  border: 2px solid #0066cc;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.my-custom-widget .widget-header h3 {
  color: #0066cc;
  font-size: 1.75rem;
}
```

## 📱 Responsive Design

The component is fully responsive and adapts to different screen sizes:

- **Desktop**: Full-featured layout with all statistics
- **Tablet**: Optimized grid layout for medium screens
- **Mobile**: Stacked layout with touch-friendly interactions

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Supports high contrast mode
- **Focus Management**: Clear focus indicators

## 🌙 Dark Mode

Automatic dark mode detection and styling:

```css
@media (prefers-color-scheme: dark) {
  .water-usage-widget {
    background: #1f2937;
    color: #f9fafb;
  }
}
```

## 📈 Performance

- **Memoized Calculations**: Statistics calculated using `useMemo`
- **Efficient Re-renders**: Only re-renders when necessary
- **Lazy Loading**: Chart components loaded only when needed
- **Debounced Refresh**: Prevents excessive API calls

## 🔧 Development

### Project Structure

```
src/
├── components/
│   └── WaterUsageWidget/
│       ├── WaterUsageWidget.jsx
│       ├── WaterUsageWidget.css
│       ├── __tests__/
│       │   └── WaterUsageWidget.test.jsx
│       ├── index.js
│       └── README.md
├── examples/
│   └── WaterUsageWidgetExample.jsx
└── setupTests.js
```

### Available Scripts

```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

## 🚨 Troubleshooting

### Common Issues

1. **Chart Not Rendering**
   - Ensure `recharts` is installed: `npm install recharts`
   - Check browser console for errors

2. **API Connection Issues**
   - Verify API endpoint is accessible
   - Check CORS configuration
   - Validate API response format

3. **Styling Issues**
   - Ensure CSS is imported
   - Check for CSS conflicts
   - Verify responsive breakpoints

## 📋 Examples

See `src/examples/WaterUsageWidgetExample.jsx` for comprehensive usage examples including:

- Basic usage
- Custom API endpoints
- Fast refresh configurations
- Custom styling
- Monthly views
- Compact versions

## 🗺️ Roadmap

### Planned Features
- **Real-time WebSocket Support**: Live data streaming
- **Export Functionality**: CSV/PDF export capabilities
- **Comparison Mode**: Compare usage across time periods
- **Alerts Integration**: Visual alerts for usage thresholds
- **Additional Chart Types**: Bar charts, pie charts, heatmaps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Component README files and inline comments
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Email**: frontend-support@agua.com

---

**Built with ❤️ for better water usage monitoring and environmental awareness.**

