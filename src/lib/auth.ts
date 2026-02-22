import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Call at the top of any API route handler that requires an admin session.
 * Returns null if authenticated, or a 401 NextResponse to return immediately.
 *
 * Usage:
 *   const unauth = await requireAdmin();
 *   if (unauth) return unauth;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}
