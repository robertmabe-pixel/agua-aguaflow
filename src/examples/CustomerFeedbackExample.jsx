import React, { useState } from 'react';
import CustomerFeedbackWidget from '../components/CustomerFeedbackWidget';
import Dashboard from '../components/Dashboard';

/**
 * CustomerFeedbackExample - Comprehensive examples of CustomerFeedbackWidget usage
 * 
 * This file demonstrates various configurations and use cases for the
 * CustomerFeedbackWidget component in different scenarios.
 */

const CustomerFeedbackExample = () => {
  const [notifications, setNotifications] = useState([]);

  // Handle feedback submission for notifications
  const handleFeedbackSubmitted = (feedbackData) => {
    const notification = {
      id: Date.now(),
      message: `New ${feedbackData.rating}-star feedback received!`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
  };

  // Handle dashboard feedback updates
  const handleDashboardFeedback = (feedbackData) => {
    console.log('Dashboard feedback update:', feedbackData);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Customer Feedback Widget Examples</h1>
      
      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px'
        }}>
          <h3>Recent Feedback Notifications</h3>
          {notifications.map(notification => (
            <div key={notification.id} style={{
              padding: '8px 0',
              borderBottom: '1px solid #e0f2fe'
            }}>
              <strong>{notification.message}</strong>
              <span style={{ color: '#6b7280', marginLeft: '12px' }}>
                {notification.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Example 1: Basic Usage */}
      <section style={{ marginBottom: '48px' }}>
        <h2>1. Basic Usage</h2>
        <p>Simple feedback widget with default settings:</p>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          background: '#f9fafb'
        }}>
          <CustomerFeedbackWidget />
        </div>
      </section>

      {/* Example 2: Custom Configuration */}
      <section style={{ marginBottom: '48px' }}>
        <h2>2. Custom Configuration</h2>
        <p>Widget with custom API endpoint, shorter comment limit, and callback:</p>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          background: '#f9fafb'
        }}>
          <CustomerFeedbackWidget
            apiEndpoint="/api/v1/feedback"
            maxCommentLength={200}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            refreshInterval={30000} // 30 seconds for demo
            className="custom-feedback-widget"
          />
        </div>
      </section>

      {/* Example 3: Without Aggregated Data */}
      <section style={{ marginBottom: '48px' }}>
        <h2>3. Feedback Form Only</h2>
        <p>Widget without aggregated sentiment display:</p>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          background: '#f9fafb'
        }}>
          <CustomerFeedbackWidget
            showAggregatedData={false}
            maxCommentLength={300}
          />
        </div>
      </section>

      {/* Example 4: Compact Version */}
      <section style={{ marginBottom: '48px' }}>
        <h2>4. Compact Version</h2>
        <p>Smaller widget with minimal comment length:</p>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          background: '#f9fafb',
          maxWidth: '400px'
        }}>
          <CustomerFeedbackWidget
            maxCommentLength={100}
            showAggregatedData={false}
            className="compact-widget"
          />
        </div>
      </section>

      {/* Example 5: Dashboard Integration */}
      <section style={{ marginBottom: '48px' }}>
        <h2>5. Dashboard Integration</h2>
        <p>Full dashboard with integrated feedback widget:</p>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Dashboard
            feedbackApiEndpoint="/api/feedback"
            onFeedbackUpdate={handleDashboardFeedback}
            refreshInterval={60000}
            className="example-dashboard"
          />
        </div>
      </section>

      {/* Example 6: Multiple Widgets */}
      <section style={{ marginBottom: '48px' }}>
        <h2>6. Multiple Feedback Contexts</h2>
        <p>Different widgets for different services:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            background: '#f0fdf4'
          }}>
            <h3>Water Quality Service</h3>
            <CustomerFeedbackWidget
              apiEndpoint="/api/feedback/water-quality"
              showAggregatedData={true}
              maxCommentLength={250}
            />
          </div>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            background: '#fef2f2'
          }}>
            <h3>Customer Support</h3>
            <CustomerFeedbackWidget
              apiEndpoint="/api/feedback/support"
              showAggregatedData={true}
              maxCommentLength={400}
            />
          </div>
        </div>
      </section>

      {/* Example 7: Custom Styling */}
      <section style={{ marginBottom: '48px' }}>
        <h2>7. Custom Styling</h2>
        <p>Widget with custom CSS styling:</p>
        <div style={{
          border: '2px solid #3b82f6',
          borderRadius: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <CustomerFeedbackWidget
            className="premium-feedback-widget"
            maxCommentLength={500}
          />
        </div>
      </section>

      {/* Code Examples */}
      <section style={{ marginBottom: '48px' }}>
        <h2>8. Code Examples</h2>
        
        <h3>Basic Implementation</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`import CustomerFeedbackWidget from './components/CustomerFeedbackWidget';

function App() {
  return (
    <CustomerFeedbackWidget />
  );
}`}
        </pre>

        <h3>Advanced Configuration</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`import CustomerFeedbackWidget from './components/CustomerFeedbackWidget';

function Dashboard() {
  const handleFeedback = (data) => {
    console.log('Feedback received:', data);
  };

  return (
    <CustomerFeedbackWidget
      apiEndpoint="/api/v1/feedback"
      maxCommentLength={1000}
      onFeedbackSubmitted={handleFeedback}
      showAggregatedData={true}
      autoRefresh={true}
      refreshInterval={60000}
      className="my-feedback-widget"
    />
  );
}`}
        </pre>

        <h3>Dashboard Integration</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`import Dashboard from './components/Dashboard';

function App() {
  return (
    <Dashboard
      feedbackApiEndpoint="/api/feedback"
      showFeedbackWidget={true}
      refreshInterval={300000}
      onFeedbackUpdate={(data) => console.log(data)}
    />
  );
}`}
        </pre>
      </section>

      {/* API Documentation */}
      <section style={{ marginBottom: '48px' }}>
        <h2>9. API Integration Guide</h2>
        
        <h3>Required Endpoints</h3>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4>POST /api/feedback</h4>
          <p>Submit new feedback</p>
          <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '12px', borderRadius: '4px' }}>
{`{
  "rating": 4,
  "comment": "Great service!",
  "timestamp": "2025-10-27T19:57:56.000Z"
}`}
          </pre>

          <h4>GET /api/feedback/aggregated</h4>
          <p>Retrieve aggregated feedback statistics</p>
          <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '12px', borderRadius: '4px' }}>
{`{
  "totalFeedbacks": 150,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 5, "2": 10, "3": 25, "4": 60, "5": 50
  }
}`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p>
          For more information, see the{' '}
          <a href="#" style={{ color: '#3b82f6' }}>
            CustomerFeedbackWidget documentation
          </a>
        </p>
      </footer>
    </div>
  );
};

export default CustomerFeedbackExample;
