import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  adminId?: string;
  username?: string;
  role?: string;
  isLoggedIn?: boolean;
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be defined in .env.local and be at least 32 characters long"
  );
}

export const sessionOptions = {
  cookieName: "infogrid_admin_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

/** Server-side helper — call inside Server Components and Route Handlers. */
export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  return session;
}
