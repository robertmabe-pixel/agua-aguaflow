import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import WaterUsageWidget from './components/WaterUsageWidget';
import ThemeToggle from './components/ThemeToggle';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <header className="container" style={{ 
          padding: '2rem 1rem',
          borderBottom: '1px solid var(--color-border-primary)',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                🌊 AguaFlow Portal
              </h1>
              <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                Water Quality Monitoring Dashboard
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="container">
          <div style={{ 
            display: 'grid', 
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
          }}>
            <WaterUsageWidget />
          </div>
        </main>
        
        <footer className="container" style={{ 
          marginTop: '4rem',
          padding: '2rem 1rem',
          borderTop: '1px solid var(--color-border-primary)',
          textAlign: 'center'
        }}>
          <p className="text-tertiary text-sm">
            © 2024 Agua Inc. - Environmental Monitoring Solutions
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
