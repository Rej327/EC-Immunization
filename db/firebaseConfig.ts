import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpEP1tGtxzB0NwoA2a64oA2l0ZYOE4cyY",
  authDomain: "catanauanvacapp.firebaseapp.com",
  projectId: "catanauanvacapp",
  storageBucket: "catanauanvacapp.appspot.com",
  messagingSenderId: "493652147789",
  appId: "1:493652147789:web:c3938e5252385625a56604",
  measurementId: "G-QCJHVHMS6H",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
