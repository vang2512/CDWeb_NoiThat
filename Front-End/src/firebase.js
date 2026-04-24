import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider  } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvTPihOM7Xnk_L_86w1K5DGSpbd6i1mdA",
  authDomain: "svmarket-a1e96.firebaseapp.com",
  projectId: "svmarket-a1e96",
  storageBucket: "svmarket-a1e96.firebasestorage.app",
  messagingSenderId: "576477187670",
  appId: "1:576477187670:web:2e040e0d427d817b0835f7",
  measurementId: "G-KRXJHTLWB9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();