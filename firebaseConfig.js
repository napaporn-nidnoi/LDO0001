/**
 * Learning Development Office (LDO) - Firebase Integration Config
 * Tech Spec: Designed for the Firebase Spark Plan (Strictly FREE Tier)
 * Authored by Google AI Studio Build Coding Agent
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these placeholders with actual values from your Firebase Project Console.
// For security under the Firebase Spark Plan, keep keys secret or secure through rules.
const firebaseConfig = {
  apiKey: "AIzaSyCopyActualKeyFromFirebaseConsoleHere",
  authDomain: "ldo-submission-system.firebaseapp.com",
  projectId: "ldo-submission-system",
  storageBucket: "ldo-submission-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234efgh5678"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize & Export Core Auth/DB Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Custom Domain Constraint Rule (Helper check for university suffix e.g. @university.ac.th)
export const isInstitutionalEmail = (email) => {
  if (!email) return false;
  return email.endsWith('@university.ac.th');
};

export default app;
