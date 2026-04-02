import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider  } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVKkZb9h2INbtFhaBw6l6idXso333W0uA",
  authDomain: "appcake-2ffae.firebaseapp.com",
  projectId: "appcake-2ffae",
  appId: "1:450111373680:web:2474d4ebbb4b87e57f0fb5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();