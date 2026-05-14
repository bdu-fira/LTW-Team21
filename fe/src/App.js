import React from 'react';
import './App.css';
import AppRouter from './Routers';
import Header from './Components/Header';
import Footer from './Components/Footer';

function App() {
  return (
    <div
      className="App"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
      }}
    >
      <Header />

      <main style={{ flex: 1 }}>
        <AppRouter />
      </main>

      <Footer />
    </div>
  );
}

export default App;
