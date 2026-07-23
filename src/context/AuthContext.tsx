"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  decodeToken,
  getTokenFromDocumentCookie,
  isTokenExpired,
  setTokenCookie,
  clearTokenCookie,
} from "@/lib/auth-token";
import {
  loginRequest,
  registerRequest,
  toFrontendRole,
  type RegisterPayload,
  type BackendRole,
} from "@/lib/api";

interface AuthUser {
  id: number;
  role: BackendRole;
  displayRole: "Candidate" | "Recruiter" | "Admin";
  fullName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{ message: string; userId: number }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Syncing from document.cookie, an external browser API unavailable during
    // SSR — this can only run after mount, so setState-in-effect is correct here.
    const token = getTokenFromDocumentCookie();
    const payload = token ? decodeToken(token) : null;

    if (payload && !isTokenExpired(payload)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({
        id: payload.id,
        role: payload.role,
        displayRole: toFrontendRole(payload.role),
        fullName: null,
      });
    } else if (token) {
      clearTokenCookie();
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, role, full_name } = await loginRequest(email, password);
    setTokenCookie(token);

    const payload = decodeToken(token);
    const authUser: AuthUser = {
      id: payload?.id ?? 0,
      role,
      displayRole: toFrontendRole(role),
      fullName: full_name,
    };

    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    clearTokenCookie();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
