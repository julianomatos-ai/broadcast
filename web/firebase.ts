// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByZX4P1UDJR2t8fETsfcXSQFOhO2HIhyo",
  authDomain: "broadcast-b17ee.firebaseapp.com",
  projectId: "broadcast-b17ee",
  storageBucket: "broadcast-b17ee.firebasestorage.app",
  messagingSenderId: "304052130318",
  appId: "1:304052130318:web:dcfb2ce7ffc7c9ca84225f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);