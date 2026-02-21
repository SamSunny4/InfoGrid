import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadToGCS, deleteFromGCS } from "@/lib/storage";
import { News } from "@/models/News";

// ─── GET all news ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectToDatabase();
    const news = await News.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// ─── POST create news ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ success: false, message: "Description is required" }, { status: 400 });
    }

    let imageUrl = "";
    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = imageFile.name.split(".").pop();
      imagePath = `news/${uuidv4()}.${ext}`;
      imageUrl = await uploadToGCS(buffer, imagePath, imageFile.type);
    }

    const news = await News.create({ title, description, imageUrl, imagePath });
    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    await deleteFromGCS((error as { imagePath?: string }).imagePath ?? "").catch(() => {});
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
