import React from 'react';
import ReactDOM from 'react-dom/client';
import TradingChart from './components/TradingChart/TradingChart';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#121212',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#fff' }}>Trading Chart</h1>
      <TradingChart />
    </div>
  </React.StrictMode>
);
