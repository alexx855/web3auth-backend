import { GoogleAuthProvider,getAuth,signInWithPopup, UserCredential } from "firebase/auth";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const app = initializeApp({
  apiKey: "AIzaSyA5t0BJhQdveTaRhSOGRoeUGniv6-2E_kQ",
  authDomain: "axie-sniper-fee00.firebaseapp.com",
  projectId: "axie-sniper-fee00",
  storageBucket: "axie-sniper-fee00.appspot.com",
  messagingSenderId: "179412520385",
  appId: "1:179412520385:web:8d9d7e2b9649af4ed8f340",
  measurementId: "G-V0PCE4VQYT"
});
const auth = getAuth(app);

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const googleProvider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, googleProvider);
    console.log(res);
    return res;
  } catch (err) {
    console.error(err);
    throw err
  }
};