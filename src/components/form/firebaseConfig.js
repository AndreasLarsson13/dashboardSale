// firebaseConfig.js (Frontend)
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBI3aLeT6tdlkAtW8KpYzfXbWs69q8KwX8",
  authDomain: "natbutiken.firebaseapp.com",
  projectId: "natbutiken",
  storageBucket: "natbutiken.appspot.com",
  messagingSenderId: "334938276028",
  appId: "1:334938276028:web:576a33c0a9280a215b90b9"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
