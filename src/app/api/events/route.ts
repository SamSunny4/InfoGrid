import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/lib/mongodb";
import { uploadToR2 } from "@/lib/storage";
import { Event } from "@/models/Event";

// ─── GET all events ──────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}

// ─── POST create event ───────────────────────────────────────────────────────
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
      imagePath = `events/${uuidv4()}.${ext}`;
      imageUrl = await uploadToR2(buffer, imagePath, imageFile.type);
    }

    const event = await Event.create({ title, description, imageUrl, imagePath });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
