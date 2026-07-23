// The backend issues a plain JWT bearer token (no Set-Cookie). We store it in a
// client-readable cookie (not httpOnly) so both client components and the edge
// middleware can see it for route protection. The backend is still the only
// party that verifies the token's signature — this decode is read-only, for UX
// routing/display purposes, and must never be trusted as an auth check itself.

export const TOKEN_COOKIE = "token";

export interface TokenPayload {
  id: number;
  role: "candidate" | "employer" | "admin";
  exp: number;
  iat: number;
}

export function setTokenCookie(token: string) {
  const payload = decodeToken(token);
  const maxAge = payload ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0) : 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function getTokenFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload | null): boolean {
  if (!payload) return true;
  return payload.exp * 1000 <= Date.now();
}
