import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";

/**
 * GET /api/admin/seed
 *
 * Creates the default administrator account if it does not already exist.
 * This route should be called once during initial setup, then removed or
 * protected in production.
 *
 * Default credentials:
 *   Username : administrator
 *   Password : ngdkses87q
 */
export async function GET() {
  try {
    await connectToDatabase();

    const existing = await Admin.findOne({ username: "administrator" });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Admin user already exists." },
        { status: 200 }
      );
    }

    const passwordHash = await bcrypt.hash("ngdkses87q", 12);

    await Admin.create({
      username: "administrator",
      passwordHash,
      role: "superadmin",
    });

    return NextResponse.json({
      ok: true,
      message: 'Admin user "administrator" created successfully.',
    });
  } catch (err) {
    console.error("[admin/seed]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
