// Layout.js
import React from 'react';
import Sidebar from './components/sidebar'; // Sidebar component

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', Height: '100vh' }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {children} {/* This will render the main content */}
      </main>
    </div>
  );
};

export default Layout;
