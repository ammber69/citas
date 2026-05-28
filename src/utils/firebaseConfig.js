// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMfMfTBdNUw-n2iTJGVrx_cD4DDpCutoI",
  authDomain: "citas-53ca1.firebaseapp.com",
  projectId: "citas-53ca1",
  storageBucket: "citas-53ca1.firebasestorage.app",
  messagingSenderId: "808675542830",
  appId: "1:808675542830:web:ed27502c5fc407d2f39cbf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
