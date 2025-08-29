'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppleUser {
  name?: {
    firstName: string;
    lastName: string;
  };
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AppleUser | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => void;
  refreshAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  const refreshAuthState = () => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('apple_auth');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          // 检查 token 是否过期（24小时）
          const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
          
          if (!isExpired) {
            setAuthState({
              isAuthenticated: true,
              user: parsed.user,
              token: parsed.token
            });
          } else {
            localStorage.removeItem('apple_auth');
          }
        } catch (error) {
          console.error('Error parsing stored auth:', error);
          localStorage.removeItem('apple_auth');
        }
      }
    }
  };

  const signOut = () => {
    localStorage.removeItem('apple_auth');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    signOut,
    refreshAuthState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};