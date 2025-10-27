// Lightweight Firebase initializer for Google Sign-In
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'

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

// Create user with email/password via Firebase and return idToken + user
export async function createUserWithEmail(email, password, displayName) {
  const { auth } = initFirebase()
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    try {
      await updateProfile(userCredential.user, { displayName })
    } catch (e) {
      // non-fatal
      console.warn('updateProfile failed', e)
    }
  }
  const idToken = await userCredential.user.getIdToken()
  return { idToken, user: userCredential.user }
}

export async function sendVerificationEmail(user) {
  const { auth } = initFirebase()
  // user can be a firebase user object; ensure current auth user is set
  try {
    await sendEmailVerification(user)
    return true
  } catch (e) {
    console.error('sendVerificationEmail failed', e)
    return false
  }
}

export async function signInWithEmail(email, password) {
  const { auth } = initFirebase()
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const idToken = await cred.user.getIdToken()
  return { idToken, user: cred.user }
}
