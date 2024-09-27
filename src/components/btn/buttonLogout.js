// LogoutButton.js
import React from 'react';
import { handleLogout } from '../../firebaseConfig';

const LogoutButton = () => {
  const logoutUser = async () => {
    try {
      await handleLogout();
      // Optionally, you can redirect to the login page or home page after logging out
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button onClick={logoutUser} style={{ padding: '10px', backgroundColor: '#ff6666', color: '#fff', border: 'none', cursor: 'pointer' }}>
      Logout
    </button>
  );
};

export default LogoutButton;
