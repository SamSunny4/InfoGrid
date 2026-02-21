import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadToGCS } from "@/lib/storage";
import { Poster } from "@/models/Poster";

// ─── GET all posters ─────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectToDatabase();
    const posters = await Poster.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posters });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// ─── POST upload poster ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, message: "Image is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = imageFile.name.split(".").pop();
    const imagePath = `posters/${uuidv4()}.${ext}`;
    const imageUrl = await uploadToGCS(buffer, imagePath, imageFile.type);

    const poster = await Poster.create({ imageUrl, imagePath });
    return NextResponse.json({ success: true, data: poster }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
