# InventoryTracker Component

A real-time inventory tracking component that displays inventory data by category with color-coded thresholds and automatic refresh capabilities.

## Features

- **Real-time Data**: Fetches data from `/api/inventory/real-time` endpoint
- **Color-coded Thresholds**: Visual indicators for low, medium, and high stock levels
- **Auto-refresh**: Configurable refresh interval (default: 10 seconds)
- **Manual Refresh**: Manual refresh button with loading states
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Graceful error states with retry functionality
- **Accessibility**: Screen reader friendly with proper ARIA labels

## Usage

### Basic Usage

```jsx
import InventoryTracker from './components/InventoryTracker';

function App() {
  return (
    <InventoryTracker />
  );
}
```

### Advanced Usage

```jsx
import InventoryTracker from './components/InventoryTracker';

function Dashboard() {
  const handleInventoryUpdate = (inventoryData) => {
    console.log('Inventory updated:', inventoryData);
  };

  return (
    <InventoryTracker
      apiEndpoint="/api/inventory/real-time"
      refreshInterval={10000}
      thresholds={{ low: 5, medium: 25 }}
      onInventoryUpdate={handleInventoryUpdate}
      className="custom-inventory-tracker"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/inventory/real-time'` | API endpoint for inventory data |
| `refreshInterval` | `number` | `10000` | Auto-refresh interval in milliseconds (0 to disable) |
| `className` | `string` | `''` | Additional CSS classes |
| `onInventoryUpdate` | `function` | `null` | Callback function called when inventory is updated |
| `thresholds` | `object` | `{ low: 10, medium: 50 }` | Stock level thresholds |

### Thresholds Object

```javascript
{
  low: 10,    // Items with quantity ≤ 10 are considered low stock
  medium: 50  // Items with quantity 11-50 are medium stock, >50 are high stock
}
```

## API Data Format

The component expects the API to return data in the following format:

```javascript
[
  {
    id: 1,
    category: "Water Filters",
    items: [
      {
        id: 101,
        name: "Carbon Filter - Standard",
        quantity: 45,
        unit: "units",
        sku: "CF-STD-001"
      },
      // ... more items
    ]
  },
  // ... more categories
]
```

## Stock Level Classification

Items are automatically classified into three stock levels based on quantity:

- **Low Stock** (Red): quantity ≤ `thresholds.low`
- **Medium Stock** (Yellow): `thresholds.low` < quantity ≤ `thresholds.medium`
- **High Stock** (Green): quantity > `thresholds.medium`

## Styling

The component uses CSS modules with the following main classes:

- `.inventory-tracker` - Main container
- `.inventory-header` - Header with title and controls
- `.inventory-legend` - Color-coded legend
- `.inventory-categories` - Categories container
- `.inventory-category` - Individual category
- `.inventory-item` - Individual inventory item
- `.status-indicator` - Color-coded status dots

### Color Scheme

- **High Stock**: Green (`#10b981`)
- **Medium Stock**: Yellow (`#f59e0b`)
- **Low Stock**: Red (`#ef4444`)

## States

### Loading State
Displays a spinner and "Loading inventory data..." message during initial load.

### Error State
Shows error message with retry button when data fetching fails.

### Refreshing State
Shows refreshing indicator during auto-refresh or manual refresh.

## Accessibility

- Proper semantic HTML structure
- ARIA labels for interactive elements
- Screen reader announcements for loading states
- Keyboard navigation support
- High contrast color scheme

## Performance

- Automatic cleanup of intervals on component unmount
- Optimized re-renders using `useCallback`
- Efficient state management
- Minimal DOM updates during refreshes

## Testing

The component includes comprehensive tests covering:

- Rendering states (loading, error, success)
- Stock level classification
- Auto-refresh functionality
- Manual refresh
- Error handling
- Callbacks
- Responsive design
- Accessibility
- Performance

Run tests with:

```bash
npm test InventoryTracker.test.jsx
```

## Integration with Dashboard

The InventoryTracker is designed to integrate seamlessly with the Dashboard component:

```jsx
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Dashboard
      showInventoryTracker={true}
      inventoryApiEndpoint="/api/inventory/real-time"
      inventoryRefreshInterval={10000}
      onInventoryUpdate={(data) => console.log('Inventory updated:', data)}
    />
  );
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- React 18+
- PropTypes 15.8+

## License

MIT License - see LICENSE file for details.
