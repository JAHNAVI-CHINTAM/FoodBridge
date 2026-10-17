import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'food_bridge_user';
const TOKEN_STORAGE_KEY = 'food_bridge_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('donor');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed: Profile = JSON.parse(stored);
        setUser(parsed);
        setActiveRole(parsed.active_role || 'donor');
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, expectedRole?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password, expectedRole });
      setUser(res.profile);
      setActiveRole(res.profile.active_role);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.profile));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.profile);
      setActiveRole(res.profile.active_role);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.profile));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const switchRole = async (targetRole: UserRole) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.switchRole(targetRole);
      const updatedUser = { ...user, active_role: res.activeRole };
      setUser(updatedUser);
      setActiveRole(res.activeRole);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = await api.updateProfile(updates);
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
  };

  // Convenient helper for instant demo evaluation
  const quickLoginAs = async (role: UserRole) => {
    if (role === 'donor') {
      await login('rajesh@grandpalace.com', 'password123', 'donor');
    } else {
      await login('anand@hopefoundation.org', 'password123', 'receiver');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
        quickLoginAs,
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
