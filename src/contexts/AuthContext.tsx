"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchUserProfile,
  getAccessToken,
  getAuthUser,
  logout as authLogout,
  type AuthUser,
} from "@/services/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    const userData = await fetchUserProfile();
    setUser(userData ?? getAuthUser());
  }, []);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      const token = getAccessToken();
      if (token) {
        const cached = getAuthUser();
        if (cached) setUser(cached);
        const userData = await fetchUserProfile();
        setUser(userData ?? cached);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const handleLogout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
