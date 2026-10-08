"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  register: (payload: RegisterPayload) => Promise<{ message: string; userId: number; requiresVerification: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasResolvedInitialLoad = useRef(false);

  // Re-syncs from the cookie on every navigation, not just once on mount.
  // Needed because this provider lives in the root layout and survives
  // across App Router navigations -- when proxy.ts's middleware redirects
  // an expired-token /dashboard/* request straight to /login, that's a
  // server-side redirect the already-mounted provider never re-runs this
  // effect for on its own ([] deps), so `user` kept holding the stale
  // pre-expiry value. /login's own "already logged in" guard
  // (if (authLoading || user) return null) then blocked the form forever,
  // since isLoading was already false and user was never cleared -- only a
  // hard refresh forced a true remount that re-read the real cookie state.
  // The setUser functional updates bail out to the same reference when
  // nothing actually changed, so a normal navigation while still validly
  // logged in doesn't force every useAuth() consumer to re-render (several,
  // e.g. DashboardHeader, re-fetch profile data keyed on `user`).
  useEffect(() => {
    // Syncing from document.cookie, an external browser API unavailable during
    // SSR — this can only run after mount, so setState-in-effect is correct here.
    const token = getTokenFromDocumentCookie();
    const payload = token ? decodeToken(token) : null;

    if (payload && !isTokenExpired(payload)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser((prev) =>
        prev && prev.id === payload.id && prev.role === payload.role
          ? prev
          : { id: payload.id, role: payload.role, displayRole: toFrontendRole(payload.role), fullName: null }
      );
    } else {
      if (token) clearTokenCookie();
      setUser((prev) => (prev === null ? prev : null));
    }

    if (!hasResolvedInitialLoad.current) {
      hasResolvedInitialLoad.current = true;
      setIsLoading(false);
    }
  }, [pathname]);

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
