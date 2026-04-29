// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUserRole, logOut, onAuthStateChangedSafe, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't configured, skip auth entirely — app still renders
    const unsub = onAuthStateChangedSafe(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const r = await fetchUserRole(firebaseUser.uid);
          setRole(r);
        } catch {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogOut = async () => {
    try { await logOut(); } catch { /* ignore */ }
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logOut: handleLogOut, isConfigured: isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
