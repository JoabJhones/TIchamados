
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
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
const db = getFirestore(app);

export { app, db };
