import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5wRPP391kOLAosnhc0wWTDn1EgVy03zw",
  authDomain: "clickfrauddashboard.firebaseapp.com",
  projectId: "clickfrauddashboard",
  storageBucket: "clickfrauddashboard.firebasestorage.app",
  messagingSenderId: "145645586634",
  appId: "1:145645586634:web:1b1a8aae91a4a06fdbcc33",
  measurementId: "G-ZNJLKY2DJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
