import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitchRole: (targetRole: UserRole) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  Admin: { email: 'admin@smartfactory.io', pass: 'FactoryAdmin2026!' },
  Manager: { email: 'manager@smartfactory.io', pass: 'FactoryMgr2026!' },
  Supervisor: { email: 'supervisor@smartfactory.io', pass: 'FactorySup2026!' },
  Employee: { email: 'operator@smartfactory.io', pass: 'Operator2026!' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        setPermissions(data.permissions || []);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setPermissions([]);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        // Refresh me to get fresh permissions
        const meData = await api.get('/auth/me');
        setPermissions(meData.permissions || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      removeAuthToken();
      setUser(null);
      setPermissions([]);
    }
  };

  const quickSwitchRole = async (targetRole: UserRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return permissions.includes(perm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickSwitchRole,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
