import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { authConfig } from "@/lib/auth.config";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (req.auth && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }

    if (!req.auth && !isLoginPage) {
      const loginUrl = new URL("/admin/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return;
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
