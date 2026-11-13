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
  // Resume Builder has no account-specific content of its own to protect,
  // but saving a draft does -- it was reachable by every signed-out visitor
  // through several entry points (the mobile bottom nav's "Resume" tab, the
  // footer's "Resume Builder" link, a direct URL) with no guard at all, each
  // of which would have needed its own client-side special-case otherwise
  // (the footer's "Post Resume" link already had one, for exactly this
  // reason -- see Footer.tsx). One middleware match covers all of them.
  matcher: ["/dashboard/:path*", "/resume-builder/:path*"],
};
