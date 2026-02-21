import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { deleteFromR2 } from "@/lib/storage";
import { Poster } from "@/models/Poster";

type Params = { params: Promise<{ id: string }> };

// ─── GET one ─────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await Poster.findById(id);
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await Poster.findById(id);
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (item.imagePath) await deleteFromR2(item.imagePath);
    await item.deleteOne();
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
