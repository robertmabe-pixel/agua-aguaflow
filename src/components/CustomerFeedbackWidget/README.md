# CustomerFeedbackWidget

A comprehensive React component for collecting and displaying customer feedback with a 1-5 star rating system and comments section.

## 🌟 Features

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

## 📦 Installation

```bash
npm install react prop-types
```

## 🚀 Basic Usage

```jsx
import React from 'react';
import CustomerFeedbackWidget from './components/CustomerFeedbackWidget';

function App() {
  return (
    <div className="App">
      <CustomerFeedbackWidget />
    </div>
  );
}

export default App;
```

## 🔧 Advanced Configuration

```jsx
import React from 'react';
import CustomerFeedbackWidget from './components/CustomerFeedbackWidget';

function Dashboard() {
  const handleFeedbackSubmitted = (feedbackData) => {
    console.log('New feedback received:', feedbackData);
    // Handle feedback submission (e.g., show notification, update UI)
  };

  return (
    <CustomerFeedbackWidget
      apiEndpoint="/api/v1/feedback"
      maxCommentLength={1000}
      onFeedbackSubmitted={handleFeedbackSubmitted}
      showAggregatedData={true}
      autoRefresh={true}
      refreshInterval={60000} // 1 minute
      className="my-feedback-widget"
    />
  );
}
```

## 📊 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/feedback'` | API endpoint for feedback operations |
| `maxCommentLength` | `number` | `500` | Maximum character limit for comments |
| `className` | `string` | `''` | Additional CSS classes |
| `onFeedbackSubmitted` | `function` | `null` | Callback function called after successful submission |
| `showAggregatedData` | `boolean` | `true` | Whether to display aggregated sentiment data |
| `refreshInterval` | `number` | `300000` | Auto-refresh interval in milliseconds (5 minutes) |
| `autoRefresh` | `boolean` | `true` | Whether to enable auto-refresh functionality |

## 🔌 API Integration

The component expects your API to handle two endpoints:

### POST `/api/feedback`
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

### GET `/api/feedback/aggregated`
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

## 🎨 Styling

### CSS Classes

The component uses the following CSS classes that you can customize:

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

### Custom Styling Example

```css
.my-feedback-widget {
  border: 2px solid #3b82f6;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.my-feedback-widget .star.active {
  color: #f59e0b;
  transform: scale(1.2);
}

.my-feedback-widget .submit-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}
```

## 🧪 Testing

The component includes comprehensive tests covering:

- ✅ Component rendering and props
- ✅ Star rating functionality
- ✅ Comment input and validation
- ✅ Form submission and error handling
- ✅ API integration
- ✅ Auto-refresh functionality
- ✅ Accessibility features
- ✅ Loading and error states

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The component maintains high test coverage:
- **Statements**: 95%+
- **Branches**: 90%+
- **Functions**: 95%+
- **Lines**: 95%+

## ♿ Accessibility

The component is fully accessible and includes:

- **WCAG 2.1 AA Compliance**: Meets accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast Support**: Compatible with high contrast mode
- **Semantic HTML**: Uses proper semantic elements

### Accessibility Features

```jsx
// Star rating with proper ARIA labels
<div className="star-rating" role="radiogroup" aria-label="Rating">
  <button aria-label="Rate 1 star">★</button>
  <button aria-label="Rate 2 stars">★</button>
  {/* ... */}
</div>

// Form with proper labels and descriptions
<textarea
  id="feedback-comment"
  aria-describedby="comment-counter"
  aria-label="Additional Comments (Optional)"
/>

// Success/error messages with alert role
<div className="success-message" role="alert">
  ✓ Thank you for your feedback!
</div>
```

## 📱 Responsive Design

The component is fully responsive and adapts to different screen sizes:

- **Desktop (1024px+)**: Full-featured layout with side-by-side elements
- **Tablet (768px-1023px)**: Optimized grid layout
- **Mobile (< 768px)**: Stacked layout with touch-friendly interactions

### Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 1024px) {
  .customer-feedback-widget {
    padding: 20px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .star {
    font-size: 1.75rem;
  }
  
  .submit-button {
    width: 100%;
  }
}
```

## 🌙 Dark Mode

The component automatically detects and supports dark mode:

```css
@media (prefers-color-scheme: dark) {
  .customer-feedback-widget {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .star.active {
    color: #fbbf24;
  }
}
```

## 🔄 State Management

The component manages the following internal state:

- `rating`: Currently selected star rating (0-5)
- `hoverRating`: Star rating being hovered (0-5)
- `comment`: Comment text content
- `isSubmitting`: Form submission loading state
- `submitSuccess`: Success message display state
- `error`: Error message content
- `aggregatedData`: Fetched sentiment data
- `isLoadingData`: Data loading state

## 🚨 Error Handling

The component handles various error scenarios:

- **Network Errors**: API connection failures
- **Validation Errors**: Missing required fields
- **Server Errors**: HTTP error responses
- **Timeout Errors**: Request timeout handling

### Error States

```jsx
// Validation error
if (rating === 0) {
  setError('Please select a rating');
  return;
}

// Network error
catch (err) {
  setError('Failed to submit feedback. Please try again.');
}
```

## 📈 Performance

The component is optimized for performance:

- **Memoized Calculations**: Sentiment data calculated using `useMemo`
- **Efficient Re-renders**: Only re-renders when necessary
- **Debounced API Calls**: Prevents excessive API requests
- **Cleanup on Unmount**: Proper cleanup of intervals and timeouts

## 🔧 Development

### Project Structure

```
src/components/CustomerFeedbackWidget/
├── CustomerFeedbackWidget.jsx    # Main component
├── CustomerFeedbackWidget.css    # Styles
├── index.js                      # Export file
├── __tests__/
│   └── CustomerFeedbackWidget.test.jsx  # Tests
└── README.md                     # Documentation
```

### Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

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

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: This README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Email**: support@aguaflow.com

---

**Built with ❤️ for better customer feedback collection and user experience.**
