import { NextRequest, NextResponse } from "next/server";
import { uploadWorkPhoto } from "@/action/work-photo-actions";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { worksDetailId, status, base64Image, fileName, fileType, latitude, longitude } = data;

    if (!worksDetailId || !status || !base64Image) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await uploadWorkPhoto({
      worksDetailId,
      status,
      base64Image,
      fileName: `work_${worksDetailId}_${Date.now()}`,
      fileType: fileType || "image/jpeg",
      latitude,
      longitude
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
