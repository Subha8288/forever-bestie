import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  email: string;
  name: string;
  role: 'owner' | 'all_access' | 'birthday_vip';
  hasAllAccess: boolean;
  loginTime: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  hasAllAccess: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bestie_bday_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [user]);

  const login = (emailInput: string, passInput: string) => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    const rawPass = passInput.trim();
    const collapsedPass = rawPass.replace(/\s+/g, ' ');

    // Match sakshi@gmail.com with password 'sakshi @123' or 'sakshi@123'
    const isEmailValid = trimmedEmail === 'sakshi@gmail.com';
    const isPassValid =
      rawPass === 'sakshi @123' ||
      rawPass === 'sakshi@123' ||
      collapsedPass === 'sakshi @123';

    if (isEmailValid && isPassValid) {
      const authUser: AuthUser = {
        email: 'sakshi@gmail.com',
        name: 'Sakshi',
        role: 'all_access',
        hasAllAccess: true,
        loginTime: Date.now(),
      };
      setUser(authUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Incorrect email or password. Please check your credentials and try again.',
    };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasAllAccess: !!user?.hasAllAccess,
        login,
        logout,
      }}
    >
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
