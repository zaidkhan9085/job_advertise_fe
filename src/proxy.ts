import { NextRequest, NextResponse } from "next/server";
import { decodeToken, isTokenExpired, TOKEN_COOKIE } from "@/lib/auth-token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const payload = token ? decodeToken(token) : null;

  if (!payload || isTokenExpired(payload)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
