import React, { createContext, useContext, useState, useEffect } from 'react';
import { Rol, Usuario } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  role: Rol | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('sgp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sgp_token');
  });
  const [role, setRole] = useState<Rol | null>(() => {
    return (localStorage.getItem('sgp_role') as Rol) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('sgp_token');
      if (savedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          setRole(userData.rol);
          localStorage.setItem('sgp_user', JSON.stringify(userData));
          localStorage.setItem('sgp_role', userData.rol);
        } catch {
          // Si el token es inválido, limpiar
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('sgp_token', data.access_token);
    localStorage.setItem('sgp_role', data.rol);
    setToken(data.access_token);
    setRole(data.rol);

    // Obtener datos detallados del usuario
    try {
      const userData = await authService.getMe();
      const enrichedUser = {
        ...userData,
        nombre: data.nombre || userData.email.split('@')[0],
      };
      setUser(enrichedUser);
      localStorage.setItem('sgp_user', JSON.stringify(enrichedUser));
    } catch {
      const basicUser: Usuario = {
        id: 0,
        email,
        rol: data.rol,
        nombre: data.nombre || email.split('@')[0],
      };
      setUser(basicUser);
      localStorage.setItem('sgp_user', JSON.stringify(basicUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('sgp_token');
    localStorage.removeItem('sgp_user');
    localStorage.removeItem('sgp_role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser((prev) => ({ ...prev, ...userData }));
      localStorage.setItem('sgp_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
