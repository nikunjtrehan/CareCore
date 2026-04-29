// src/lib/firebase.js
// Firebase is initialized lazily — landing page works even without .env.local
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const CONFIGURED =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  !String(import.meta.env.VITE_FIREBASE_API_KEY).includes('PASTE');

// ── Lazy singleton ───────────────────────────────────────────────────────────
let _auth = null;
let _db   = null;

export function getFirebase() {
  if (!CONFIGURED) {
    throw new Error(
      '[CareCore] Firebase is not configured.\n' +
      'Create frontend/.env.local from .env.local.example and fill in your Firebase credentials.\n' +
      'See the FIREBASE_SETUP guide.'
    );
  }
  if (!_auth) {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        });
    _auth = getAuth(app);
    _db   = getFirestore(app);
  }
  return { auth: _auth, db: _db };
}

// Export getters so callers always get the live instance
export const getFirebaseAuth = () => getFirebase().auth;
export const getFirebaseDb   = () => getFirebase().db;

// ── Auth helpers ─────────────────────────────────────────────────────────────

export async function signUp({ email, password, displayName, role, extraData = {} }) {
  const { auth, db } = getFirebase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Send verification email — logs error if it fails
  try {
    await sendEmailVerification(cred.user);
    console.log('[CareCore] Verification email sent to:', email);
  } catch (verifyErr) {
    console.warn('[CareCore] sendEmailVerification failed:', verifyErr.code, verifyErr.message);
  }
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    displayName,
    email,
    role,
    createdAt: new Date().toISOString(),
    ...extraData,
  });
  return cred.user;
}

export async function signIn({ email, password }) {
  const { auth, db } = getFirebase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  return { user: cred.user, role: snap.exists() ? snap.data().role : null };
}

// Google Sign-In — role is asked before calling this
export async function signInWithGoogle({ role }) {
  const { auth, db } = getFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;
  // Check if user already has a Firestore profile
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    return { user, role: snap.data().role };
  }
  // First Google login — save with selected role
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: user.displayName || 'Google User',
    email: user.email,
    role,
    createdAt: new Date().toISOString(),
  });
  return { user, role };
}

export const logOut = () => signOut(getFirebase().auth);

export async function fetchUserRole(uid) {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data().role : null;
}

// onAuthStateChanged needs the auth instance — return no-op if not configured
export function onAuthStateChangedSafe(callback) {
  if (!CONFIGURED) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(getFirebase().auth, callback);
}

export { CONFIGURED as isFirebaseConfigured };
