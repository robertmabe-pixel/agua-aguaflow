# AguaFlow Frontend Components

A comprehensive React component library for water quality monitoring, usage visualization, and customer feedback collection. Built for environmental monitoring and water management applications.

## 🌊 Features

### CustomerFeedbackWidget Component ⭐ NEW
- **Interactive Star Rating**: 1-5 star rating system with hover effects
- **Comments Section**: Optional text area with character limit
- **Aggregated Sentiment Display**: Shows overall customer sentiment and statistics
- **Real-time Updates**: Auto-refresh functionality for live data
- **Form Validation**: Client-side validation with error handling
- **Loading States**: Visual feedback during API operations
- **Responsive Design**: Mobile-friendly layout
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Dark Mode Support**: Automatic dark mode detection
- **Error Handling**: Robust error states with user-friendly messages

### Dashboard Component ⭐ NEW
- **Integrated Customer Feedback**: Displays aggregated sentiment data
- **Real-time Metrics**: Live dashboard with key performance indicators
- **Responsive Layout**: Adaptive design for all screen sizes
- **Auto-refresh**: Configurable refresh intervals
- **Error Handling**: Graceful error states with retry functionality

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

### Customer Feedback Widget

```jsx
import React from 'react';
import CustomerFeedbackWidget from './components/CustomerFeedbackWidget';

function App() {
  const handleFeedbackSubmitted = (feedbackData) => {
    console.log('New feedback received:', feedbackData);
  };

  return (
    <div className="App">
      <CustomerFeedbackWidget
        apiEndpoint="/api/feedback"
        onFeedbackSubmitted={handleFeedbackSubmitted}
        showAggregatedData={true}
        maxCommentLength={500}
      />
    </div>
  );
}

export default App;
```

### Dashboard with Integrated Feedback

```jsx
import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const handleFeedbackUpdate = (feedbackData) => {
    console.log('Dashboard feedback update:', feedbackData);
  };

  return (
    <Dashboard
      feedbackApiEndpoint="/api/feedback"
      onFeedbackUpdate={handleFeedbackUpdate}
      showFeedbackWidget={true}
      refreshInterval={300000} // 5 minutes
    />
  );
}

export default App;
```

### Water Usage Widget

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

### CustomerFeedbackWidget

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/feedback'` | API endpoint for feedback operations |
| `maxCommentLength` | `number` | `500` | Maximum character limit for comments |
| `className` | `string` | `''` | Additional CSS classes |
| `onFeedbackSubmitted` | `function` | `null` | Callback function called after successful submission |
| `showAggregatedData` | `boolean` | `true` | Whether to display aggregated sentiment data |
| `refreshInterval` | `number` | `300000` | Auto-refresh interval in milliseconds (5 minutes) |
| `autoRefresh` | `boolean` | `true` | Whether to enable auto-refresh functionality |

### Dashboard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `feedbackApiEndpoint` | `string` | `'/api/feedback'` | API endpoint for feedback operations |
| `className` | `string` | `''` | Additional CSS classes |
| `showFeedbackWidget` | `boolean` | `true` | Whether to show the feedback widget |
| `refreshInterval` | `number` | `300000` | Auto-refresh interval in milliseconds |
| `onFeedbackUpdate` | `function` | `null` | Callback function called when feedback is updated |

### WaterUsageWidget

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/water-usage'` | API endpoint URL for fetching data |
| `refreshInterval` | `number` | `300000` | Auto-refresh interval in milliseconds |
| `daysToShow` | `number` | `7` | Number of days to display |
| `className` | `string` | `''` | Additional CSS classes |
| `chartConfig` | `object` | `{}` | Chart styling configuration |

## 🔌 API Integration

### Customer Feedback API

The CustomerFeedbackWidget expects your API to handle two endpoints:

#### POST `/api/feedback`
Submit new feedback

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great service!",
  "timestamp": "2025-10-27T19:57:56.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "id": "feedback_123",
  "message": "Feedback submitted successfully"
}
```

#### GET `/api/feedback/aggregated`
Retrieve aggregated feedback data

**Response:**
```json
{
  "totalFeedbacks": 150,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 5,
    "2": 10,
    "3": 25,
    "4": 60,
    "5": 50
  }
}
```

### Water Usage API

The WaterUsageWidget expects the API to return data in this format:

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

The components include comprehensive tests covering:
- ✅ Component rendering and props
- ✅ Data fetching and API integration
- ✅ Error handling and retry functionality
- ✅ User interactions (star rating, form submission, refresh, retry)
- ✅ Statistics calculations and sentiment analysis
- ✅ Chart rendering
- ✅ Auto-refresh functionality
- ✅ Accessibility features
- ✅ Form validation and error states

## 🎨 Styling

### CSS Classes

#### CustomerFeedbackWidget
```css
.customer-feedback-widget          /* Main container */
.aggregated-sentiment             /* Sentiment display section */
.sentiment-positive               /* Positive sentiment styling */
.sentiment-negative               /* Negative sentiment styling */
.sentiment-neutral                /* Neutral sentiment styling */
.feedback-form-container          /* Form wrapper */
.star-rating                      /* Star rating container */
.star                            /* Individual star button */
.star.active                     /* Active/selected star */
.comment-textarea                /* Comment text area */
.submit-button                   /* Submit button */
.success-message                 /* Success notification */
.error-message                   /* Error notification */
.loading-spinner                 /* Loading indicator */
```

#### Dashboard
```css
.dashboard                       /* Main dashboard container */
.dashboard-header               /* Dashboard header */
.dashboard-metrics              /* Metrics grid */
.metric-card                    /* Individual metric card */
.sentiment-card                 /* Customer sentiment card */
.dashboard-content              /* Main content area */
.dashboard-section              /* Content sections */
.feedback-section               /* Feedback widget section */
```

#### WaterUsageWidget
```css
.water-usage-widget          /* Main container */
.widget-header              /* Header section */
.usage-statistics           /* Statistics grid */
.chart-container            /* Chart wrapper */
.chart-legend              /* Legend section */
```

### Custom Styling Example

```css
.my-custom-feedback-widget {
  border: 2px solid #3b82f6;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.my-custom-feedback-widget .star.active {
  color: #f59e0b;
  transform: scale(1.2);
}

.my-custom-feedback-widget .submit-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}
```

## 📱 Responsive Design

All components are fully responsive and adapt to different screen sizes:

- **Desktop (1024px+)**: Full-featured layout with side-by-side elements
- **Tablet (768px-1023px)**: Optimized grid layout for medium screens
- **Mobile (< 768px)**: Stacked layout with touch-friendly interactions

## ♿ Accessibility

All components are fully accessible and include:

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast Support**: Compatible with high contrast mode
- **Semantic HTML**: Uses proper semantic elements

## 🌙 Dark Mode

All components automatically detect and support dark mode:

```css
@media (prefers-color-scheme: dark) {
  .customer-feedback-widget {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .dashboard {
    background: #111827;
  }
  
  .water-usage-widget {
    background: #1f2937;
    color: #f9fafb;
  }
}
```

## 📈 Performance

All components are optimized for performance:

- **Memoized Calculations**: Statistics and sentiment data calculated using `useMemo`
- **Efficient Re-renders**: Only re-renders when necessary
- **Lazy Loading**: Chart components loaded only when needed
- **Debounced API Calls**: Prevents excessive API requests
- **Cleanup on Unmount**: Proper cleanup of intervals and timeouts

## 🔧 Development

### Project Structure

```
src/
├── components/
│   ├── CustomerFeedbackWidget/
│   │   ├── CustomerFeedbackWidget.jsx
│   │   ├── CustomerFeedbackWidget.css
│   │   ├── __tests__/
│   │   │   └── CustomerFeedbackWidget.test.jsx
│   │   ├── index.js
│   │   └── README.md
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── __tests__/
│   │   │   └── Dashboard.test.jsx
│   │   └── index.js
│   └── WaterUsageWidget/
│       ├── WaterUsageWidget.jsx
│       ├── WaterUsageWidget.css
│       ├── __tests__/
│       │   └── WaterUsageWidget.test.jsx
│       ├── index.js
│       └── README.md
├── examples/
│   └── CustomerFeedbackExample.jsx
├── App.js
├── App.css
├── index.js
├── index.css
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

4. **Feedback Widget Not Submitting**
   - Check API endpoint configuration
   - Verify request/response format
   - Check browser network tab for errors

## 📋 Examples

See `src/examples/CustomerFeedbackExample.jsx` for comprehensive usage examples including:

- Basic feedback widget usage
- Custom API endpoints
- Dashboard integration
- Multiple feedback contexts
- Custom styling examples
- Fast refresh configurations
- Compact versions

## 🗺️ Roadmap

### Planned Features
- **Real-time WebSocket Support**: Live data streaming for both water usage and feedback
- **Export Functionality**: CSV/PDF export capabilities
- **Comparison Mode**: Compare usage across time periods
- **Alerts Integration**: Visual alerts for usage thresholds and feedback sentiment
- **Additional Chart Types**: Bar charts, pie charts, heatmaps
- **Advanced Feedback Analytics**: Sentiment trends, keyword analysis
- **Multi-language Support**: Internationalization for global deployment

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

**Built with ❤️ for better water usage monitoring, environmental awareness, and customer experience.**
