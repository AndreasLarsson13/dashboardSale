// Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig'; // Your Firebase auth config
import LogoutBtn from './btn/buttonLogout';

const Sidebar = () => {
  const [user, loading] = useAuthState(auth); // Fetch the current user
  const [isAdmin, setIsAdmin] = useState(false); // Manage if the user is admin

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(); // Fetch the user's ID token
          if (idTokenResult.claims.admin) {
            setIsAdmin(true); // If user is admin, set isAdmin to true
          } else {
            setIsAdmin(false); // If not admin, set isAdmin to false
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminRole();
  }, [user]); // Run this effect whenever the user state changes

  if (loading) {
    return <p>Loading...</p>; // Show a loading message until user state is determined
  }

  return (
    <nav
      style={{
        width: '250px',
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '55px' }}>
        <li style={{ display: 'flex', gap: '17px', flexDirection: 'column' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Alla produkter</Link>
          <Link to="/add-product" style={{ color: 'white', textDecoration: 'none' }}>Lägg till produkt</Link>
        </li>
        
        <li style={{ display: 'flex', gap: '17px', flexDirection: 'column' }}>
          <Link to="/list-brand" style={{ color: 'white', textDecoration: 'none' }}>Alla varumärken</Link>
          <Link to="/add-brand" style={{ color: 'white', textDecoration: 'none' }}>Lägg till varumärken</Link>
        </li>

        <li style={{ display: 'flex', gap: '17px', flexDirection: 'column' }}>
          <Link to="/list-option" style={{ color: 'white', textDecoration: 'none' }}>Alla tillbehör</Link>
          <Link to="/add-option" style={{ color: 'white', textDecoration: 'none' }}>Lägg till tillbehör</Link>
        </li>

        {/* Conditionally render the Admin link based on isAdmin state */}
        {isAdmin && (
          <li>
            <Link to="/review-products" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
          </li>
        )}

        <li>
          <LogoutBtn />
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
