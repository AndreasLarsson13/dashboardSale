import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig'; // Din Firebase-auth config

const AdminRoute = ({ element }) => {
  const [user, loading] = useAuthState(auth); // Hämtar den aktuella användaren
  const [isAdmin, setIsAdmin] = useState(false); // Hanterar om användaren är admin eller inte
  const [checkingAdmin, setCheckingAdmin] = useState(true); // Hanterar laddningsstatus för admin-kontroll

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(); // Vänta på resultatet
          if (idTokenResult.claims.admin) {
            setIsAdmin(true); // Om admin, sätt isAdmin till true
          } else {
            setIsAdmin(false); // Om inte admin, sätt isAdmin till false
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      setCheckingAdmin(false); // Admin-kontrollen är klar
    };

    checkAdminRole();
  }, [user]);

  if (loading || checkingAdmin) {
    return <p>Loading...</p>; // Visa laddning tills admin-kontrollen är klar
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" />; // Om användaren inte är admin eller inte inloggad
  }

  return element; // Visa den skyddade admin-sidan om allt är OK
};

export default AdminRoute;
