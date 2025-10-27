import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerFeedbackExample from './examples/CustomerFeedbackExample';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import './App.css';

/**
 * Main App component demonstrating the Customer Feedback Widget integration
 */
function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleFeedbackUpdate = (feedbackData) => {
    console.log('App received feedback update:', feedbackData);
    // Here you could update global state, show notifications, etc.
  };

  const handleSalesUpdate = (salesData) => {
    console.log('App received sales data update:', salesData);
    // Here you could update global state, show notifications, etc.
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-container">
          <h1 className="app-title">AguaFlow Dashboard</h1>
          <div className="nav-buttons">
            <button
              className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-button ${currentView === 'examples' ? 'active' : ''}`}
              onClick={() => setCurrentView('examples')}
            >
              Examples
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'dashboard' ? (
          <Dashboard
            feedbackApiEndpoint="/api/feedback"
            salesApiEndpoint="/api/sales/performance"
            onFeedbackUpdate={handleFeedbackUpdate}
            onSalesUpdate={handleSalesUpdate}
            showFeedbackWidget={true}
            showSalesAnalytics={true}
            refreshInterval={300000} // 5 minutes
            salesRefreshInterval={60000} // 60 seconds
            className="main-dashboard"
          />
        ) : (
          <CustomerFeedbackExample />
        )}
      </main>
    </div>
  );
}

export default App;
