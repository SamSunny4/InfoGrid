import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadToR2 } from "@/lib/storage";
import { QRCode } from "@/models/QRCode";

// ─── GET all QR codes ────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectToDatabase();
    const qrcodes = await QRCode.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: qrcodes });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// ─── POST create QR code ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData   = await request.formData();
    const title       = formData.get("title")       as string;
    const redirectUrl = formData.get("redirectUrl") as string | null;
    const isActive    = formData.get("isActive") !== "false"; // default true
    const imageFile   = formData.get("image")       as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ success: false, message: "QR image is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = imageFile.name.split(".").pop();
    const imagePath = `qrcodes/${uuidv4()}.${ext}`;
    const imageUrl = await uploadToR2(buffer, imagePath, imageFile.type);

    const qrcode = await QRCode.create({ title, imageUrl, imagePath, redirectUrl: redirectUrl?.trim() || "", isActive });
    return NextResponse.json({ success: true, data: qrcode }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
