import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBaOXRdHpqWulr0TGHD-VlG3KxE4H6Tv9Y",
  authDomain: "quanlylophoc-36427.firebaseapp.com",
  projectId: "quanlylophoc-36427",
  storageBucket: "quanlylophoc-36427.firebasestorage.app",
  messagingSenderId: "170867172273",
  appId: "1:170867172273:web:6fe89dd967d3fd89699390"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutFirebaseUser() {
  return signOut(auth);
}
