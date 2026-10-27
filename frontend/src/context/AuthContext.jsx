import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

function readStored() {
  try {
    return {
      token: localStorage.getItem('cb_token'),
      user: JSON.parse(localStorage.getItem('cb_user') || 'null'),
    };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStored);

  const persist = ({ token, user }) => {
    localStorage.setItem('cb_token', token);
    localStorage.setItem('cb_user', JSON.stringify(user));
    setAuth({ token, user });
  };

  const login = async (email, password) =>
    persist(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (name, email, password) =>
    persist(await api('/auth/register', { method: 'POST', body: { name, email, password } }));

  const logout = () => {
    localStorage.removeItem('cb_token');
    localStorage.removeItem('cb_user');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
