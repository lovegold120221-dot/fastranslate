import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnq_o0Ik6fg8rnf6zUiH-ATaZrH-EKJgw",
  authDomain: "orbit-f7599.firebaseapp.com",
  databaseURL:
    "https://orbit-f7599-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "orbit-f7599",
  storageBucket: "orbit-f7599.firebasestorage.app",
  messagingSenderId: "160417717410",
  appId: "1:160417717410:web:f6e7521410d2a01c580bfb",
  measurementId: "G-V864R9ERYP",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
