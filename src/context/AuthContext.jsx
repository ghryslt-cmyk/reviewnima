import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthChange, signInWithGoogle, logoutUser, isAdmin, auth, doc, getDoc, setDoc, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      // Create user document in Firestore if it doesn't exist and sync data
      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: authUser.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              createdAt: new Date().toISOString()
            });
            setUser(authUser);
          } else {
            // Sync Firestore data with auth user
            const firestoreData = userDoc.data();
            // Create a merged user object with Firestore data taking precedence
            const mergedUser = {
              ...authUser,
              displayName: firestoreData.displayName || authUser.displayName,
              photoURL: firestoreData.photoURL || authUser.photoURL
            };
            setUser(mergedUser);
          }
        } catch (error) {
          console.error('Error creating/syncing user document:', error);
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const checkAdmin = useCallback(() => {
    return isAdmin(user);
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          const mergedUser = {
            ...auth.currentUser,
            displayName: firestoreData.displayName || auth.currentUser.displayName,
            photoURL: firestoreData.photoURL || auth.currentUser.photoURL
          };
          setUser(mergedUser);
        } else {
          setUser(auth.currentUser);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        setUser(auth.currentUser);
      }
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    checkAdmin,
    refreshUser,
    isAuthenticated: !!user
  }), [user, loading, login, logout, checkAdmin, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
