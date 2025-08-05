import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBI3aLeT6tdlkAtW8KpYzfXbWs69q8KwX8",
  authDomain: "natbutiken.firebaseapp.com",
  projectId: "natbutiken",
  storageBucket: "natbutiken.appspot.com",
  messagingSenderId: "334938276028",
  appId: "1:334938276028:web:576a33c0a9280a215b90b9"
};

const app = initializeApp(firebaseConfig);

// 🔹 Lägg till dessa:
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🔹 Redan existerande:
export const auth = getAuth(app);

// 🔹 Din logout-funktion
export const handleLogout = () => {
  return signOut(auth)
    .then(() => {
      console.log('User logged out successfully');
    })
    .catch((error) => {
      console.error('Error logging out: ', error);
    });
};
