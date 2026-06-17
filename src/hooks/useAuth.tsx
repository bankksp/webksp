'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import * as dataService from '../services/dataService';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  imageUrl?: string;
  status?: string;
  idCard?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email?: string, idCard?: string, password?: string }) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  forgotPassword: (idCard: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMe();
  }, []);

  const checkMe = async () => {
    try {
      const currentUser = dataService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email?: string, idCard?: string, password?: string }) => {
    setLoading(true);
    try {
      const result = await dataService.login(credentials);
      if (result.success) {
        setUser(result.user);
        toast.success('เข้าสู่ระบบสำเร็จ');
        return true;
      }
      return false;
    } catch (error: any) {
      // Error is already toasted in dataService
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const result = await dataService.register(data);
      if (result.success) {
        if (result.user) {
          setUser(result.user);
          toast.success('สมัครสมาชิกสำเร็จ');
        } else if (result.pending) {
          toast.success('สมัครสมาชิกสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติการเข้าใช้งาน');
        }
        return true;
      }
      return false;
    } catch (error: any) {
      // Error is already toasted in dataService
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (idCard: string) => {
    setLoading(true);
    try {
      await dataService.forgotPassword(idCard);
    } catch (error: any) {
      // Error is already toasted in dataService
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      dataService.logout();
      setUser(null);
      toast.success('ออกจากระบบแล้ว');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
