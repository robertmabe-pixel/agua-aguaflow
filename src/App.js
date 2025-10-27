import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerFeedbackExample from './examples/CustomerFeedbackExample';
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'dashboard' ? (
          <Dashboard
            feedbackApiEndpoint="/api/feedback"
            onFeedbackUpdate={handleFeedbackUpdate}
            showFeedbackWidget={true}
            refreshInterval={300000} // 5 minutes
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
