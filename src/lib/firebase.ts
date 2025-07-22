// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKUI5MYue9jrvhKgh7eR7zFjViBJ7y0MA",
  authDomain: "chamados-d29c0.firebaseapp.com",
  projectId: "chamados-d29c0",
  storageBucket: "chamados-d29c0.firebasestorage.app",
  messagingSenderId: "537629044959",
  appId: "1:537629044959:web:683452ac892310e9bdf96a",
  measurementId: "G-V54EWJQM9S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
