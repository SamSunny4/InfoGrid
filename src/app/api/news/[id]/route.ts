import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadToR2, deleteFromR2 } from "@/lib/storage";
import { News } from "@/models/News";

type Params = { params: Promise<{ id: string }> };

// ─── GET one ─────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await News.findById(id);
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

// ─── PUT update ───────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const existing = await News.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title?.trim()) return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ success: false, message: "Description is required" }, { status: 400 });

    let { imageUrl, imagePath } = existing;

    if (imageFile && imageFile.size > 0) {
      // Delete old image
      if (existing.imagePath) await deleteFromR2(existing.imagePath);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = imageFile.name.split(".").pop();
      imagePath = `news/${uuidv4()}.${ext}`;
      imageUrl = await uploadToR2(buffer, imagePath, imageFile.type);
    }

    const updated = await News.findByIdAndUpdate(
      id,
      { title, description, imageUrl, imagePath },
      { new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await News.findById(id);
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (item.imagePath) await deleteFromR2(item.imagePath);
    await item.deleteOne();
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
