import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2te5ieLstpP4PBMLTjkorBtBSniOZCeo",
  authDomain: "turormatch.firebaseapp.com",
  projectId: "turormatch",
  storageBucket: "turormatch.firebasestorage.app",
  messagingSenderId: "686986254202",
  appId: "1:686986254202:web:26cf1c5b42d109827b28c3",
  measurementId: "G-K816KZ7DGQ"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);