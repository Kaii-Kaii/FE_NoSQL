// Lightweight Firebase initializer for Google Sign-In
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

let app = null
let auth = null

const firebaseConfig = {
  apiKey: "AIzaSyAvD8Zy1JJZXsQR-pWke8bHFhljJ7-aqJs",
  authDomain: "nosql-e372c.firebaseapp.com",
  projectId: "nosql-e372c",
  storageBucket: "nosql-e372c.firebasestorage.app",
  messagingSenderId: "1011947821595",
  appId: "1:1011947821595:web:2ca4a4f866cd2c63f676be",
  measurementId: "G-1NZD69VQJ2"
}

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }
  return { app, auth }
}

export async function signInWithGooglePopup() {
  const { auth } = initFirebase()
  const provider = new GoogleAuthProvider()
  // Request ID token (default) and basic profile
  const result = await signInWithPopup(auth, provider)
  // result.user contains user info; get ID token
  const idToken = await result.user.getIdToken()
  return { idToken, user: result.user }
}
