import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { db, supabase } from '@/api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loadUser = useCallback(async (session) => {
    if (!session) {
      setUser(null);
      setAuthError(null);
    } else {
      try {
        setUser(await db.auth.me());
        setAuthError(null);
      } catch (error) {
        // A session that cannot resolve a profile is treated as signed out rather than as a
        // fatal error, so a backend hiccup never takes the public site down with it.
        console.error('Could not load the signed-in user:', error);
        setUser(null);
        setAuthError({ type: 'auth_required', message: error.message });
      }
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => loadUser(data.session));
    return db.auth.onChange(loadUser);
  }, [loadUser]);

  const checkUserAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await loadUser(data.session);
  }, [loadUser]);

  const logout = () => {
    setUser(null);
    db.auth.logout('/');
  };

  const navigateToLogin = () => db.auth.redirectToLogin(window.location.pathname);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      authChecked,
      authError,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
