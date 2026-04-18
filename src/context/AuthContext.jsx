import { useState } from 'react';
import { clearStoredAuth, getStoredAuth, storeAuth } from '../api/client.js';
import { AuthContext } from './AuthContextObject.js';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  function login(authData) {
    storeAuth(authData);
    setAuth(authData);
  }

  function logout() {
    clearStoredAuth();
    setAuth(null);
  }

  const value = {
    auth,
    user: auth,
    isAuthenticated: Boolean(auth?.token),
    isBootstrapping: false,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
