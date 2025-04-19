'use client';
// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for User
interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

// Define types for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Define types for registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Define types for authentication response
interface AuthResponse {
  success: boolean;
  error?: string;
}

// Define types for UserContext
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context with undefined as default
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Simulate loading user from localStorage or session
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        // In a real app, you would check the session or token
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedInUser();
  }, []);
  
  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      const userData: User = {
        id: '123456',
        name: 'Demo User',
        email: credentials.email,
        // Other user data
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };
  
  // Register function
  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        // Other user data
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  };
  
  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  // Provide context value
  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook for using the context
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}