import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Update last login timestamp
    admin.lastLoginAt = new Date();
    await admin.save();

    // Write session
    const session = await getSession();
    session.adminId = (admin._id as string).toString();
    session.username = admin.username;
    session.role = admin.role;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, username: admin.username, role: admin.role });
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
