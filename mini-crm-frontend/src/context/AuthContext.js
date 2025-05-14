import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../config/firebase';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await auth.signInWithPopup(googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message || "Failed to sign in with Google");
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message || "Failed to sign out");
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setError(error.message || "Authentication error");
        setLoading(false);
      });
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setError(error.message || "Failed to initialize authentication");
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Context value
  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 