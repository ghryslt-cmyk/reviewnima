import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthChange, signInWithGoogle, logoutUser, isAdmin, auth } from '../lib/firebase';

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
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
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
      setUser(auth.currentUser);
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
