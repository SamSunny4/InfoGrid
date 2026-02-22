import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";
import { sessionOptions } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  // Forward the pathname so Server Components / Layouts can read it
  response.headers.set("x-pathname", pathname);

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return response;

  // Login page is always accessible
  if (pathname === "/admin/login") return response;

  // Check session
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
