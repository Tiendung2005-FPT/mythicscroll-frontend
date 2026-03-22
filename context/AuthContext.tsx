import React, { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../services/storage';
import { getProfile, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await storage.getItem('userToken');
        if (token) {
          const profile = await getProfile();
          setUser(profile);
        }
      } catch (err) {
        console.log('Failed to load user or token is invalid', err);
        await storage.deleteItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (token: string, userData: User) => {
    await storage.setItem('userToken', token);
    setUser(userData);
  };

  const signOut = async () => {
    await storage.deleteItem('userToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
