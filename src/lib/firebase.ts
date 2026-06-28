import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOCmVCwG6BwOqwaJeSz-d5ejTz9kTCeag",
  authDomain: "dsaverse-5bc5a.firebaseapp.com",
  projectId: "dsaverse-5bc5a",
  storageBucket: "dsaverse-5bc5a.firebasestorage.app",
  messagingSenderId: "488506989223",
  appId: "1:488506989223:web:436d8c9356631feec01982"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
