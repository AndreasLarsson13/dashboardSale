import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBI3aLeT6tdlkAtW8KpYzfXbWs69q8KwX8",
    authDomain: "natbutiken.firebaseapp.com",
    projectId: "natbutiken",
    storageBucket: "natbutiken.appspot.com",
    messagingSenderId: "334938276028",
    appId: "1:334938276028:web:576a33c0a9280a215b90b9"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Function to handle sign out
export const handleLogout = () => {
    return signOut(auth)
      .then(() => {
        console.log('User logged out successfully');
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };